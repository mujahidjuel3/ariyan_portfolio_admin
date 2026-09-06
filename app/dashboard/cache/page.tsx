import { requireAdmin } from "@/helpers/require-admin";
import CachePage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/cache");
  return <CachePage />;
}
