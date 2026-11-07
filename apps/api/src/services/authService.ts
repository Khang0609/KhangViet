import { Result, ok, err, LoginCredentials, SafeUser } from "@khangviet/types";
import { getRepositories } from "@khangviet/repositories";
import { PasswordService } from "./passwordService";
import { TokenService } from "./tokenService";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export class AuthService {
  private static userRepo = getRepositories().user;

  static async login(
    creds: LoginCredentials,
    secret: string
  ): Promise<Result<AuthSession, string>> {
    const user = await this.userRepo.findByEmail(creds.email);
    if (!user) {
      return err("Sai email hoặc mật khẩu");
    }

    const isValid = await PasswordService.verifyPassword(
      creds.password,
      user.password
    );
    if (!isValid) {
      return err("Sai email hoặc mật khẩu");
    }

    const { password, ...safeUser } = user;
    const accessToken = await TokenService.signAccessToken(safeUser, secret);
    const refreshToken = await TokenService.signRefreshToken(safeUser.id, secret);

    return ok({ accessToken, refreshToken, user: safeUser });
  }

  static async refresh(
    refreshToken: string,
    secret: string
  ): Promise<Result<{ accessToken: string; refreshToken: string }, string>> {
    const tokenResult = await TokenService.verifyRefreshToken(
      refreshToken,
      secret
    );
    if (!tokenResult.success) {
      return err("Refresh token không hợp lệ hoặc đã hết hạn");
    }

    const safeUser = await this.userRepo.findSafeById(tokenResult.data.sub);
    if (!safeUser) {
      return err("Tài khoản người dùng không tồn tại");
    }

    const newAccessToken = await TokenService.signAccessToken(safeUser, secret);
    const newRefreshToken = await TokenService.signRefreshToken(
      safeUser.id,
      secret
    );

    return ok({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  }
}

