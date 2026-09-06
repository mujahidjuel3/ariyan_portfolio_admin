import { redirect } from "next/navigation";
import { requireAdmin } from "@/helpers/require-admin";

export default async function Home() {
  await requireAdmin("/dashboard");
  redirect("/dashboard");
}
