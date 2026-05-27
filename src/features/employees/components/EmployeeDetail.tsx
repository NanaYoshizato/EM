"use client";

import {
  Stack,
  Title,
  Text,
  Divider,
  Grid,
  Button,
  Alert,
  Center,
  Loader,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";

const EMPTY = "―";

function formatArrayField(values: string[]): string {
  const filtered = values.filter((v) => v.trim() !== "");
  return filtered.length > 0 ? filtered.join("・") : EMPTY;
}

function formatPeriod(start?: string, end?: string): string {
  if (!start && !end) return EMPTY;
  return `${start ?? EMPTY} 〜 ${end ?? EMPTY}`;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Grid align="center" gutter="xs">
      <Grid.Col span={3}>
        <Text size="sm" c="dimmed">{label}</Text>
      </Grid.Col>
      <Grid.Col span={9}>
        <Text size="sm">{value || EMPTY}</Text>
      </Grid.Col>
    </Grid>
  );
}

type Props = {
  id: string;
};

export default function EmployeeDetail({ id }: Props) {
  const { employee, loading, error } = useEmployeeDetail(id);
  const router = useRouter();

  if (loading) {
    return <Center py="xl"><Loader /></Center>;
  }

  if (error || !employee) {
    return (
      <Stack px={80} pt={40}>
        <Alert color="red" variant="light">{error || "社員情報が見つかりませんでした"}</Alert>
        <Button variant="default" w="fit-content" onClick={() => router.push("/employees")}>
          戻る
        </Button>
      </Stack>
    );
  }

  return (
    <Stack px={80} pb={60} style={{ gap: 30, maxWidth: 800 }}>
      {/* タイトル */}
      <Title order={2}>社員詳細</Title>

      {/* 基本情報 */}
      <Stack gap="xs">
        <Text fw={600} size="sm">基本情報</Text>
        <Divider />
        <Stack gap="sm" pt="xs">
          <DetailRow label="氏名" value={employee.name} />
          <DetailRow label="フリガナ" value={employee.furigana} />
          <DetailRow label="生年月日" value={employee.birthDate} />
          <DetailRow label="性別" value={employee.gender} />
          <DetailRow label="電話番号" value={employee.phone} />
          <DetailRow label="メールアドレス" value={employee.email} />
          <DetailRow label="入社日" value={employee.joinDate} />
          <DetailRow label="研修終了日" value={employee.trainingEndDate} />
          <DetailRow label="研修中の言語" value={formatArrayField(employee.trainingLanguages)} />
          <DetailRow label="使用可能言語" value={formatArrayField(employee.availableLanguages)} />
          <DetailRow label="前職企業名1" value={employee.previousCompany1Name} />
          <DetailRow
            label="勤務期間"
            value={formatPeriod(employee.previousCompany1StartDate, employee.previousCompany1EndDate)}
          />
          <DetailRow label="前職企業名2" value={employee.previousCompany2Name} />
          <DetailRow
            label="勤務期間"
            value={formatPeriod(employee.previousCompany2StartDate, employee.previousCompany2EndDate)}
          />
          <DetailRow label="前職企業名3" value={employee.previousCompany3Name} />
          <DetailRow
            label="勤務期間"
            value={formatPeriod(employee.previousCompany3StartDate, employee.previousCompany3EndDate)}
          />
          <DetailRow label="所定労働時間（一週間）" value={employee.weeklyWorkHours} />
          <DetailRow label="月額見込総支給額（交通費含む）" value={employee.monthlyEstimatedSalary} />
        </Stack>
      </Stack>

      {/* 住所 */}
      <Stack gap="xs">
        <Text fw={600} size="sm">住所</Text>
        <Divider />
        <Stack gap="sm" pt="xs">
          <DetailRow label="郵便番号" value={employee.postalCode} />
          <DetailRow label="都道府県" value={employee.prefecture} />
          <DetailRow label="市区町村" value={employee.city} />
          <DetailRow label="番地・建物名" value={employee.streetAddress} />
        </Stack>
      </Stack>

      {/* 緊急連絡先など */}
      <Stack gap="xs">
        <Text fw={600} size="sm">緊急連絡先など</Text>
        <Divider />
        <Stack gap="sm" pt="xs">
          <DetailRow label="氏名" value={employee.emergencyContactName} />
          <DetailRow label="続柄" value={employee.emergencyContactRelationship} />
          <DetailRow label="電話番号" value={employee.emergencyContactPhone} />
          <DetailRow label="配偶者" value={employee.hasSpouse} />
          <DetailRow label="子供" value={employee.hasChildren} />
          <DetailRow label="扶養家族" value={employee.hasDependents} />
        </Stack>
      </Stack>

      {/* 機密情報 */}
      <Stack gap="xs">
        <Text fw={600} size="sm">機密情報</Text>
        <Divider />
        <Stack gap="sm" pt="xs">
          <DetailRow label="マイナンバー" value={employee.myNumber} />
          <DetailRow label="雇用保険被保険者番号" value={employee.employmentInsuranceNumber} />
          <DetailRow label="基礎年金番号" value={employee.basicPensionNumber} />
          <DetailRow label="給与振込口座" value={employee.salaryAccount} />
        </Stack>
      </Stack>

      {/* 戻るボタン */}
      <Button variant="default" w="fit-content" onClick={() => router.push("/employees")}>
        戻る
      </Button>
    </Stack>
  );
}
