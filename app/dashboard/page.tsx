import { requireAdmin } from "@/helpers/require-admin";
import DashboardPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard");
  return <DashboardPage />;
}
