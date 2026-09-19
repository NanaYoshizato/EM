import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-em-project",
};

// アプリの初期化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// エミュレータのホストが指定されている場合、またはローカル開発時は接続する
// (Docker本番ビルドではNODE_ENVが強制的にproductionになるため、NODE_ENVでは判定できない)
const emulatorHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ||
  (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:9099" : undefined);

if (emulatorHost) {
  connectAuthEmulator(auth, emulatorHost, { disableWarnings: true });
}
