"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader, Textarea } from "@/components/ui";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import { useCreatePricingPlan, useDeletePricingPlan, usePricing, useUpdatePricingPlan } from "@/hooks/usePricing";
import type { PricingRecord } from "@/api/pricing.api";

export default function PricingPage() {
  const { data, isLoading } = usePricing();
  const create = useCreatePricingPlan();
  const update = useUpdatePricingPlan();
  const remove = useDeletePricingPlan();
  const [editing, setEditing] = useState<PricingRecord | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<PricingRecord>>({ features: [] });

  if (isLoading || !data) return <LoadingState />;

  async function save() {
    const payload = {
      ...draft,
      features:
        typeof draft.features === "string"
          ? String(draft.features).split("\n").filter(Boolean)
          : draft.features,
    };
    if (editing === "new") await create.mutateAsync(payload);
    else if (editing) await update.mutateAsync({ id: editing.id, payload });
    setEditing(null);
  }

  if (editing) {
    return (
      <div>
        <PageHeader title={editing === "new" ? "New Plan" : "Edit Plan"} action={<Button variant="secondary" onClick={() => setEditing(null)}>Back</Button>} />
        <Card className="space-y-4">
          <Field label="Name"><Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <HtmlRichTextEditor
            label="Tagline / Description"
            value={draft.tagline ?? ""}
            onChange={(html) => setDraft({ ...draft, tagline: html })}
            folder="pricing"
            minHeightClass="min-h-[100px]"
          />
          <Field label="Price"><Input value={draft.price ?? ""} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.featured ?? false} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} /> Featured</label>
          <Field label="Features (one per line)">
            <Textarea
              rows={5}
              value={Array.isArray(draft.features) ? draft.features.join("\n") : ""}
              onChange={(e) => setDraft({ ...draft, features: e.target.value.split("\n") })}
            />
          </Field>
          <Button onClick={() => void save()}>Save</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pricing" description="Pricing plans." action={<Button onClick={() => { setDraft({ features: [] }); setEditing("new"); }}><Plus className="size-4" /> Add Plan</Button>} />
      <div className="space-y-3">
        {data.map((plan) => (
          <Card key={plan.id} className="flex items-center justify-between">
            <div><p className="font-medium">{plan.name}</p><p className="text-sm text-slate-500">{plan.price}</p></div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setDraft(plan); setEditing(plan); }}><Pencil className="size-4" /></Button>
              <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(plan.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
