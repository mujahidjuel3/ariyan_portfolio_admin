import { Sidebar } from "@/components/admin/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:pl-64">
      <Sidebar />
      <main className="min-h-screen px-4 pb-8 pt-16 md:px-8 md:pt-8">{children}</main>
    </div>
  );
}
