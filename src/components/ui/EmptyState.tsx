"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import Button from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4 py-14 px-6 rounded-lg",
        className
      )}
      style={{
        backgroundColor: "rgba(23,27,32,0.5)",
        border: "1px dashed rgba(241,232,210,0.14)",
      }}
    >
      {icon && (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(198,156,93,0.08)",
            color: "rgba(198,156,93,0.5)",
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h3
          className="text-base font-semibold"
          style={{ color: "#F1E8D2", fontFamily: "Cinzel, serif" }}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm max-w-xs" style={{ color: "rgba(241,232,210,0.45)" }}>
            {description}
          </p>
        )}
      </div>
      {ctaLabel && onCta && (
        <Button variant="primary" size="sm" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
