"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { refreshPublicContent } from "@/helpers/revalidate";
import { getToken } from "@/helpers/storage";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
        mutationCache: new MutationCache({
          onSuccess: () => {
            if (!getToken()) return;
            void refreshPublicContent();
          },
        }),
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
