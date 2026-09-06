"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, Input, LoadingState, PageHeader, SaveBar, Textarea } from "@/components/ui";
import { FormField, FormMessage } from "@/components/forms/FormField";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { zodForm } from "@/helpers/form";
import { useHero, useUpdateHero } from "@/hooks/useHero";
import { getMutationMessage } from "@/helpers/mutation";

const schema = z.object({
  greeting: z.string(),
  name: z.string().min(1),
  marqueeName: z.string(),
  profileAlt: z.string(),
  ctaText: z.string(),
  ctaHref: z.string(),
  ctaIcon: z.string().optional(),
  ctaIconMediaId: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  profileImage: z.string().optional(),
  profileMediaId: z.string().optional(),
  backgroundImages: z.array(z.string()).optional(),
  floatingImages: z.array(z.string()).optional(),
  badges: z.string().optional(),
  statistics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function HeroPage() {
  const { data, isLoading } = useHero();
  const update = useUpdateHero();
  const [message, setMessage] = useState("");

  const form = useForm<FormValues>({
    ...zodForm(schema),
    defaultValues: {
      greeting: "",
      name: "",
      marqueeName: "",
      profileAlt: "",
      ctaText: "",
      ctaHref: "",
      ctaIcon: "whatsapp",
      secondaryCtaText: "",
      secondaryCtaHref: "",
      backgroundImages: [],
      floatingImages: [],
      statistics: [],
    },
  });

  const stats = useFieldArray({ control: form.control, name: "statistics" });

  useEffect(() => {
    if (data) {
      form.reset({
        greeting: data.greeting ?? "",
        name: data.name ?? "",
        marqueeName: data.marqueeName ?? "",
        profileAlt: data.profileAlt ?? "",
        ctaText: data.ctaText ?? "",
        ctaHref: data.ctaHref ?? "",
        ctaIcon: data.ctaIcon ?? "whatsapp",
        secondaryCtaText: data.secondaryCtaText ?? "",
        secondaryCtaHref: data.secondaryCtaHref ?? "",
        profileImage: data.profileImage,
        backgroundImages: data.backgroundImages ?? [],
        floatingImages: data.floatingImages ?? [],
        badges: (data.badges ?? []).join("\n"),
        statistics: data.statistics ?? [],
      });
    }
  }, [data, form]);

  if (isLoading) return <LoadingState />;

  async function onSubmit(values: FormValues) {
    setMessage("");
    try {
      await update.mutateAsync({
        greeting: values.greeting,
        name: values.name,
        marqueeName: values.marqueeName,
        profileAlt: values.profileAlt,
        ctaText: values.ctaText,
        ctaHref: values.ctaHref,
        ctaIcon: values.ctaIcon,
        secondaryCtaText: values.secondaryCtaText,
        secondaryCtaHref: values.secondaryCtaHref,
        profileImage: values.profileImage,
        profileMediaId: values.profileMediaId,
        backgroundImages: values.backgroundImages?.filter(Boolean),
        floatingImages: values.floatingImages?.filter(Boolean),
        badges: values.badges?.split("\n").filter(Boolean),
        statistics: values.statistics,
      });
      setMessage("Saved successfully");
    } catch (err) {
      setMessage(getMutationMessage(err, "Failed to save"));
    }
  }

  const ctaIcon = form.watch("ctaIcon");
  const ctaIsCustomImage = Boolean(ctaIcon && (ctaIcon.startsWith("http") || ctaIcon.startsWith("/")));

  return (
    <div>
      <PageHeader title="Hero" description="Manage hero section content." />
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Greeting" error={form.formState.errors.greeting}>
            <Input {...form.register("greeting")} />
          </FormField>
          <FormField label="Name" error={form.formState.errors.name}>
            <Input {...form.register("name")} />
          </FormField>
          <FormField label="Marquee Name">
            <Input {...form.register("marqueeName")} />
          </FormField>
          <FormField label="Profile Alt">
            <Input {...form.register("profileAlt")} />
          </FormField>
          <FormField label="CTA Text">
            <Input {...form.register("ctaText")} />
          </FormField>
          <FormField label="CTA Link">
            <Input {...form.register("ctaHref")} />
          </FormField>
          <FormField label="Secondary CTA Text">
            <Input
              {...form.register("secondaryCtaText")}
              placeholder="Dive into Figma Projects"
            />
          </FormField>
          <FormField label="Secondary CTA Link">
            <Input {...form.register("secondaryCtaHref")} />
          </FormField>
        </div>

        <ImageUpload
          label="Profile Image"
          folder="hero"
          value={{ url: form.watch("profileImage"), mediaId: form.watch("profileMediaId") }}
          onChange={(v) => {
            form.setValue("profileImage", v.url);
            form.setValue("profileMediaId", v.mediaId);
          }}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">CTA Icon</p>
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-sm ${!ctaIsCustomImage && ctaIcon === "whatsapp" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200"}`}
              onClick={() => {
                form.setValue("ctaIcon", "whatsapp");
                form.setValue("ctaIconMediaId", undefined);
              }}
            >
              WhatsApp (default)
            </button>
          </div>
          <ImageUpload
            label="Custom CTA Icon (optional)"
            folder="hero"
            value={
              ctaIsCustomImage
                ? { url: ctaIcon, mediaId: form.watch("ctaIconMediaId") }
                : {}
            }
            onChange={(v) => {
              form.setValue("ctaIcon", v.url || "whatsapp");
              form.setValue("ctaIconMediaId", v.mediaId);
            }}
          />
        </div>

        <MultiImageUpload
          label="Background Images"
          folder="hero"
          value={form.watch("backgroundImages") ?? []}
          onChange={(urls) => form.setValue("backgroundImages", urls)}
        />
        <MultiImageUpload
          label="Floating Images"
          folder="hero"
          value={form.watch("floatingImages") ?? []}
          onChange={(urls) => form.setValue("floatingImages", urls)}
        />

        <FormField label="Badges (one per line)">
          <Textarea rows={2} {...form.register("badges")} />
        </FormField>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Statistics</p>
          {stats.fields.map((field, i) => (
            <div key={field.id} className="grid gap-2 sm:grid-cols-2">
              <Input {...form.register(`statistics.${i}.label`)} placeholder="Label" />
              <Input {...form.register(`statistics.${i}.value`)} placeholder="Value" />
            </div>
          ))}
          <button type="button" className="text-sm text-indigo-600" onClick={() => stats.append({ label: "", value: "" })}>
            + Add statistic
          </button>
        </div>
        <FormMessage message={message} isError={message.includes("Failed")} />
      </Card>
      <SaveBar onSave={() => void form.handleSubmit(onSubmit)()} saving={update.isPending} message={message} />
    </div>
  );
}
