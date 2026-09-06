"use client";

import { useEffect, useState } from "react";
import { Card, Field, Input, LoadingState, PageHeader, SaveBar, Textarea } from "@/components/ui";
import { useContact, useUpdateContact } from "@/hooks/useContact";
import { getMutationMessage } from "@/helpers/mutation";

export default function ContactPage() {
  const { data, isLoading } = useContact();
  const update = useUpdateContact();
  const [form, setForm] = useState({ email: "", phone: "", address: "", phoneHref: "", emailHref: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data) setForm({
      email: data.email ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      phoneHref: data.phoneHref ?? "",
      emailHref: data.emailHref ?? "",
    });
  }, [data]);

  if (isLoading) return <LoadingState />;

  async function save() {
    setMessage("");
    try {
      await update.mutateAsync(form);
      setMessage("Contact settings saved");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  return (
    <div>
      <PageHeader title="Contact" description="Contact information shown in the footer." />
      <Card className="max-w-2xl space-y-4">
        <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Email Link"><Input value={form.emailHref} onChange={(e) => setForm({ ...form, emailHref: e.target.value })} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Phone Link"><Input value={form.phoneHref} onChange={(e) => setForm({ ...form, phoneHref: e.target.value })} /></Field>
        <Field label="Address"><Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
      </Card>
      <SaveBar onSave={() => void save()} saving={update.isPending} message={message} />
    </div>
  );
}
