"use client";

import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Center,
  Text,
  Alert,
} from "@mantine/core";
import Link from "next/link";

import { messages } from "../../../constants/messages";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
  const { form, onSubmit, error } = useLogin();

  return (
    <Center h="100vh" className="min-h-[calc(100vh-72px)] bg-gray-50 px-4">
      <Stack className="max-w-[600px] w-full" gap="xl">
        <Card shadow="sm" padding="xl" radius="md">
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              <Title order={3} ta="center">
                {messages.login.login}
              </Title>

              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                label={messages.login.email}
                placeholder={messages.login.emailPlaceholder}
                {...form.getInputProps("email")}
              />
              {/* TODO: あとで消す */}
              <p>test@example.com</p>

              <PasswordInput
                label={messages.login.password}
                placeholder={messages.login.passwordPlaceholder}
                {...form.getInputProps("password")}
              />
              {/* TODO: あとで消す */}
              <p>password123</p>

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