import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_KEY } from "@/helpers/storage";

/**
 * Server-side dashboard gate. Reads the same admin_token cookie used previously
 * by middleware. Pass an explicit known dashboard path for the login `from` param.
 */
export async function requireAdmin(fromPath: string): Promise<void> {
  const token = (await cookies()).get(TOKEN_KEY)?.value;
  if (!token) {
    redirect(`/login?from=${encodeURIComponent(fromPath)}`);
  }
}
