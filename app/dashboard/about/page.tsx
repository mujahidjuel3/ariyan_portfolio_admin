"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, Input, LoadingState, PageHeader, SaveBar } from "@/components/ui";
import { FormField, FormMessage } from "@/components/forms/FormField";
import { ImageUpload } from "@/components/ImageUpload";
import { HtmlRichTextEditor } from "@/components/RichTextEditor";
import { zodForm } from "@/helpers/form";
import { useAbout, useUpdateAbout } from "@/hooks/useAbout";
import { getMutationMessage } from "@/helpers/mutation";

const schema = z.object({
  heading: z.string().min(1),
  text: z.string().min(1),
  profileImage: z.string().optional(),
  profileMediaId: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
});

export default function AboutPage() {
  const { data, isLoading } = useAbout();
  const update = useUpdateAbout();
  const [message, setMessage] = useState("");
  const form = useForm<z.infer<typeof schema>>({ ...zodForm(schema), defaultValues: { heading: "", text: "" } });

  useEffect(() => {
    if (data) form.reset({
      heading: data.heading ?? "",
      text: data.text ?? "",
      profileImage: data.profileImage,
      experienceYears: data.experienceYears,
    });
  }, [data, form]);

  if (isLoading) return <LoadingState />;

  async function onSubmit(values: z.infer<typeof schema>) {
    setMessage("");
    try {
      await update.mutateAsync(values);
      setMessage("Saved successfully");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  return (
    <div>
      <PageHeader title="About" description="Edit the about section heading and bio text." />
      <Card className="max-w-3xl space-y-4">
        <FormField label="Section Heading" error={form.formState.errors.heading}>
          <Input {...form.register("heading")} />
        </FormField>
        <FormField label="About Description" error={form.formState.errors.text}>
          <HtmlRichTextEditor
            value={form.watch("text")}
            onChange={(html) => form.setValue("text", html, { shouldValidate: true })}
            folder="about"
          />
        </FormField>
        <FormField label="Experience Years">
          <Input type="number" {...form.register("experienceYears")} />
        </FormField>
        <ImageUpload
          label="Profile Image"
          folder="about"
          value={{ url: form.watch("profileImage"), mediaId: form.watch("profileMediaId") }}
          onChange={(v) => { form.setValue("profileImage", v.url); form.setValue("profileMediaId", v.mediaId); }}
        />
        <FormMessage message={message} isError={message.includes("Failed")} />
      </Card>
      <SaveBar onSave={() => void form.handleSubmit(onSubmit)()} saving={update.isPending} message={message} />
    </div>
  );
}
