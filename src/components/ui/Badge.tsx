"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "pending"
  | "active"
  | "ruling"
  | "accepted"
  | "appealed"
  | "settled"
  | "cancelled"
  | "evidence"
  | "framework";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  pending: {
    backgroundColor: "rgba(197,139,59,0.18)",
    color: "#C58B3B",
    border: "1px solid rgba(197,139,59,0.35)",
  },
  active: {
    backgroundColor: "rgba(14,76,79,0.3)",
    color: "#6BBFC3",
    border: "1px solid rgba(14,76,79,0.6)",
  },
  ruling: {
    backgroundColor: "rgba(198,156,93,0.18)",
    color: "#C69C5D",
    border: "1px solid rgba(198,156,93,0.4)",
  },
  accepted: {
    backgroundColor: "rgba(100,143,112,0.18)",
    color: "#648F70",
    border: "1px solid rgba(100,143,112,0.4)",
  },
  appealed: {
    backgroundColor: "rgba(107,143,179,0.18)",
    color: "#6B8FB3",
    border: "1px solid rgba(107,143,179,0.4)",
  },
  settled: {
    backgroundColor: "rgba(14,76,79,0.25)",
    color: "#648F70",
    border: "1px solid rgba(100,143,112,0.35)",
  },
  cancelled: {
    backgroundColor: "rgba(169,67,67,0.18)",
    color: "#A94343",
    border: "1px solid rgba(169,67,67,0.35)",
  },
  evidence: {
    backgroundColor: "rgba(107,143,179,0.18)",
    color: "#6B8FB3",
    border: "1px solid rgba(107,143,179,0.35)",
  },
  framework: {
    backgroundColor: "rgba(198,156,93,0.12)",
    color: "#C69C5D",
    border: "1px solid rgba(198,156,93,0.3)",
  },
};

export default function Badge({
  variant = "pending",
  children,
  className,
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full tracking-wide uppercase",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
