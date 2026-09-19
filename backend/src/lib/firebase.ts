import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// 開発時、環境変数が指定されていない場合はローカルエミュレータを参照する
// (本番ではNODE_ENV==="production"になるため、未設定でもエミュレータには接続しない)
if (process.env.NODE_ENV !== "production" && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
}

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.GCLOUD_PROJECT || "demo-em-project",
  });
}

export const authAdmin = getAuth();
