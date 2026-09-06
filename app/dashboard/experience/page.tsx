import { requireAdmin } from "@/helpers/require-admin";
import ExperiencePage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/experience");
  return <ExperiencePage />;
}
