import Link from "next/link";

const links = ["Dashboard", "Ticket Sales", "Buyer List", "Event Settings"];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 rounded border-2 border-black bg-black p-4 text-white md:block">
      <nav className="space-y-2">
        {links.map((link, index) => (
          <Link
            key={link}
            href="#"
            className={`block rounded px-3 py-2 font-label text-xs font-bold uppercase ${
              index === 0 ? "bg-secondary text-white" : "text-zinc-300"
            }`}
          >
            {link}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
