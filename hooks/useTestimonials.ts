"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonials,
  updateTestimonial,
} from "@/api/testimonial.api";
import { queryKeys } from "@/lib/query-keys";

export function useTestimonials() {
  return useQuery({ queryKey: queryKeys.testimonials, queryFn: fetchTestimonials });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.testimonials }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateTestimonial>[1] }) =>
      updateTestimonial(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.testimonials }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.testimonials }),
  });
}
