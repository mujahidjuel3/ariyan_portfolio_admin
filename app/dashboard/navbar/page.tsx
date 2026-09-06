import { requireAdmin } from "@/helpers/require-admin";
import NavbarPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/navbar");
  return <NavbarPage />;
}
