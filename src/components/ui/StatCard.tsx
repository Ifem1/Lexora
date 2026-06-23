"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export default function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  className,
  compact = false,
}: StatCardProps) {
  const trendColor =
    delta === undefined
      ? "rgba(241,232,210,0.4)"
      : delta > 0
      ? "#648F70"
      : delta < 0
      ? "#A94343"
      : "rgba(241,232,210,0.4)";

  const TrendIcon =
    delta === undefined || delta === 0
      ? Minus
      : delta > 0
      ? TrendingUp
      : TrendingDown;

  return (
    <div
      className={cn(
        "rounded-lg flex flex-col",
        compact ? "p-3 gap-1" : "p-4 gap-2",
        className
      )}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(241,232,210,0.16)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-xs uppercase tracking-widest font-semibold leading-tight"
          style={{ color: "rgba(241,232,210,0.5)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          {label}
        </p>
        {icon && (
          <span style={{ color: "#C69C5D" }} className="shrink-0 mt-0.5">
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn("font-bold leading-none", compact ? "text-xl" : "text-2xl")}
        style={{ color: "#F1E8D2", fontFamily: "Cinzel, serif" }}
      >
        {value}
      </p>
      {(delta !== undefined || deltaLabel) && (
        <div className="flex items-center gap-1">
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span className="text-xs" style={{ color: trendColor }}>
            {delta !== undefined && (
              <span>
                {delta > 0 ? "+" : ""}
                {delta}%
              </span>
            )}
            {deltaLabel && (
              <span className="ml-1 opacity-70">{deltaLabel}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
