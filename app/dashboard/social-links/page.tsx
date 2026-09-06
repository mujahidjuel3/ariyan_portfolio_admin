import { requireAdmin } from "@/helpers/require-admin";
import SocialLinksPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/social-links");
  return <SocialLinksPage />;
}
