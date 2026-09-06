import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, UseFormProps } from "react-hook-form";
import type { ZodType } from "zod";

export function zodForm<T extends FieldValues>(
  schema: ZodType<T>,
  options?: Omit<UseFormProps<T>, "resolver">,
) {
  return {
    resolver: zodResolver(schema as never),
    ...options,
  } as UseFormProps<T>;
}
