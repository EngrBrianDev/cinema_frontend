import type { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
};

export function PrimaryButton({ className = "", tone = "secondary", ...props }: PrimaryButtonProps) {
  const toneClass = tone === "primary" ? "bg-primary text-white" : "bg-secondary text-white";
  return (
    <button
      className={`font-headline rounded border-2 border-black px-5 py-3 text-sm font-bold uppercase ${toneClass} ${className}`}
      {...props}
    />
  );
}
