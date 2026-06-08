import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { PageTransitionShell } from "@/components/layout/page-transition-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminTopbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 md:px-12">
        <AdminSidebar />
        <PageTransitionShell>
          <main className="flex-1">{children}</main>
        </PageTransitionShell>
      </div>
    </div>
  );
}
