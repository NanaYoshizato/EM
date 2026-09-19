import { User } from "./domain/user";
import { authAdmin } from "@/lib/firebase";
import { getEmployeeSummaryByUserId } from "../employees/service";

/** ログインのロジック */
export const loginService = async (idToken: string) => {
  const decodedToken = await authAdmin.verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  const user = await User.findByFirebaseUid(uid);

  // ユーザーが見つからない場合エラー
  if (!user || !user.isActive()) {
    return { code: "RESOURCE_NOT_FOUND" as const, message: "emailまたはパスワードが間違っています。" }
  }

  // IDトークンが盗用された場合の攻撃可能時間を最小限に抑えるため、cookieの確認に５分以上かかる場合エラー
  if (new Date().getTime() / 1000 - decodedToken.auth_time >= 5 * 60) {
    return { code: "STALE_TOKEN" as const } // TODO: エラーメッセージは仮
  }

  // cookieを作成して返す
  const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });
  return { code: "SUCCESS" as const, sessionCookie };
};

/** TODO: 登録機能は後回しのためロジックは後日修正*/
export const registerService = async (idToken: string) => {
  return { idToken };
};

/** ログアウトのロジック */
export const logoutService = async (sessionCookie?: string) => {
  if (!sessionCookie) return null;
  try {
    const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie);
    return await authAdmin.revokeRefreshTokens(decodedClaims.sub);
  } catch {

  }
};

/** ログインユーザー情報のロジック */
export const meService = async (sessionCookie?: string) => {
  if (!sessionCookie) return null;
  try {
    const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie, true);
    const user = await User.findByFirebaseUid(decodedClaims.sub);
    if (!user || !user.isActive()) return null;

    // 外部へアクセス
    const employee = await getEmployeeSummaryByUserId(user.id);
    return {
      id: user.id,
      email: user.email,
      role: user.roleName,
      employee,
    }
  } catch (err) {
    return null;
  }
};
