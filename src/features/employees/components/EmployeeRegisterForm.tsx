"use client";

import {
  TextInput,
  Button,
  ActionIcon,
  Stack,
  Title,
  Alert,
  Group,
  Radio,
  Select,
  Text,
  Divider,
  Grid,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEmployeeRegister } from "../hooks/useEmployeeRegister";
import { usePostalCode } from "../hooks/usePostalCode";

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

/** ラベル左・入力右のレイアウト行 */
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Grid align="center" gutter="xs">
      <Grid.Col span={3}>
        <Text size="sm">{label}</Text>
      </Grid.Col>
      <Grid.Col span={9}>{children}</Grid.Col>
    </Grid>
  );
}

/** 期間入力（開始〜終了） */
function PeriodInput({
  startProps,
  endProps,
}: {
  startProps: React.ComponentProps<typeof TextInput>;
  endProps: React.ComponentProps<typeof TextInput>;
}) {
  return (
    <Group gap="xs" align="center">
      <TextInput type="date" style={{ flex: 1 }} {...startProps} />
      <Text size="sm">〜</Text>
      <TextInput type="date" style={{ flex: 1 }} {...endProps} />
    </Group>
  );
}

export default function EmployeeRegisterForm() {
  const { form, onSubmit, error, isConfirming, cancelConfirm } = useEmployeeRegister();
  const router = useRouter();

  useEffect(() => {
    if (isConfirming) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isConfirming]);
  const { fetchAddress, loading: postalLoading, error: postalError } = usePostalCode();

  const handlePostalSearch = async () => {
    const result = await fetchAddress(form.values.postalCode ?? "");
    if (result) {
      form.setFieldValue("prefecture", result.prefecture);
      form.setFieldValue("city", result.city);
      form.setFieldValue("streetAddress", result.town);
    }
  };

  return (
    <Stack px={80} pb={60} style={{ gap: 30, maxWidth: 800 }}>
      <Title order={2}>社員登録</Title>

      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="xl">

          <fieldset disabled={isConfirming} style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
            <Stack gap="xl">
                {/* ===== 基本情報 ===== */}
              <Stack gap="xs">
                <Text fw={600} size="sm">基本情報</Text>
                <Divider />
                <Stack gap="sm" pt="xs">
                  <FormRow label="氏名">
                    <TextInput placeholder="山田 太郎" {...form.getInputProps("name")} />
                  </FormRow>
                  <FormRow label="フリガナ">
                    <TextInput placeholder="ヤマダ タロウ" {...form.getInputProps("furigana")} />
                  </FormRow>
                  <FormRow label="生年月日">
                    <TextInput type="date" style={{ width: 180 }} {...form.getInputProps("birthDate")} />
                  </FormRow>
                  <FormRow label="性別">
                    <Radio.Group {...form.getInputProps("gender")}>
                      <Group gap="md">
                        <Radio value="男性" label="男性" />
                        <Radio value="女性" label="女性" />
                        <Radio value="その他" label="その他" />
                      </Group>
                    </Radio.Group>
                  </FormRow>
                  <FormRow label="電話番号">
                    <TextInput placeholder="09000000000" style={{ width: 240 }} {...form.getInputProps("phone")} />
                  </FormRow>
                  <FormRow label="メールアドレス">
                    <TextInput placeholder="example@example.com" {...form.getInputProps("email")} />
                  </FormRow>
                  <FormRow label="入社日">
                    <TextInput type="date" style={{ width: 180 }} {...form.getInputProps("joinDate")} />
                  </FormRow>
                  <FormRow label="研修終了日">
                    <TextInput type="date" style={{ width: 180 }} {...form.getInputProps("trainingEndDate")} />
                  </FormRow>
                  <FormRow label="研修中の言語">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="xs" wrap="wrap" style={{ flex: 1 }}>
                        {form.values.trainingLanguages.map((_, index) => (
                          <TextInput
                            key={index}
                            style={{ flex: 1, minWidth: 80 }}
                            rightSection={
                              form.values.trainingLanguages.length > 1 ? (
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => form.removeListItem("trainingLanguages", index)}
                                >
                                  <IconX size={10} />
                                </ActionIcon>
                              ) : null
                            }
                            {...form.getInputProps(`trainingLanguages.${index}`)}
                          />
                        ))}
                      </Group>
                      <ActionIcon
                        variant="outline"
                        onClick={() => form.insertListItem("trainingLanguages", "")}
                        title="追加"
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </FormRow>
                  <FormRow label="使用可能言語">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="xs" wrap="wrap" style={{ flex: 1 }}>
                        {form.values.availableLanguages.map((_, index) => (
                          <TextInput
                            key={index}
                            style={{ flex: 1, minWidth: 80 }}
                            rightSection={
                              form.values.availableLanguages.length > 1 ? (
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => form.removeListItem("availableLanguages", index)}
                                >
                                  <IconX size={10} />
                                </ActionIcon>
                              ) : null
                            }
                            {...form.getInputProps(`availableLanguages.${index}`)}
                          />
                        ))}
                      </Group>
                      <ActionIcon
                        variant="outline"
                        onClick={() => form.insertListItem("availableLanguages", "")}
                        title="追加"
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </FormRow>

                  <FormRow label="前職企業名1">
                    <TextInput {...form.getInputProps("previousCompany1Name")} />
                  </FormRow>
                  <FormRow label="勤務期間">
                    <PeriodInput
                      startProps={form.getInputProps("previousCompany1StartDate")}
                      endProps={form.getInputProps("previousCompany1EndDate")}
                    />
                  </FormRow>

                  <FormRow label="前職企業名2">
                    <TextInput {...form.getInputProps("previousCompany2Name")} />
                  </FormRow>
                  <FormRow label="勤務期間">
                    <PeriodInput
                      startProps={form.getInputProps("previousCompany2StartDate")}
                      endProps={form.getInputProps("previousCompany2EndDate")}
                    />
                  </FormRow>

                  <FormRow label="前職企業名3">
                    <TextInput {...form.getInputProps("previousCompany3Name")} />
                  </FormRow>
                  <FormRow label="勤務期間">
                    <PeriodInput
                      startProps={form.getInputProps("previousCompany3StartDate")}
                      endProps={form.getInputProps("previousCompany3EndDate")}
                    />
                  </FormRow>

                  <FormRow label={"所定労働時間\n（一週間）"}>
                    <TextInput style={{ width: 120 }} {...form.getInputProps("weeklyWorkHours")} />
                  </FormRow>
                  <FormRow label={"月額見込総支給額\n（交通費含む）"}>
                    <TextInput style={{ width: 200 }} {...form.getInputProps("monthlyEstimatedSalary")} />
                  </FormRow>
                </Stack>
              </Stack>

              {/* ===== 住所 ===== */}
              <Stack gap="xs">
                <Text fw={600} size="sm">住所</Text>
                <Divider />
                <Stack gap="sm" pt="xs">
                  <FormRow label="郵便番号">
                    <Stack gap={4}>
                      <Group gap="xs">
                        <TextInput placeholder="000-0000" style={{ width: 150 }} {...form.getInputProps("postalCode")} />
                        <Button variant="outline" size="sm" loading={postalLoading} onClick={handlePostalSearch}>
                          住所検索
                        </Button>
                      </Group>
                      {postalError && <Text size="xs" c="red">{postalError}</Text>}
                    </Stack>
                  </FormRow>
                  <FormRow label="都道府県">
                    <Select
                      data={PREFECTURES}
                      placeholder="選択してください"
                      style={{ width: 180 }}
                      {...form.getInputProps("prefecture")}
                    />
                  </FormRow>
                  <FormRow label="市区町村">
                    <TextInput {...form.getInputProps("city")} />
                  </FormRow>
                  <FormRow label="番地・建物名">
                    <TextInput {...form.getInputProps("streetAddress")} />
                  </FormRow>
                </Stack>
              </Stack>

              {/* ===== 緊急連絡先など ===== */}
              <Stack gap="xs">
                <Text fw={600} size="sm">緊急連絡先など</Text>
                <Divider />
                <Stack gap="sm" pt="xs">
                  <FormRow label="氏名">
                    <TextInput {...form.getInputProps("emergencyContactName")} />
                  </FormRow>
                  <FormRow label="続柄">
                    <TextInput {...form.getInputProps("emergencyContactRelationship")} />
                  </FormRow>
                  <FormRow label="電話番号">
                    <TextInput style={{ width: 240 }} {...form.getInputProps("emergencyContactPhone")} />
                  </FormRow>
                  <FormRow label="配偶者">
                    <Radio.Group {...form.getInputProps("hasSpouse")}>
                      <Group gap="md">
                        <Radio value="有" label="有" />
                        <Radio value="無" label="無" />
                      </Group>
                    </Radio.Group>
                  </FormRow>
                  <FormRow label="子供">
                    <Radio.Group {...form.getInputProps("hasChildren")}>
                      <Group gap="md">
                        <Radio value="有" label="有" />
                        <Radio value="無" label="無" />
                      </Group>
                    </Radio.Group>
                  </FormRow>
                  <FormRow label="扶養家族">
                    <Radio.Group {...form.getInputProps("hasDependents")}>
                      <Group gap="md">
                        <Radio value="有" label="有" />
                        <Radio value="無" label="無" />
                      </Group>
                    </Radio.Group>
                  </FormRow>
                </Stack>
              </Stack>

              {/* ===== 機密情報 ===== */}
              <Stack gap="xs">
                <Text fw={600} size="sm">機密情報</Text>
                <Divider />
                <Stack gap="sm" pt="xs">
                  <FormRow label="マイナンバー">
                    <TextInput {...form.getInputProps("myNumber")} />
                  </FormRow>
                  <FormRow label="雇用保険被保険者番号">
                    <TextInput {...form.getInputProps("employmentInsuranceNumber")} />
                  </FormRow>
                  <FormRow label="基礎年金番号">
                    <TextInput {...form.getInputProps("basicPensionNumber")} />
                  </FormRow>
                  <FormRow label="給与振込口座">
                    <TextInput {...form.getInputProps("salaryAccount")} />
                  </FormRow>
                </Stack>
              </Stack>
            </Stack>
          </fieldset>

          {/* ===== ボタン ===== */}
          <Group justify="center" gap="md" pt="md">
            <Button variant="default" onClick={() => isConfirming ? cancelConfirm() : router.push("/employees")}>
              {isConfirming ? "登録に戻る" : "キャンセル"}
            </Button>
            <Button type="submit" loading={form.submitting}>
              {isConfirming ? "登録する" : "登録確認へ進む"}
            </Button>
          </Group>

        </Stack>
      </form>
    </Stack>
  );
}
