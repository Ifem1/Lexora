"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface DossierShellProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export default function DossierShell({
  children,
  className,
  padded = true,
}: DossierShellProps) {
  return (
    <main
      className={cn(
        "flex-1 min-h-0 overflow-y-auto relative",
        padded && "p-6",
        className
      )}
      style={{ backgroundColor: "#0D1014" }}
    >
      {/* Subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(198,156,93,0.03) 0%, transparent 70%)",
        }}
      />
      {/* Dossier frame */}
      <div
        className="relative z-10 min-h-full rounded-xl"
        style={{
          backgroundColor: "#111418",
          border: "1px solid rgba(241,232,210,0.10)",
          boxShadow:
            "0 0 0 1px rgba(241,232,210,0.04), inset 0 1px 0 rgba(241,232,210,0.06), 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>
    </main>
  );
}
