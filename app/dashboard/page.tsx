"use client";

import Link from "next/link";
import { LayoutDashboard, FolderKanban, FileText, Briefcase } from "lucide-react";
import { Card, LoadingState, PageHeader } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";
import { useBlogPosts } from "@/hooks/useBlog";
import { useServices } from "@/hooks/useServices";

const quickLinks = [
  { href: "/dashboard/settings", label: "Site Settings" },
  { href: "/dashboard/hero", label: "Hero Section" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/blogs", label: "Blog Posts" },
];

export default function DashboardPage() {
  const { data: projects, isLoading: pLoading } = useProjects();
  const { data: posts, isLoading: bLoading } = useBlogPosts();
  const { data: services, isLoading: sLoading } = useServices();

  if (pLoading || bLoading || sLoading) return <LoadingState />;

  const stats = [
    { label: "Projects", value: projects?.length ?? 0, icon: FolderKanban },
    { label: "Blog Posts", value: posts?.length ?? 0, icon: FileText },
    { label: "Services", value: services?.length ?? 0, icon: Briefcase },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your portfolio content." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600"><Icon className="size-5" /></div>
            <div><p className="text-2xl font-semibold">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium"><LayoutDashboard className="size-4" /> Quick Links</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg border border-slate-100 px-4 py-3 text-sm text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50">
              {link.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
