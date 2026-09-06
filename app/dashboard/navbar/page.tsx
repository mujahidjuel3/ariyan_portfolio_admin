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
  const [newItem, setNewItem] = useState({ label: "", href: "" });

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

  async function saveSettings(values: z.infer<typeof settingsSchema>) {
    setMessage("");
    try {
      await updateSettings.mutateAsync(values);
      setMessage("Navbar settings saved");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  return (
    <div>
      <PageHeader title="Navbar" description="Logo, menu items, and CTA." />
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
          <FormField label="Logo Text"><Input {...form.register("logoText")} /></FormField>
          <FormField label="CTA Text"><Input {...form.register("ctaText")} /></FormField>
          <FormField label="CTA Link" className="sm:col-span-2"><Input {...form.register("ctaHref")} /></FormField>
        </div>
        <Button onClick={() => void form.handleSubmit(saveSettings)()} disabled={updateSettings.isPending}>
          Save Settings
        </Button>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Menu Items</h2>
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <Input placeholder="Label" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} />
          <Input placeholder="Href" value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })} />
          <Button
            onClick={() => {
              void createItem.mutateAsync(newItem).then(() => setNewItem({ label: "", href: "" }));
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {data.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center">
              <Input
                defaultValue={item.label}
                onBlur={(e) => updateItem.mutate({ id: item.id, payload: { label: e.target.value, href: item.href } })}
              />
              <Input
                defaultValue={item.href}
                onBlur={(e) => updateItem.mutate({ id: item.id, payload: { label: item.label, href: e.target.value } })}
              />
              <Button variant="ghost" className="text-red-600" onClick={() => deleteItem.mutate(item.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <FormMessage message={message} isError={message.includes("Failed")} />
    </div>
  );
}
