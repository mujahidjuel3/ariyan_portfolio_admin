"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button, Card, LoadingState, PageHeader, SaveBar, Input } from "@/components/ui";
import { FormField, FormMessage } from "@/components/forms/FormField";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import { zodForm } from "@/helpers/form";
import { useSettings, useUpdateSectionVisibility, useUpdateSiteSettings } from "@/hooks/useSettings";
import { useNavbar, useUpdateNavbarSettings } from "@/hooks/useNavbar";
import { getMutationMessage } from "@/helpers/mutation";
import { refreshPublicContent } from "@/helpers/revalidate";

const siteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  favicon: z.string().optional(),
  faviconMediaId: z.string().optional(),
  frontendTheme: z.enum(["light", "dark"]).default("light"),
});

const DEFAULT_ORDER = [
  "hero",
  "about",
  "projects",
  "experience",
  "stack",
  "services",
  "certifications",
  "testimonials",
  "blog",
  "footer",
] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About Me",
  projects: "Projects",
  experience: "Experience",
  stack: "My Stack",
  services: "Services",
  certifications: "Certifications",
  testimonials: "Testimonials",
  blog: "Blog",
  footer: "Footer",
  contact: "Contact",
};

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const { data: navbar } = useNavbar();
  const updateSite = useUpdateSiteSettings();
  const updateSections = useUpdateSectionVisibility();
  const updateNavbar = useUpdateNavbarSettings();
  const [message, setMessage] = useState("");
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [order, setOrder] = useState<string[]>([...DEFAULT_ORDER]);
  const [logo, setLogo] = useState<{ url?: string; mediaId?: string }>({});

  const form = useForm<z.infer<typeof siteSchema>>({
    ...zodForm(siteSchema),
    defaultValues: {
      title: "",
      description: "",
      favicon: "",
      faviconMediaId: "",
      frontendTheme: "light",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.site.title ?? "",
        description: data.site.description ?? "",
        favicon: data.site.favicon ?? "",
        faviconMediaId: data.site.faviconMediaId ?? "",
        frontendTheme: data.site.frontendTheme === "dark" ? "dark" : "light",
      });
      setSections(data.sections ?? {});
      const incoming = data.order?.length ? data.order : [...DEFAULT_ORDER];
      // Keep any new default keys that aren't stored yet
      const known = new Set(incoming);
      const merged = [...incoming];
      for (const key of DEFAULT_ORDER) {
        if (!known.has(key)) merged.push(key);
      }
      setOrder(merged.filter((k) => k !== "contact"));
    }
  }, [data, form]);

  useEffect(() => {
    if (navbar?.settings) {
      setLogo({
        url: navbar.settings.logoImage,
        mediaId: undefined,
      });
    }
  }, [navbar]);

  if (isLoading || !data) return <LoadingState />;

  function moveSection(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= order.length) return;
    setOrder((prev) => {
      const copy = [...prev];
      const tmp = copy[index];
      copy[index] = copy[next];
      copy[next] = tmp;
      return copy;
    });
  }

  async function onSaveSite(values: z.infer<typeof siteSchema>) {
    setMessage("");
    try {
      await updateSite.mutateAsync(values);
      const navbarPayload: Parameters<typeof updateNavbar.mutateAsync>[0] = {};
      if (logo.url !== undefined) navbarPayload.logoImage = logo.url;
      if (logo.mediaId) navbarPayload.logoMediaId = logo.mediaId;
      await updateNavbar.mutateAsync(navbarPayload);
      await refreshPublicContent();
      setMessage("Saved successfully — frontend will refresh shortly");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  async function onSaveSections() {
    setMessage("");
    try {
      await updateSections.mutateAsync({ sections, order });
      await refreshPublicContent();
      setMessage("Homepage sections saved");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save sections"));
    }
  }

  const saving = updateSite.isPending || updateSections.isPending || updateNavbar.isPending;

  return (
    <div>
      <PageHeader
        title="Site & Branding"
        description="SEO, logo, favicon, frontend theme, and homepage section order / visibility."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium">Site Settings</h2>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSaveSite)}>
            <FormField label="Site Title" error={form.formState.errors.title}>
              <Input {...form.register("title")} />
            </FormField>
            <FormField label="Meta Description" error={form.formState.errors.description}>
              <HtmlRichTextEditor
                value={form.watch("description")}
                onChange={(html) => form.setValue("description", html, { shouldValidate: true })}
                folder="settings"
                minHeightClass="min-h-[120px]"
              />
            </FormField>
            <FormField label="Frontend Theme (portfolio site)">
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.watch("frontendTheme")}
                onChange={(e) =>
                  form.setValue("frontendTheme", e.target.value as "light" | "dark", {
                    shouldValidate: true,
                  })
                }
              >
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Controls the public website default theme. Admin panel stays light.
              </p>
            </FormField>
            <ImageUpload
              label="Header Logo"
              folder="navbar"
              value={logo}
              onChange={(v) => setLogo({ url: v.url, mediaId: v.mediaId })}
            />
            <ImageUpload
              label="Favicon"
              folder="favicon"
              value={{
                url: form.watch("favicon"),
                mediaId: form.watch("faviconMediaId"),
              }}
              onChange={(v) => {
                form.setValue("favicon", v.url ?? "");
                form.setValue("faviconMediaId", v.mediaId ?? "");
              }}
            />
            <FormMessage message={message} isError={message.includes("Failed")} />
          </form>
        </Card>

        <Card>
          <h2 className="mb-1 font-medium">Homepage Sections</h2>
          <p className="mb-4 text-sm text-slate-500">
            Toggle show/hide and move sections up/down to set homepage position.
          </p>
          <div className="space-y-2">
            {order.map((key, index) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <span className="w-6 text-xs font-semibold text-slate-400">{index + 1}</span>
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                  {SECTION_LABELS[key] ?? key}
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Show</span>
                  <input
                    type="checkbox"
                    checked={sections[key] ?? true}
                    onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
                    className="size-4 rounded border-slate-300"
                  />
                </label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="!px-2"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                    aria-label={`Move ${key} up`}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="!px-2"
                    disabled={index === order.length - 1}
                    onClick={() => moveSection(index, 1)}
                    aria-label={`Move ${key} down`}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <SaveBar
        onSave={() => {
          void form.handleSubmit(onSaveSite)();
          void onSaveSections();
        }}
        saving={saving}
        message={message}
      />
    </div>
  );
}
