import { requireAdmin } from "@/helpers/require-admin";
import StackPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/stack");
  return <StackPage />;
}
