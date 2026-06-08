import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <MainHeader />
      <main className="w-full pt-[7.75rem] pb-10 lg:pt-20">{children}</main>
      <MainFooter />
    </div>
  );
}
