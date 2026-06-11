import type { ReactNode } from "react";

export function HardShadowCard({
  children,
  shadow = "black",
  className = "",
}: {
  children: ReactNode;
  shadow?: "black" | "red" | "yellow";
  className?: string;
}) {
  const shadowClass =
    shadow === "red" ? "hard-shadow-red" : shadow === "yellow" ? "hard-shadow-yellow" : "hard-shadow-black";

  return <div className={`motion-card rounded border-2 border-black bg-white p-6 ${shadowClass} ${className}`}>{children}</div>;
}
