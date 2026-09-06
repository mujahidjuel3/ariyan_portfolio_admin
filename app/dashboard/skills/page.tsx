import { requireAdmin } from "@/helpers/require-admin";
import SkillsPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/skills");
  return <SkillsPage />;
}
