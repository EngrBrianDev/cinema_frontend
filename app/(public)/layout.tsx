import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <MainHeader />
      <main className="w-full pt-36 pb-0 sm:pb-4 md:pb-10 lg:pt-28">{children}</main>
      <MainFooter />
    </div>
  );
}
