import { useState, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  type Node,
  type Edge,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import apiService from "../../services/apiService";
import type { IFamilyMember } from "../../interfaces";
import { Spin, Alert } from "antd";
import dagre from "dagre";

import FamilyTreeNode, {
  type FamilyTreeNodeData,
} from "./components/FamilyTreeNode";
import FamilyMemberDetailDrawer from "./components/FamilyMemberDetailDrawer";

// Các hàm fetchFamilyMembers, dagreGraph, getLayoutedElements không thay đổi
const fetchFamilyMembers = async (): Promise<IFamilyMember[]> => {
  const { data } = await apiService.get("/family-members");
  return data;
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const nodeWidth = 180;
  const nodeHeight = 125;
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    const width = node.id.startsWith("union-") ? nodeWidth * 2 + 80 : nodeWidth;
    dagreGraph.setNode(node.id, { width, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedPositions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (nodeWithPosition) {
      const width = node.id.startsWith("union-")
        ? nodeWidth * 2 + 80
        : nodeWidth;
      layoutedPositions.set(node.id, {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      });
    }
  });
  return layoutedPositions;
};

// =========================================================================
// === HÀM CHUYỂN ĐỔI DỮ LIỆU ĐÃ ĐƯỢC VIẾT LẠI VỚI LOGIC PHÂN CẤP MỚI ===
// =========================================================================
const transformDataToFlow = (
  members: IFamilyMember[]
): { nodes: Node<FamilyTreeNodeData>[]; edges: Edge[] } => {
  if (!members || members.length === 0) return { nodes: [], edges: [] };

  const membersMap = new Map(members.map((m) => [m._id, m]));

  const createConsistentUnionId = (id1: string, id2: string) => {
    return id1 < id2 ? `union-${id1}-${id2}` : `union-${id2}-${id1}`;
  };

  // --- BƯỚC 1: XÁC ĐỊNH CÁC "CỤM GIA ĐÌNH" (LAYOUT NODES) ---
  // Mỗi thành viên sẽ thuộc về một "cụm" (hoặc là cụm hôn nhân, hoặc là chính họ nếu độc thân)
  const memberIdToLayoutNodeId = new Map<string, string>();
  const layoutNodeIds = new Set<string>();
  const processedMembersForUnions = new Set<string>();

  members.forEach((member) => {
    if (processedMembersForUnions.has(member._id)) return;
    const spouseId = member.spouse?.[0];

    if (spouseId && membersMap.has(spouseId)) {
      // Nếu có vợ/chồng, họ thuộc về một "cụm hôn nhân"
      const unionId = createConsistentUnionId(member._id, spouseId);
      memberIdToLayoutNodeId.set(member._id, unionId);
      memberIdToLayoutNodeId.set(spouseId, unionId);
      layoutNodeIds.add(unionId);
      processedMembersForUnions.add(member._id);
      processedMembersForUnions.add(spouseId);
    } else {
      // Nếu độc thân, "cụm" chính là bản thân họ
      memberIdToLayoutNodeId.set(member._id, member._id);
      layoutNodeIds.add(member._id);
      processedMembersForUnions.add(member._id);
    }
  });
  const layoutNodes: Node[] = Array.from(layoutNodeIds).map((id) => ({
    id,
    position: { x: 0, y: 0 },
    data: {},
  }));

  // --- BƯỚC 2: XÂY DỰNG CÁC CẠNH PHÂN CẤP GIỮA CÁC "CỤM" ---
  const layoutEdges: Edge[] = [];
  members.forEach((parent) => {
    parent.children?.forEach((childId) => {
      const parentLayoutNodeId = memberIdToLayoutNodeId.get(parent._id);
      const childLayoutNodeId = memberIdToLayoutNodeId.get(childId);

      if (
        parentLayoutNodeId &&
        childLayoutNodeId &&
        parentLayoutNodeId !== childLayoutNodeId
      ) {
        layoutEdges.push({
          id: `layout-edge-${parentLayoutNodeId}-${childLayoutNodeId}`,
          source: parentLayoutNodeId,
          target: childLayoutNodeId,
        });
      }
    });
  });

  // --- BƯỚC 3: CHẠY DAGRE ĐỂ TÍNH VỊ TRÍ CÁC "CỤM" ---
  const layoutedPositions = getLayoutedElements(layoutNodes, layoutEdges);

  // --- BƯỚC 4: TẠO NODE THẬT CHO REACT FLOW VÀ GÁN VỊ TRÍ ---
  const finalNodes: Node<FamilyTreeNodeData>[] = members.map((member) => {
    const layoutNodeId = memberIdToLayoutNodeId.get(member._id)!;
    const layoutNodePosition = layoutedPositions.get(layoutNodeId)!;
    let finalPosition = { ...layoutNodePosition };

    // Nếu là thành viên của một "cụm hôn nhân", điều chỉnh vị trí sang trái/phải
    if (layoutNodeId.startsWith("union-")) {
      const spouseId = member.spouse![0];
      const offsetValue = 130; // Khoảng cách giữa vợ và chồng
      const offsetX = member._id < spouseId ? -offsetValue : offsetValue;
      finalPosition = {
        x: layoutNodePosition.x + offsetValue + offsetX,
        y: layoutNodePosition.y,
      };
    }

    return {
      id: member._id,
      type: "familyTreeNode",
      position: finalPosition,
      data: {
        name: member.name,
        avatar: member.avatar,
        birthDate: member.birthDate,
        deathDate: member.deathDate,
        gender: member.gender,
      },
    };
  });

  // --- BƯỚC 5: TẠO CÁC CẠNH HIỂN THỊ THẬT CHO REACT FLOW ---
  const finalEdges: Edge[] = [];
  members.forEach((member) => {
    member.children?.forEach((childId) => {
      finalEdges.push({
        id: `e-${member._id}-${childId}`,
        source: member._id,
        target: childId,
        type: "smoothstep",
        style: { stroke: "#b1b1b7", strokeWidth: 1.5 },
      });
    });
    member.spouse?.forEach((spouseId) => {
      if (member._id < spouseId) {
        finalEdges.push({
          id: `e-${member._id}-${spouseId}`,
          source: member._id,
          target: spouseId,
          sourceHandle: "spouse-right",
          targetHandle: "spouse-left",
          type: "smoothstep",
          style: { stroke: "#c43a73", strokeWidth: 1.5 },
        });
      }
    });
  });

  return { nodes: finalNodes, edges: finalEdges };
};

// --- Component Chính (Không thay đổi) ---
const FamilyTreePageContent = () => {
  const [selectedMember, setSelectedMember] = useState<IFamilyMember | null>(
    null
  );
  const nodeTypes = useMemo(() => ({ familyTreeNode: FamilyTreeNode }), []);

  const {
    data: members,
    isLoading,
    error,
  } = useQuery<IFamilyMember[]>({
    queryKey: ["familyMembers"],
    queryFn: fetchFamilyMembers,
  });

  const { nodes, edges } = useMemo(
    () => transformDataToFlow(members || []),
    [members]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const memberData = members?.find((m) => m._id === node.id);
    if (memberData) {
      setSelectedMember(memberData);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang dựng cây gia phả..." />
      </div>
    );
  }
  if (error) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải dữ liệu cây gia phả."
        type="error"
        showIcon
      />
    );
  }

  if (nodes.length === 0) {
    return (
      <Alert
        message="Chưa có dữ liệu"
        description="Hãy thêm thành viên vào gia phả để bắt đầu."
        type="info"
        showIcon
      />
    );
  }

  return (
    <>
      <div
        style={{
          height: "calc(100vh - 200px)",
          width: "100%",
          border: "1px solid #eee",
          borderRadius: "8px",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap zoomable pannable />
          <Controls />
          <Background gap={24} size={1} color="#e2e2e2" />
        </ReactFlow>
      </div>

      <FamilyMemberDetailDrawer
        member={selectedMember}
        allMembers={members || []}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
};

const FamilyTreePage = () => (
  <ReactFlowProvider>
    <FamilyTreePageContent />
  </ReactFlowProvider>
);

export default FamilyTreePage;
