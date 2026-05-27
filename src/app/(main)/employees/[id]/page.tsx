import EmployeeDetail from "@/features/employees/components/EmployeeDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params;
  return <EmployeeDetail id={id} />;
}
