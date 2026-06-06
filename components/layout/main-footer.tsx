"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const quickLinks = [
  { href: "/", label: "Home" },
  { modal: "about", label: "About Us" },
] as const;

const supportLinks = [
  { modal: "faqs", label: "FAQs" },
  { modal: "privacy", label: "Privacy Policy" },
  { modal: "contact", label: "Contact" },
] as const;

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

type FooterModal = "about" | (typeof supportLinks)[number]["modal"] | null;

const faqs = [
  {
    question: "How do I book a ticket?",
    answer:
      "Choose your movie schedule, select available seats from the seat map, review your order, then continue to checkout to complete payment.",
  },
  {
    question: "When is my seat considered reserved?",
    answer:
      "A seat is only secured after a successful PayPal or card payment, or after the system receives your GCash submission for review. If you leave PayPal before payment, your seat returns to the available pool.",
  },
  {
    question: "What happens if I go back from PayPal?",
    answer:
      "You can return to checkout and try again or choose another method. If another customer completes payment for the same seat first, the system will ask you to return to the seat map and choose again.",
  },
  {
    question: "How does GCash payment work?",
    answer:
      "Scan the GCash QR code, pay the exact checkout amount, then upload a clear screenshot of your receipt. Your booking will be reviewed before the ticket is issued.",
  },
  {
    question: "When will I receive my ticket?",
    answer:
      "Confirmed PayPal or card payments issue tickets after payment confirmation. GCash bookings are reviewed first, and tickets are sent to the registered email once approved.",
  },
  {
    question: "Can I cancel before paying?",
    answer:
      "Yes. Use Cancel Checkout before completing payment to clear the checkout and return to the seat map.",
  },
];

const privacySections = [
  {
    title: "Information We Collect",
    body:
      "We collect information needed to run online ticketing, including account sign-in details, email address, selected seats, reservation records, payment references, uploaded GCash receipts, and ticket details.",
  },
  {
    title: "How We Use Information",
    body:
      "We use your information to create bookings, verify payments, prevent duplicate seat purchases, send digital tickets, provide customer support, and protect the system from misuse.",
  },
  {
    title: "Payment Handling",
    body:
      "PayPal and card payments are processed through PayPal's secure payment pages. Inspire Cinema does not store full card numbers. GCash receipt screenshots are used only to verify submitted payments.",
  },
  {
    title: "Sharing and Service Providers",
    body:
      "We may share limited booking information with trusted providers that support authentication, payment processing, file storage, email delivery, system security, or lawful requests.",
  },
  {
    title: "Retention and Security",
    body:
      "Booking, payment, and ticket records are kept only as long as needed for operations, audit, support, fraud prevention, and legal compliance. We use access controls and secure processing practices to protect customer information.",
  },
  {
    title: "Your Privacy Rights",
    body:
      "You may request access, correction, deletion, or other action on your personal data where applicable. Requests may be raised through the contact details listed in this footer.",
  },
];

