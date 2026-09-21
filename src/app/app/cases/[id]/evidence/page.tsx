import { redirect } from "next/navigation";

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/app/cases/${id}/lifecycle`);
}
