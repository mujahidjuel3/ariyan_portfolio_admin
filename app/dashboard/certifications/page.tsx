import { requireAdmin } from "@/helpers/require-admin";
import CertificationsPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/certifications");
  return <CertificationsPage />;
}
