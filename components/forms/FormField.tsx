"use client";

import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

export function FormMessage({ message, isError }: { message?: string; isError?: boolean }) {
  if (!message) return null;
  return (
    <p className={cn("text-sm", isError ? "text-red-600" : "text-emerald-600")}>{message}</p>
  );
}
