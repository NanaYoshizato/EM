import { Stack, Title } from "@mantine/core";
import Summary from "@/features/home/components/Summary";
import Notice from "@/features/home/components/Notice";
import Memo from "@/features/home/components/Memo";

export default function HomePage() {
  return (
    <Stack gap={40} maw={600} pl={30}>
      <Title order={3}>ホーム</Title>
      <Stack gap={30} pl={40}>
        <Summary />
        <Notice />
        <Memo />
      </Stack>
    </Stack>
  );
}