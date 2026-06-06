import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/#about", label: "About Us" },
];

const supportLinks = [
  { href: "/#faqs", label: "FAQs" },
  { href: "/#privacy", label: "Privacy Policy" },
  { href: "/#contact", label: "Contact" },
];

const socialLinks = [
  {
    name: "facebook" as const,
    href: "https://www.facebook.com/inspirenextglobalinc",
  },
  {
    name: "instagram" as const,
    href: "https://www.instagram.com/inspirenextglobal_inc/",
  },
];

function SocialIcon({ name }: { name: "facebook" | "instagram" | "youtube" }) {
  if (name === "facebook") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <rect height="16" rx="4" stroke="currentColor" strokeWidth="2" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" fill="currentColor" r="1" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.6 7.1a2.8 2.8 0 0 0-2-2C17.9 4.6 12 4.6 12 4.6s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.9ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z" />
    </svg>
  );
}

export function MainFooter() {
  return (
    <footer className="mt-16 border-t-8 border-secondary bg-[#1c1b1b] px-4 py-10 text-white sm:px-6 md:px-10 md:py-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid items-start gap-10 sm:grid-cols-2 md:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr] md:gap-8 lg:gap-12">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex max-w-[140px] items-center justify-center"
              aria-label="Inspire Cinema home"
            >
              <Image
                src="/image/cinemalogo.png"
                alt="Inspire Cinema"
                width={661}
                height={377}
                className="block h-auto max-h-[80px] w-full object-contain"
                style={{ width: "140px", height: "auto" }}
              />
            </Link>
            <p className="mt-4 max-w-72 font-label text-xs uppercase leading-5 text-white/55">
              The ultimate fan experience for Philippine cinema classics.
            </p>
          </div>

          <div className="min-w-0">
            <h2 className="font-headline text-sm uppercase text-white">Quick Links</h2>
            <nav className="mt-5 flex flex-col items-start gap-3" aria-label="Footer quick links">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-label text-xs font-black uppercase text-white transition-colors hover:text-tertiary-fixed"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="min-w-0">
            <h2 className="font-headline text-sm uppercase text-white">Support</h2>
            <nav className="mt-5 flex flex-col items-start gap-3" aria-label="Footer support links">
              {supportLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-label text-xs font-black uppercase text-white transition-colors hover:text-tertiary-fixed"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="min-w-0">
            <h2 className="font-headline text-sm uppercase text-white">Follow Us</h2>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Inspire Cinema on ${social.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#c5cad8] text-[#1c1b1b] transition-colors hover:bg-tertiary-fixed"
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="font-label text-[10px] font-black uppercase text-white/35 sm:text-xs">
            &copy; 2026 Inspire Cinema. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
