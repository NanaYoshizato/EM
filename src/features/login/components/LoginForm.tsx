"use client";

import { useRouter } from "next/navigation";
import { useForm, zodResolver } from "@mantine/form";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Center,
  Text,
} from "@mantine/core";
import Link from "next/link";

import { messages } from "../../../constants/messages";
import { LoginFormValues, loginSchema } from "../schemas/loginSchema";

export default function LoginForm() {
  const router = useRouter();

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

      return result.error.flatten().fieldErrors;
    },
  });

  /**
   * ログインボタン押下時の処理
   */
  const onSubmit = async (values: LoginFormValues) => {
    try {
      // TODO: 実際のログインAPI処理をここに実装
      // ログイン成功時にダッシュボードへ遷移
      alert("ログイン処理");

    } catch {
      alert("ログインに失敗しました");
    }
  };

  return (
    <Center h="100vh" className="min-h-[calc(100vh-72px)] bg-gray-50 px-4">
      <Stack className="max-w-[600px] w-full" gap="xl">
        <Card shadow="sm" padding="xl" radius="md">
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              <Title order={3} ta="center">
                {messages.login.login}
              </Title>

              <TextInput
                label={messages.login.email}
                placeholder={messages.login.emailPlaceholder}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label={messages.login.password}
                placeholder={messages.login.passwordPlaceholder}
                {...form.getInputProps("password")}
              />

              <Button type="submit" fullWidth loading={form.submitting} mt="md">
                {messages.login.login}
              </Button>
            </Stack>
          </form>
        </Card>

        <Text ta="center" size="sm">
          <Link href="/forgot-password">{messages.login.forgotPassword}</Link>
        </Text>
      </Stack>
    </Center>
  );
}
