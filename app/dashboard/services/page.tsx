import { requireAdmin } from "@/helpers/require-admin";
import ServicesPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/services");
  return <ServicesPage />;
}
