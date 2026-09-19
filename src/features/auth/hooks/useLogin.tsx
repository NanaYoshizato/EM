import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { login } from "../api/login";
import { loginSchema, LoginFormValues } from "../schemas/loginSchema";
import { z } from "zod";

export default function useLogin() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const result = loginSchema.safeParse(values);

      if (result.success) {
        return {};
      }

      return z.flattenError(result.error).fieldErrors;
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError("");

    try {
      // Firebase Authentication でログイン認証
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );


      const idToken = await userCredential.user.getIdToken();

      await login(idToken);

      router.push("/");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ログインに失敗しました");
      }
    }
  };

  return { form, onSubmit, error };
}