import { sign, verify } from "hono/jwt";
import {
  Result,
  ok,
  err,
  SafeUser,
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@khangviet/types";

const ACCESS_TOKEN_TTL = 900; // 15 phút
const REFRESH_TOKEN_TTL = 604800; // 7 ngày
const JWT_ALGORITHM = "HS256" as const;

export class TokenService {
  static async signAccessToken(
    user: SafeUser,
    secret: string
  ): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL,
    };
    return await sign(payload, secret, JWT_ALGORITHM);
  }

  static async signRefreshToken(
    userId: string,
    secret: string
  ): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL,
    };
    return await sign(payload, secret, JWT_ALGORITHM);
  }

  static async verifyAccessToken(
    token: string,
    secret: string
  ): Promise<Result<AccessTokenPayload, "INVALID_TOKEN">> {
    try {
      const decoded = (await verify(
        token,
        secret,
        JWT_ALGORITHM
      )) as unknown as AccessTokenPayload;
      if (!decoded.sub || !decoded.role) {
        return err("INVALID_TOKEN");
      }
      return ok(decoded);
    } catch {
      return err("INVALID_TOKEN");
    }
  }

  static async verifyRefreshToken(
    token: string,
    secret: string
  ): Promise<Result<RefreshTokenPayload, "INVALID_TOKEN">> {
    try {
      const decoded = (await verify(
        token,
        secret,
        JWT_ALGORITHM
      )) as unknown as RefreshTokenPayload;
      if (!decoded.sub) {
        return err("INVALID_TOKEN");
      }
      return ok(decoded);
    } catch {
      return err("INVALID_TOKEN");
    }
  }
}
