import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <MainHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-12">{children}</main>
      <MainFooter />
    </div>
  );
}