const aboutHighlights = [
  {
    title: "Diversified Holdings",
    body:
      "Inspire Holdings Incorporated spans financial, investment, strategic management, healthcare, pharmaceuticals, gaming and entertainment, agricultural trading, and specialized services.",
  },
  {
    title: "Cohesive Ecosystem",
    body:
      "The company operates through a collaborative network of financial hubs, capitalizing entities, and subsidiaries designed to support innovation and operational excellence.",
  },
  {
    title: "Long-Term Value",
    body:
      "Its work is focused on meaningful, measurable impact while delivering exceptional returns and long-term value for shareholders and partners.",
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

function ModalContent({ modal }: { modal: Exclude<FooterModal, null> }) {
  if (modal === "about") {
    return (
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border-2 border-on-background bg-surface-variant p-4">
          <p className="font-label text-[10px] font-black uppercase text-outline">About Us</p>
          <h4 className="mt-2 font-headline text-2xl font-black uppercase text-secondary">
            Inspire Holdings Incorporated
          </h4>
          <p className="mt-4 font-body-md text-sm leading-relaxed text-on-background">
            A premier financial, investment, and strategic management company with diversified interests
            spanning construction and development, healthcare and pharmaceuticals, gaming and
            entertainment, agricultural trading, and specialized services.
          </p>
          <p className="mt-4 border-l-4 border-tertiary-fixed bg-background p-3 font-body-md text-sm italic leading-relaxed text-on-background">
            In true adherence to the Wealthy Clique Model, Inspire Holdings orchestrates a cohesive
            ecosystem where financial hubs, capitalizing entities, and subsidiaries work together to
            drive innovation, operational excellence, and strategic collaboration.
          </p>
        </section>

        <div className="grid gap-3">
          {aboutHighlights.map((item) => (
            <section key={item.title} className="border-2 border-on-background bg-surface-variant p-4">
              <h4 className="font-headline text-sm font-black uppercase text-secondary">{item.title}</h4>
              <p className="mt-2 font-body-md text-sm leading-relaxed text-on-background">{item.body}</p>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (modal === "faqs") {
    return (
      <div className="grid gap-3 lg:grid-cols-2">
        {faqs.map((faq) => (
          <section key={faq.question} className="border-2 border-on-background bg-surface-variant p-3">
            <h4 className="font-headline text-xs font-black uppercase text-secondary">{faq.question}</h4>
            <p className="mt-2 font-body-md text-xs leading-relaxed text-on-background">{faq.answer}</p>
          </section>
        ))}
      </div>
    );
  }

  if (modal === "privacy") {
    return (
      <div className="space-y-3">
        <p className="border-2 border-dashed border-outline bg-surface-variant p-3 font-body-md text-xs leading-relaxed text-on-background">
          This notice explains how Inspire Cinema handles information for online booking, checkout,
          payment verification, and digital ticket delivery.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          {privacySections.map((section) => (
            <section key={section.title} className="border-2 border-on-background/20 bg-background p-3">
              <h4 className="font-headline text-xs font-black uppercase text-secondary">{section.title}</h4>
              <p className="mt-2 font-body-md text-xs leading-relaxed text-on-background">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-3">
        <section className="border-2 border-on-background bg-surface-variant p-4">
          <p className="font-label text-[10px] font-black uppercase text-outline">Main Office</p>
          <p className="mt-2 font-body-md text-sm font-bold leading-relaxed text-on-background">
            6F Alliance Global Tower, 11th Avenue, corner 36th St, Taguig, Metro Manila
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="border-2 border-on-background bg-surface-variant p-4">
            <p className="font-label text-[10px] font-black uppercase text-outline">Landline</p>
            <p className="mt-2 font-headline text-lg font-black text-secondary">(02) 5322 1002</p>
          </div>
          <div className="border-2 border-on-background bg-surface-variant p-4">
            <p className="font-label text-[10px] font-black uppercase text-outline">Business Hours</p>
            <p className="mt-2 font-body-md text-sm font-bold text-on-background">Mon - Fri, 9:30 - 18:30</p>
            <p className="font-body-md text-sm font-bold text-secondary">Sat - Sun, Closed</p>
          </div>
        </section>

        <section className="border-2 border-on-background bg-surface-variant p-4">
          <p className="font-label text-[10px] font-black uppercase text-outline">Satellite Office - USA</p>
          <p className="mt-2 font-body-md text-sm leading-relaxed text-on-background">
            1209 Mountain Road PL NE STE N, Bernalillo County, Albuquerque, NM 87110
          </p>
        </section>

        <section className="border-2 border-on-background bg-surface-variant p-4">
          <p className="font-label text-[10px] font-black uppercase text-outline">Satellite Office - Japan</p>
          <p className="mt-2 font-body-md text-sm leading-relaxed text-on-background">
            20th Floor, Trust Tower Main Building, 1-8-3 Marunouchi, Chiyoda-ku, Tokyo 100-8283
          </p>
        </section>
      </div>

      <section className="min-h-[300px] overflow-hidden border-2 border-on-background bg-surface-variant">
        <iframe
          title="Alliance Global Tower main office map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7467403329492!2d121.0521641758739!3d14.556470178153951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f53cd592f5%3A0x551030a34dbd4ca6!2sAlliance%20Global%20Tower!5e0!3m2!1sen!2sph!4v1780755947623!5m2!1sen!2sph"
          className="h-full min-h-[300px] w-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}

function modalTitle(modal: Exclude<FooterModal, null>) {
  if (modal === "about") return "About Us";
  if (modal === "faqs") return "Frequently Asked Questions";
  if (modal === "privacy") return "Privacy Policy";
  return "Contact Details";
}

function modalEyebrow(modal: Exclude<FooterModal, null>) {
  if (modal === "about") return "Company Overview";
  if (modal === "faqs") return "Support";
  if (modal === "privacy") return "Data Privacy";
  return "Inspire Holdings Inc.";
}

export function MainFooter() {
  const [activeModal, setActiveModal] = useState<FooterModal>(null);

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
                "href" in link ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-label text-xs font-black uppercase text-white transition-colors hover:text-tertiary-fixed"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => setActiveModal(link.modal)}
                    className="font-label text-left text-xs font-black uppercase text-white transition-colors hover:text-tertiary-fixed"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>
          </div>

          <div className="min-w-0">
            <h2 className="font-headline text-sm uppercase text-white">Support</h2>
            <nav className="mt-5 flex flex-col items-start gap-3" aria-label="Footer support links">
              {supportLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => setActiveModal(link.modal)}
                  className="font-label text-left text-xs font-black uppercase text-white transition-colors hover:text-tertiary-fixed"
                >
                  {link.label}
                </button>
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

      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          aria-modal="true"
          role="dialog"
        >
          <div className="flex max-h-[74vh] w-full max-w-5xl flex-col border-4 border-on-background bg-background text-on-background shadow-[8px_8px_0_0_#1c1b1b] animate-scale-up">
            <div className="flex items-start justify-between gap-4 border-b-4 border-on-background p-4">
              <div>
                <p className="font-label text-[10px] font-black uppercase text-outline">
                  {modalEyebrow(activeModal)}
                </p>
                <h3 className="mt-1 font-headline text-xl font-black uppercase text-secondary sm:text-2xl">
                  {modalTitle(activeModal)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center border-4 border-on-background bg-secondary font-headline text-lg font-black text-white shadow-[2px_2px_0_0_#1c1b1b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#1c1b1b] active:translate-x-0 active:translate-y-0 active:shadow-none"
                aria-label="Close modal"
              >
                X
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              <ModalContent modal={activeModal} />
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
