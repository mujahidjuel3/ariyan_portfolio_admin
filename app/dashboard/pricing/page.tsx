import { requireAdmin } from "@/helpers/require-admin";
import PricingPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/pricing");
  return <PricingPage />;
}
