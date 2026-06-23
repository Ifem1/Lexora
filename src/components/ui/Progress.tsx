"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "brass" | "teal" | "crimson" | "amber" | "green";
  className?: string;
}

const colorMap: Record<string, string> = {
  brass: "#C69C5D",
  teal: "#0E4C4F",
  crimson: "#7D1F2A",
  amber: "#C58B3B",
  green: "#648F70",
};

const heightMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export default function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  color = "brass",
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = colorMap[color];

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: "rgba(241,232,210,0.5)" }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold" style={{ color: fillColor }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn("w-full rounded-full overflow-hidden", heightMap[size])}
        style={{ backgroundColor: "rgba(241,232,210,0.08)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
