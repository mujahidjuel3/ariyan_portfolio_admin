import { requireAdmin } from "@/helpers/require-admin";
import SettingsPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/settings");
  return <SettingsPage />;
}
