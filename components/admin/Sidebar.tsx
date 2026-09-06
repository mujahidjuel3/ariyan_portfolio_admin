"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  User,
  Link2,
  Layers,
  Briefcase,
  FolderKanban,
  FileText,
  Clock,
  Award,
  MessageSquare,
  Footprints,
  CreditCard,
  Share2,
  LogOut,
  Menu,
  X,
  Settings,
  Mail,
  DatabaseZap,
  Moon,
  Sun,
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "@/providers/theme-provider";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Site & Branding", icon: Settings },
  { href: "/dashboard/hero", label: "Hero", icon: Sparkles },
  { href: "/dashboard/about", label: "About", icon: User },
  { href: "/dashboard/navbar", label: "Navbar", icon: Link2 },
  { href: "/dashboard/skills", label: "Skills", icon: Layers },
  { href: "/dashboard/stack", label: "Stack", icon: Layers },
  { href: "/dashboard/services", label: "Services", icon: Briefcase },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/blogs", label: "Blogs", icon: FileText },
  { href: "/dashboard/experience", label: "Experience", icon: Clock },
  { href: "/dashboard/certifications", label: "Certifications", icon: Award },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/dashboard/footer", label: "Footer", icon: Footprints },
  { href: "/dashboard/contact", label: "Contact", icon: Mail },
  { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
  { href: "/dashboard/social-links", label: "Social Links", icon: Share2 },
  { href: "/dashboard/cache", label: "Cache", icon: DatabaseZap },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const logoutMutation = useLogout();
  const { theme, toggleTheme } = useAdminTheme();

  function logout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/login");
        router.refresh();
      },
    });
  }

  const nav = (
    <>
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-xs uppercase tracking-wider text-slate-400">Portfolio Admin</p>
        <p className="mt-1 text-lg font-semibold text-white">Sha Ariyan</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-200 bg-white p-2 shadow md:hidden dark:border-slate-700 dark:bg-slate-900"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          className="absolute right-3 top-4 rounded p-1 text-slate-400 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
        {nav}
      </aside>
    </>
  );
}
