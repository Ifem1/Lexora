"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "parchment" | "crimson";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    backgroundColor: "#171B20",
    border: "1px solid rgba(241,232,210,0.16)",
  },
  parchment: {
    backgroundColor: "#F1E8D2",
    border: "1px solid rgba(198,156,93,0.3)",
    color: "#0B0D10",
  },
  crimson: {
    backgroundColor: "rgba(125,31,42,0.15)",
    border: "1px solid rgba(125,31,42,0.4)",
  },
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export default function Card({
  variant = "default",
  glow = false,
  padding = "md",
  children,
  className,
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("rounded-lg", paddingStyles[padding], className)}
      style={{
        ...variantStyles[variant],
        ...(glow
          ? {
              boxShadow:
                "0 0 0 1px rgba(198,156,93,0.3), 0 4px 24px rgba(198,156,93,0.12)",
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
