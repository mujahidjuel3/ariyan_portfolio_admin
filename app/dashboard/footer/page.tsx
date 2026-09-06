"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader, SaveBar } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import {
  useCreateFooterNavLink,
  useDeleteFooterNavLink,
  useFooter,
  useUpdateFooterNavLink,
  useUpdateFooterSettings,
} from "@/hooks/useFooter";
import { getMutationMessage } from "@/helpers/mutation";

export default function FooterPage() {
  const { data, isLoading } = useFooter();
  const updateSettings = useUpdateFooterSettings();
  const createNav = useCreateFooterNavLink();
  const updateNav = useUpdateFooterNavLink();
  const deleteNav = useDeleteFooterNavLink();
  const [settings, setSettings] = useState({ title: "", description: "", imageUrl: "", imageAlt: "", copyright: "", imageMediaId: "" });
  const [newLink, setNewLink] = useState({ label: "", href: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data?.settings) {
      setSettings({
        title: data.settings.title ?? "",
        description: data.settings.description ?? "",
        imageUrl: data.settings.imageUrl ?? "",
        imageAlt: data.settings.imageAlt ?? "",
        copyright: data.settings.copyright ?? "",
        imageMediaId: "",
      });
    }
  }, [data]);

  if (isLoading || !data) return <LoadingState />;

  async function saveSettings() {
    setMessage("");
    try {
      await updateSettings.mutateAsync({
        title: settings.title,
        description: settings.description,
        imageUrl: settings.imageUrl,
        imageAlt: settings.imageAlt,
        copyright: settings.copyright,
        imageMediaId: settings.imageMediaId || undefined,
      });
      setMessage("Footer saved");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  return (
    <div>
      <PageHeader title="Footer" description="Footer content and navigation links." />
      <Card className="mb-6 space-y-4">
        <Field label="Title"><Input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} /></Field>
        <HtmlRichTextEditor
          label="Description"
          value={settings.description}
          onChange={(html) => setSettings({ ...settings, description: html })}
          folder="footer"
          minHeightClass="min-h-[120px]"
        />
        <ImageUpload label="Footer Image" folder="footer" value={{ url: settings.imageUrl, mediaId: settings.imageMediaId }} onChange={(v) => setSettings({ ...settings, imageUrl: v.url ?? "", imageMediaId: v.mediaId ?? "" })} />
        <Field label="Copyright"><Input value={settings.copyright} onChange={(e) => setSettings({ ...settings, copyright: e.target.value })} /></Field>
      </Card>
      <Card>
        <div className="mb-4 flex gap-2">
          <Input placeholder="Label" value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} />
          <Input placeholder="Href" value={newLink.href} onChange={(e) => setNewLink({ ...newLink, href: e.target.value })} />
          <Button onClick={() => void createNav.mutateAsync(newLink).then(() => setNewLink({ label: "", href: "" }))}><Plus className="size-4" /></Button>
        </div>
        {data.navLinks.map((link) => (
          <div key={link.id} className="mb-2 flex gap-2">
            <Input defaultValue={link.label} onBlur={(e) => updateNav.mutate({ id: link.id, payload: { label: e.target.value, href: link.href } })} />
            <Input defaultValue={link.href} onBlur={(e) => updateNav.mutate({ id: link.id, payload: { label: link.label, href: e.target.value } })} />
            <Button variant="ghost" className="text-red-600" onClick={() => deleteNav.mutate(link.id)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </Card>
      <SaveBar onSave={() => void saveSettings()} saving={updateSettings.isPending} message={message} />
    </div>
  );
}
