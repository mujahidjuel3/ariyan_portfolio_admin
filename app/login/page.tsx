"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense } from "react";
import { Button, Field, Input } from "@/components/ui";
import { getApiErrorMessage, useLogin } from "@/hooks/useAuth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");

    login.mutate(
      { username, password },
      {
        onSuccess: () => {
          router.push(params.get("from") || "/dashboard");
          router.refresh();
        },
      },
    );
  }

  const error = login.isError ? getApiErrorMessage(login.error) : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-indigo-600">Portfolio Admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your portfolio content</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Username">
            <Input name="username" placeholder="arian" autoComplete="username" required />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              name="password"
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full py-2.5" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
