import type { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
};

export function PrimaryButton({ className = "", tone = "secondary", ...props }: PrimaryButtonProps) {
  const toneClass = tone === "primary" ? "bg-primary text-white" : "bg-secondary text-white";
  return (
    <button
      className={`motion-button font-headline rounded border-2 border-black px-5 py-3 text-sm font-bold uppercase shadow-[3px_3px_0_0_#1c1b1b] disabled:opacity-50 disabled:shadow-none ${toneClass} ${className}`}
      {...props}
    />
  );
}
