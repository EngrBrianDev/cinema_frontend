"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// Custom Icon helper matching app/Home/page.tsx
function Icon({
  name,
  className = "",
}: {
  name: "account" | "cart" | "calendar" | "movie" | "star" | "ticket";
  className?: string;
}) {
  const base = `shrink-0 ${className}`;

  if (name === "ticket") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5v-2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M9 8.5v7M15 8.5v7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "account") {
    return (
      <svg aria-hidden="true" className={base} fill="none" viewBox="0 0 24 24">
        <path
          d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={base} fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9L12 2.8Z" />
    </svg>
  );
}

export function MainHeader() {
  const { user, logout, loginWithGoogle } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navItems = [
    { href: "/", label: "Movies" },
    { href: "/seats", label: "Seats" },
    { href: "/checkout", label: "Checkout" },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize and render Google Login button when Google script is loaded
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google) {
        clearInterval(interval);
        initGoogleSignIn();
      } else {
        attempts++;
        if (attempts > 20) clearInterval(interval); // Stop polling after 10s
      }
    }, 500);

    return () => clearInterval(interval);
  }, [user]); // Re-init if login state changes

  const initGoogleSignIn = () => {
    if (typeof window === "undefined" || !(window as any).google || user) return;

    try {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          try {
            await loginWithGoogle(response.credential);
            setDropdownOpen(false);
          } catch (err: any) {
            alert(`Authentication failed: ${err.message || err}`);
          }
        },
      });

      const buttonParent = document.getElementById("google-signin-btn");
      if (buttonParent) {
        (window as any).google.accounts.id.renderButton(buttonParent, {
          theme: "filled_blue",
          size: "large",
          width: 220,
        });
      }
    } catch (err) {
      console.error("Error initializing Google login:", err);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-secondary bg-primary shadow-[0_4px_0_var(--tertiary-fixed)]">
      <div className="mx-auto flex max-w-[1440px] flex-col px-3 py-2 sm:px-5 md:px-8 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:gap-4 xl:px-16">
        <div className="flex min-h-14 items-center justify-between gap-2 sm:gap-4 lg:min-h-0 lg:flex-1">
        {/* Left Side: Brand and Links */}
        <div className="flex min-w-0 items-center gap-4 lg:gap-7">
          <Link
            href="/"
            className="shrink-0 overflow-hidden rounded-lg bg-white p-1 shadow-sm transition-transform hover:scale-[1.03]"
            aria-label="Inspire Cinema home"
          >
            <Image
              src="/image/cinemalogo.png"
              alt="Inspire Cinema"
              width={1659}
              height={948}
              priority
              className="h-auto w-16 rounded-md object-contain sm:w-20 lg:w-20"
            />
          </Link>
          <nav className="hidden items-center gap-4 lg:flex lg:gap-6" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`font-label text-sm font-black uppercase transition-colors hover:text-tertiary-fixed ${
                  pathname === item.href ? "text-tertiary-fixed underline decoration-2 underline-offset-8" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: Account and Tickets */}
        <div className="relative flex shrink-0 items-center gap-2 sm:gap-3" ref={dropdownRef}>
          <Link href="/ticket" className="shrink-0">
            <button className="railroad-border flex min-h-11 items-center justify-center gap-2 bg-[#1c1b1b] px-3 text-tertiary-fixed transition-transform active:scale-95 cursor-pointer sm:px-4">
              <Icon className="h-5 w-5" name="ticket" />
              <span className="hidden font-label text-xs font-black uppercase leading-tight min-[380px]:block sm:text-sm">My Tickets</span>
            </button>
          </Link>

          {/* User Avatar Button */}
          <button
            aria-label="Account Settings"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded border-2 border-white bg-on-background text-tertiary-fixed hover:bg-secondary cursor-pointer transition-colors"
          >
            {user ? (
              <span className="font-headline text-lg font-bold uppercase">
                {user.name.charAt(0)}
              </span>
            ) : (
              <Icon className="h-7 w-7" name="account" />
            )}
          </button>

          {/* Account Dropdown Menu */}
          <div
            className={`absolute right-0 top-14 z-50 w-[min(18rem,calc(100vw-1.5rem))] border-4 border-on-background bg-background text-on-background p-4 shadow-[8px_8px_0_var(--tertiary-fixed)] transition-all sm:p-6 ${
              dropdownOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible pointer-events-none"
            }`}
          >
            {user ? (
              // Logged In State
              <div className="space-y-4">
                <div>
                  <p className="font-label text-xs uppercase text-outline">Logged in as</p>
                  <p className="font-headline text-lg font-black truncate">{user.name}</p>
                  <p className="font-body-md text-sm truncate text-outline">{user.email}</p>
                </div>
                
                <div className="border-t-2 border-on-background/10 pt-3 space-y-2">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="block text-center border-2 border-on-background bg-tertiary-fixed py-2 font-label text-xs font-black uppercase text-on-background hover:bg-[#ffe88f]"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-center border-2 border-on-background bg-secondary py-2 font-label text-xs font-black uppercase text-white hover:bg-red-700 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Logged Out State (Google Sign-In)
              <div className="space-y-4">
                <p className="font-headline text-base font-bold uppercase text-on-background text-center">
                  Sign in to book seats
                </p>
                <div className="border-t-2 border-on-background/10 pt-4 flex flex-col gap-2 items-center">
                  {/* Container for Google Render Button - always rendered to prevent DOM find failures */}
                  <div id="google-signin-btn" className="w-full flex justify-center"></div>
                  
                  <button
                    onClick={async () => {
                      try {
                        await loginWithGoogle("dev-token-customer");
                        setDropdownOpen(false);
                      } catch (err: any) {
                        alert(`Authentication failed: ${err.message || err}`);
                      }
                    }}
                    className="w-full border-2 border-on-background bg-tertiary-fixed py-2 font-label text-xs font-black uppercase text-on-background hover:bg-[#ffe88f] cursor-pointer"
                  >
                    Use Dev Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        <nav
          className="grid grid-cols-3 gap-2 border-t border-white/15 pt-2 lg:hidden"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`flex min-h-10 items-center justify-center border-2 px-2 text-center font-label text-[11px] font-black uppercase leading-tight transition-colors sm:text-xs ${
                pathname === item.href
                  ? "border-tertiary-fixed bg-tertiary-fixed text-on-background"
                  : "border-white/40 bg-white/5 text-white hover:border-tertiary-fixed hover:text-tertiary-fixed"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
