import { requireAdmin } from "@/helpers/require-admin";
import ProjectsPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/projects");
  return <ProjectsPage />;
}
