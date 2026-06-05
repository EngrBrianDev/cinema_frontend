import type { ReactNode } from "react";

export function HardShadowCard({
  children,
  shadow = "black",
}: {
  children: ReactNode;
  shadow?: "black" | "red" | "yellow";
}) {
  const shadowClass =
    shadow === "red" ? "hard-shadow-red" : shadow === "yellow" ? "hard-shadow-yellow" : "hard-shadow-black";

  return <div className={`rounded border-2 border-black bg-white p-6 ${shadowClass}`}>{children}</div>;
}
