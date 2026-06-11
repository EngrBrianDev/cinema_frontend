import { ViewTransition } from "react";
import type { ReactNode } from "react";

export function PageTransitionShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-reveal",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-hide",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
