"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, LoadingState, PageHeader } from "@/components/ui";
import { FormField, FormMessage } from "@/components/forms/FormField";
import { ImageUpload } from "@/components/ImageUpload";
import { zodForm } from "@/helpers/form";
import {
  useCreateNavbarItem,
  useDeleteNavbarItem,
  useNavbar,
  useUpdateNavbarItem,
  useUpdateNavbarSettings,
} from "@/hooks/useNavbar";
import { getMutationMessage } from "@/helpers/mutation";
import type { NavbarItem } from "@/lib/api/navbar.api";

const settingsSchema = z.object({
  logoText: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  logoImage: z.string().optional(),
  logoMediaId: z.string().optional(),
});

export default function NavbarPage() {
  const { data, isLoading } = useNavbar();
  const updateSettings = useUpdateNavbarSettings();
  const createItem = useCreateNavbarItem();
  const updateItem = useUpdateNavbarItem();
  const deleteItem = useDeleteNavbarItem();
  const [message, setMessage] = useState("");
  const [mainDraft, setMainDraft] = useState({ label: "", href: "" });
  const [utilityDraft, setUtilityDraft] = useState({ label: "", href: "" });

  const form = useForm<z.infer<typeof settingsSchema>>({
    ...zodForm(settingsSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (data?.settings) {
      form.reset({
        logoText: data.settings.logoText,
        ctaText: data.settings.ctaText,
        ctaHref: data.settings.ctaHref,
        logoImage: data.settings.logoImage,
      });
    }
  }, [data, form]);

  if (isLoading || !data) return <LoadingState />;

  const mainItems = data.items.filter((i) => (i.placement || "main") === "main");
  const utilityItems = data.items.filter((i) => i.placement === "utility");

  async function saveSettings(values: z.infer<typeof settingsSchema>) {
    setMessage("");
    try {
      await updateSettings.mutateAsync(values);
      setMessage("Navbar settings saved");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  function renderItemEditor(item: NavbarItem) {
    return (
      <div
        key={item.id}
        className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center"
      >
        <Input
          defaultValue={item.label}
          onBlur={(e) => {
            if (e.target.value !== item.label) {
              updateItem.mutate({
                id: item.id,
                payload: { label: e.target.value },
              });
            }
          }}
        />
        <Input
          defaultValue={item.href}
          onBlur={(e) => {
            if (e.target.value !== item.href) {
              updateItem.mutate({
                id: item.id,
                payload: { href: e.target.value },
              });
            }
          }}
        />
        <Button
          variant="ghost"
          className="text-red-600"
          onClick={() => deleteItem.mutate(item.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Navbar"
        description="Logo, main section menu, and custom right-side links (Behance, Dribbble, Resume, …)."
      />
      <Card className="mb-6 space-y-4">
        <h2 className="font-medium">Branding & CTA</h2>
        <ImageUpload
          label="Logo"
          folder="navbar"
          value={{ url: form.watch("logoImage"), mediaId: form.watch("logoMediaId") }}
          onChange={(v) => {
            form.setValue("logoImage", v.url);
            form.setValue("logoMediaId", v.mediaId);
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Logo Text">
            <Input {...form.register("logoText")} />
          </FormField>
          <FormField label="CTA Text">
            <Input {...form.register("ctaText")} />
          </FormField>
          <FormField label="CTA Link" className="sm:col-span-2">
            <Input {...form.register("ctaHref")} />
          </FormField>
        </div>
        <Button
          onClick={() => void form.handleSubmit(saveSettings)()}
          disabled={updateSettings.isPending}
        >
          Save Settings
        </Button>
      </Card>

      <Card className="mb-6">
        <div className="mb-2">
          <h2 className="font-medium">Main Menu</h2>
          <p className="mt-1 text-sm text-slate-500">
            Section links in the center (Home, About, Projects, Blog, …).
          </p>
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Label"
            value={mainDraft.label}
            onChange={(e) => setMainDraft({ ...mainDraft, label: e.target.value })}
          />
          <Input
            placeholder="Href e.g. /#about or /blog"
            value={mainDraft.href}
            onChange={(e) => setMainDraft({ ...mainDraft, href: e.target.value })}
          />
          <Button
            onClick={() => {
              if (!mainDraft.label.trim() || !mainDraft.href.trim()) return;
              void createItem
                .mutateAsync({ ...mainDraft, placement: "main" })
                .then(() => setMainDraft({ label: "", href: "" }));
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">{mainItems.map(renderItemEditor)}</div>
      </Card>

      <Card>
        <div className="mb-2">
          <h2 className="font-medium">Custom Links (right side)</h2>
          <p className="mt-1 text-sm text-slate-500">
            Extra links next to the menu — e.g. Behance, Dribbble, Resume. Set any name + URL.
          </p>
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Label e.g. Behance"
            value={utilityDraft.label}
            onChange={(e) =>
              setUtilityDraft({ ...utilityDraft, label: e.target.value })
            }
          />
          <Input
            placeholder="https://… or /resume.pdf"
            value={utilityDraft.href}
            onChange={(e) =>
              setUtilityDraft({ ...utilityDraft, href: e.target.value })
            }
          />
          <Button
            onClick={() => {
              if (!utilityDraft.label.trim() || !utilityDraft.href.trim()) return;
              void createItem
                .mutateAsync({ ...utilityDraft, placement: "utility" })
                .then(() => setUtilityDraft({ label: "", href: "" }));
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {utilityItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              No custom links yet. Add Behance, Dribbble, Resume, or anything you need.
            </p>
          ) : (
            utilityItems.map(renderItemEditor)
          )}
        </div>
      </Card>
      <FormMessage message={message} isError={message.includes("Failed")} />
    </div>
  );
}
