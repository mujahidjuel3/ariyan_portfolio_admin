"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchContact, updateContact } from "@/lib/api/contact.api";
import { queryKeys } from "@/lib/query-keys";

export function useContact() {
  return useQuery({ queryKey: queryKeys.contact, queryFn: fetchContact });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contact }),
  });
}
