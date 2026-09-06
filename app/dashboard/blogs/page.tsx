import { requireAdmin } from "@/helpers/require-admin";
import BlogsPage from "./client";

export default async function Page() {
  await requireAdmin("/dashboard/blogs");
  return <BlogsPage />;
}
