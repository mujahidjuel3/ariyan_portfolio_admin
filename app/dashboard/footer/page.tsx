import { requireAdmin } from "@/helpers/require-admin";
import FooterPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/footer");
  return <FooterPage />;
}
