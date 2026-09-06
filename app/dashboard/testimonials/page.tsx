import { requireAdmin } from "@/helpers/require-admin";
import TestimonialsPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/testimonials");
  return <TestimonialsPage />;
}
