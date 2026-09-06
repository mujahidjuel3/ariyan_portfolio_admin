import { requireAdmin } from "@/helpers/require-admin";
import AboutPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/about");
  return <AboutPage />;
}
