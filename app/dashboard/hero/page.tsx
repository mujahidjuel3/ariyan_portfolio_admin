import { requireAdmin } from "@/helpers/require-admin";
import HeroPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/hero");
  return <HeroPage />;
}
