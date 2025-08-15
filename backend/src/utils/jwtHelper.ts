import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15m", // Thời gian sống ngắn
    }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d", // Thời gian sống dài
    }
  );

  return { accessToken, refreshToken };
};
