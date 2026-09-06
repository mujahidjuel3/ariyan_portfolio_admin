"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, LoadingState, PageHeader, SaveBar, Input } from "@/components/ui";
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

const SECTIONS = [
  "hero",
  "about",
  "services",
  "stack",
  "experience",
  "certifications",
  "projects",
  "blog",
  "contact",
  "footer",
] as const;

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const { data: navbar } = useNavbar();
  const updateSite = useUpdateSiteSettings();
  const updateSections = useUpdateSectionVisibility();
  const updateNavbar = useUpdateNavbarSettings();
  const [message, setMessage] = useState("");
  const [sections, setSections] = useState<Record<string, boolean>>({});
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
      setSections(data.sections);
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

  async function onSaveSite(values: z.infer<typeof siteSchema>) {
    setMessage("");
    try {
      await updateSite.mutateAsync(values);
      await updateNavbar.mutateAsync({
        logoImage: logo.url,
        logoMediaId: logo.mediaId,
      });
      await refreshPublicContent();
      setMessage("Saved successfully — frontend will refresh shortly");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  async function onSaveSections() {
    setMessage("");
    try {
      await updateSections.mutateAsync(sections);
      await refreshPublicContent();
      setMessage("Section visibility saved");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save sections"));
    }
  }

  const saving = updateSite.isPending || updateSections.isPending || updateNavbar.isPending;

  return (
    <div>
      <PageHeader title="Site & Branding" description="SEO, logo, favicon, frontend theme, and sections." />
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
          <h2 className="mb-4 font-medium">Section Visibility</h2>
          <div className="space-y-3">
            {SECTIONS.map((key) => (
              <label key={key} className="flex items-center justify-between text-sm">
                <span className="capitalize">{key}</span>
                <input
                  type="checkbox"
                  checked={sections[key] ?? true}
                  onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
                  className="size-4 rounded border-slate-300"
                />
              </label>
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
