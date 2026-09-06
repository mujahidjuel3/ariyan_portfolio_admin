import { requireAdmin } from "@/helpers/require-admin";
import ContactPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/contact");
  return <ContactPage />;
}
