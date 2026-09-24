"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import {
  useCreateSocialLink,
  useDeleteSocialLink,
  useSocialLinks,
  useUpdateSocialLink,
} from "@/hooks/useSocial";
import type { SocialLinkRecord } from "@/lib/api/social.api";

type Draft = {
  label: string;
  href: string;
  location: "hero" | "footer";
  iconUrl?: string;
  iconMediaId?: string;
};

const emptyDraft = (location: "hero" | "footer"): Draft => ({
  label: "",
  href: "",
  location,
  iconUrl: "",
  iconMediaId: undefined,
});

export default function SocialLinksPage() {
  const { data: heroLinks, isLoading: heroLoading } = useSocialLinks("hero");
  const { data: footerLinks, isLoading: footerLoading } = useSocialLinks("footer");
  const create = useCreateSocialLink();
  const update = useUpdateSocialLink();
  const remove = useDeleteSocialLink();
  const [heroDraft, setHeroDraft] = useState(emptyDraft("hero"));
  const [footerDraft, setFooterDraft] = useState(emptyDraft("footer"));

  if (heroLoading || footerLoading) return <LoadingState />;

  async function addLink(draft: Draft, reset: (d: Draft) => void) {
    if (!draft.label.trim() || !draft.href.trim()) return;
    await create.mutateAsync({
      label: draft.label.trim(),
      href: draft.href.trim(),
      location: draft.location,
      iconUrl: draft.iconUrl || undefined,
      iconMediaId: draft.iconMediaId,
      platform: "custom",
    });
    reset(emptyDraft(draft.location));
  }

  function renderSection(
    title: string,
    description: string,
    location: "hero" | "footer",
    items: SocialLinkRecord[] | undefined,
    draft: Draft,
    setDraft: (d: Draft) => void,
  ) {
    return (
      <Card className="mb-6 space-y-4">
        <div>
          <h2 className="font-medium capitalize">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Label">
            <Input
              placeholder="e.g. LinkedIn"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </Field>
          <Field label="Link URL">
            <Input
              placeholder="https://..."
              value={draft.href}
              onChange={(e) => setDraft({ ...draft, href: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <ImageUpload
              label="Icon (SVG / PNG)"
              folder="social"
              value={{ url: draft.iconUrl, mediaId: draft.iconMediaId }}
              onChange={(v) =>
                setDraft({ ...draft, iconUrl: v.url, iconMediaId: v.mediaId })
              }
            />
          </div>
        </div>
        <Button
          onClick={() => void addLink(draft, setDraft)}
          disabled={create.isPending || !draft.label.trim() || !draft.href.trim()}
        >
          <Plus className="size-4" /> Add {location === "hero" ? "Hero" : "Footer"} Link
        </Button>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          {(items ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No links yet — add as many as you need.</p>
          ) : (
            (items ?? []).map((link) => (
              <div
                key={link.id}
                className="grid gap-3 rounded-lg border border-slate-100 p-3 sm:grid-cols-[72px_1fr_1fr_auto]"
              >
                <ImageUpload
                  label=""
                  folder="social"
                  value={{ url: link.iconUrl, mediaId: link.iconMediaId }}
                  onChange={(v) =>
                    update.mutate({
                      id: link.id,
                      payload: { iconUrl: v.url, iconMediaId: v.mediaId },
                    })
                  }
                />
                <Input
                  defaultValue={link.label}
                  onBlur={(e) => {
                    if (e.target.value !== link.label) {
                      update.mutate({ id: link.id, payload: { label: e.target.value } });
                    }
                  }}
                />
                <Input
                  defaultValue={link.href}
                  onBlur={(e) => {
                    if (e.target.value !== link.href) {
                      update.mutate({ id: link.id, payload: { href: e.target.value } });
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => remove.mutate(link.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Social Links"
        description="Hero and Footer social icons are separate. Upload any SVG icon and set the link — add as many as you want."
      />
      {renderSection(
        "Hero Social Links",
        "Shown under the hero profile / CTAs.",
        "hero",
        heroLinks,
        heroDraft,
        setHeroDraft,
      )}
      {renderSection(
        "Footer Social Links",
        "Shown in the footer black panel.",
        "footer",
        footerLinks,
        footerDraft,
        setFooterDraft,
      )}
    </div>
  );
}
