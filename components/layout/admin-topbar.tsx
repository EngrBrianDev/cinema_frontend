import Image from "next/image";
import Link from "next/link";

export function AdminTopbar() {
  return (
    <header
      className="sticky top-0 z-40 border-b-4 border-black bg-primary px-4 py-2 text-white md:px-12"
      style={{ viewTransitionName: "admin-header" }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" aria-label="Inspire Cinema home" className="motion-button" transitionTypes={["nav-back"]}>
          <Image
            src="/image/cinemalogo.png"
            alt="Inspire Cinema"
            width={661}
            height={377}
            priority
            className="h-auto w-24 sm:w-28"
          />
        </Link>
        <span className="rounded border-2 border-white bg-secondary px-3 py-1 font-label text-xs font-bold uppercase">
          Admin Panel
        </span>
      </div>
    </header>
  );
}
