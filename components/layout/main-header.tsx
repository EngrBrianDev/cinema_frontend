"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

function hasValidCheckoutSummary() {
  if (typeof window === "undefined") return false;

  if (sessionStorage.getItem("checkout_entry_allowed") !== "true") return false;

  const stored = localStorage.getItem("checkout_summary");
  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored);
    return (
      Array.isArray(parsed.selectedSeats) &&
      parsed.selectedSeats.length > 0 &&
      Array.isArray(parsed.seatIds) &&
      parsed.seatIds.length > 0
    );
  } catch {
    return false;
  }
}

export function MainHeader() {
  const { user, logout, loginWithGoogle } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const effectiveCheckoutAvailable = hasMounted && checkoutAvailable;
  const checkoutLocked = pathname === "/checkout" && effectiveCheckoutAvailable;
  const showCheckoutTab = pathname === "/checkout" && effectiveCheckoutAvailable;
  const navItems = [
    { href: "/", label: "Movies" },
    { href: "/seats", label: "Seats" },
    { href: "/checkout", label: "Checkout" },
  ];
  const visibleNavItems = navItems.filter((item) => item.href !== "/checkout" || showCheckoutTab);

  useEffect(() => {
    const syncCheckoutState = () => setCheckoutAvailable(hasValidCheckoutSummary());

    syncCheckoutState();
    setHasMounted(true);
    window.addEventListener("storage", syncCheckoutState);
    window.addEventListener("focus", syncCheckoutState);

    return () => {
      window.removeEventListener("storage", syncCheckoutState);
      window.removeEventListener("focus", syncCheckoutState);
    };
  }, [pathname]);

  useEffect(() => {
    if (checkoutLocked) {
      setDropdownOpen(false);
    }
  }, [checkoutLocked]);

  useEffect(() => {
    if (!hasMounted) return;

    const activeCheckoutLock = hasValidCheckoutSummary();
    if (checkoutAvailable !== activeCheckoutLock) {
      setCheckoutAvailable(activeCheckoutLock);
    }

    if (activeCheckoutLock && pathname !== "/checkout") {
      window.history.replaceState({ checkoutLocked: true }, "", "/checkout");
      router.replace("/checkout");
    }
  }, [hasMounted, checkoutAvailable, pathname, router]);

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

  function initGoogleSignIn() {
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
  }

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

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b-4 border-secondary bg-primary shadow-[0_4px_0_var(--tertiary-fixed)]"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col px-3 py-2 sm:px-5 md:px-8 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:gap-4 xl:px-16">
        <div className="flex min-h-14 items-center justify-between gap-2 sm:gap-4 lg:min-h-0 lg:flex-1">
        {/* Left Side: Brand and Links */}
        <div className="flex min-w-0 items-center gap-4 lg:gap-7">
          <div className="shrink-0" aria-label="Inspire Cinema">
            <Image
              src="/image/cinemalogo4.png"
              alt="Inspire Cinema"
              width={1659}
              height={948}
              priority
              className="h-auto w-20 object-contain min-[380px]:w-24 sm:w-28 lg:w-32 [min-width:1800px]:w-36 [min-width:2400px]:w-40"
            />
          </div>
          <nav className="hidden items-center gap-4 lg:flex lg:gap-6" aria-label="Primary navigation">
            {visibleNavItems.map((item) => {
              const navigationLocked = checkoutLocked && item.href !== "/checkout";
              const disabled = navigationLocked;
              const className = `motion-button font-label text-sm font-black uppercase transition-colors ${
                pathname === item.href ? "text-tertiary-fixed underline decoration-2 underline-offset-8" : "text-white"
              } ${disabled ? "cursor-not-allowed opacity-50 hover:text-white" : "hover:text-tertiary-fixed"}`;

              if (disabled) {
                return (
                  <span
                    key={item.href}
                    className={className}
                    aria-disabled="true"
                    title="Finish payment or cancel checkout first"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link href={item.href} key={item.href} className={className} transitionTypes={["nav-forward"]}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Account and Tickets */}
        <div className="relative flex shrink-0 items-center gap-2 sm:gap-3" ref={dropdownRef}>
          {checkoutLocked ? (
            <div className="shrink-0 opacity-50" aria-disabled="true" title="Finish payment or cancel checkout first">
              <button
                disabled
                className="railroad-border flex min-h-11 cursor-not-allowed items-center justify-center gap-2 bg-[#1c1b1b] px-3 text-tertiary-fixed sm:px-4"
              >
                <Icon className="h-5 w-5" name="ticket" />
                <span className="hidden font-label text-xs font-black uppercase leading-tight min-[380px]:block sm:text-sm">My Tickets</span>
              </button>
            </div>
          ) : (
            <Link href="/ticket" className="shrink-0" transitionTypes={["nav-forward"]}>
              <button className="motion-button railroad-border flex min-h-11 items-center justify-center gap-2 bg-[#1c1b1b] px-3 text-tertiary-fixed transition-transform active:scale-95 cursor-pointer sm:px-4">
                <Icon className="h-5 w-5" name="ticket" />
                <span className="hidden font-label text-xs font-black uppercase leading-tight min-[380px]:block sm:text-sm">My Tickets</span>
              </button>
            </Link>
          )}

          {/* User Avatar Button */}
          <button
            aria-label="Account Settings"
            disabled={checkoutLocked}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`motion-button flex h-11 w-11 shrink-0 items-center justify-center rounded border-2 border-white bg-on-background text-tertiary-fixed transition-colors ${
              checkoutLocked ? "cursor-not-allowed opacity-50" : "hover:bg-secondary cursor-pointer"
            }`}
            title={checkoutLocked ? "Finish payment or cancel checkout first" : undefined}
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
            className={`absolute right-0 top-14 z-50 w-[min(18rem,calc(100vw-1.5rem))] origin-top-right border-4 border-on-background bg-background text-on-background p-4 shadow-[8px_8px_0_var(--tertiary-fixed)] transition-all sm:p-6 ${
              dropdownOpen ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
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
                      className="motion-button block text-center border-2 border-on-background bg-tertiary-fixed py-2 font-label text-xs font-black uppercase text-on-background hover:bg-[#ffe88f]"
                      transitionTypes={["nav-forward"]}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="motion-button w-full text-center border-2 border-on-background bg-secondary py-2 font-label text-xs font-black uppercase text-white hover:bg-red-700 cursor-pointer"
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
                  
                  {/* FE-HIGH-02 FIX: Dev login only in non-production */}
                  {process.env.NODE_ENV !== "production" && (
                  <button
                    onClick={async () => {
                      try {
                        await loginWithGoogle("dev-token-customer");
                        setDropdownOpen(false);
                      } catch (err: any) {
                        alert(`Authentication failed: ${err.message || err}`);
                      }
                    }}
                    className="motion-button w-full border-2 border-on-background bg-tertiary-fixed py-2 font-label text-xs font-black uppercase text-on-background hover:bg-[#ffe88f] cursor-pointer"
                  >
                    Use Dev Login
                  </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        <nav
          className={`grid gap-2 border-t border-white/15 pt-2 lg:hidden ${
            showCheckoutTab ? "grid-cols-3" : "grid-cols-2"
          }`}
          aria-label="Primary navigation"
        >
          {visibleNavItems.map((item) => {
            const navigationLocked = checkoutLocked && item.href !== "/checkout";
            const disabled = navigationLocked;
            const className = `motion-button flex min-h-10 items-center justify-center border-2 px-2 text-center font-label text-[11px] font-black uppercase leading-tight transition-colors sm:text-xs ${
              pathname === item.href
                ? "border-tertiary-fixed bg-tertiary-fixed text-on-background"
                : "border-white/40 bg-white/5 text-white"
            } ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-tertiary-fixed hover:text-tertiary-fixed"}`;

            if (disabled) {
              return (
                <span
                  key={item.href}
                  className={className}
                  aria-disabled="true"
                  title="Finish payment or cancel checkout first"
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link href={item.href} key={item.href} className={className} transitionTypes={["nav-forward"]}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
