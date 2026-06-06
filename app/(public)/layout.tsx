import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <MainHeader />
      <main className="w-full pt-28 pb-10">{children}</main>
      <MainFooter />
    </div>
  );
}
