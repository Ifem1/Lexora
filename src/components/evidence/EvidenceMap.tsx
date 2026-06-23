"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { EvidenceMapItem } from "@/lib/genlayer/types";

interface EvidenceMapProps {
  items: EvidenceMapItem[];
  className?: string;
}

const SUPPORT_CONFIG: Record<
  EvidenceMapItem["supports"],
  { color: string; bg: string; border: string; label: string; Icon: React.ElementType }
> = {
  claimant: {
    color: "#6B8FB3",
    bg: "rgba(107,143,179,0.1)",
    border: "rgba(107,143,179,0.25)",
    label: "Claimant",
    Icon: TrendingUp,
  },
  respondent: {
    color: "#A94343",
    bg: "rgba(169,67,67,0.1)",
    border: "rgba(169,67,67,0.25)",
    label: "Respondent",
    Icon: TrendingDown,
  },
  neutral: {
    color: "rgba(241,232,210,0.45)",
    bg: "rgba(241,232,210,0.05)",
    border: "rgba(241,232,210,0.12)",
    label: "Neutral",
    Icon: Minus,
  },
};

const WEIGHT_BADGE: Record<EvidenceMapItem["weight"], { label: string; color: string }> = {
  high: { label: "High", color: "#C69C5D" },
  medium: { label: "Med", color: "#C58B3B" },
  low: { label: "Low", color: "rgba(241,232,210,0.35)" },
};

export default function EvidenceMap({ items, className }: EvidenceMapProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item, i) => {
        const cfg = SUPPORT_CONFIG[item.supports];
        const weight = WEIGHT_BADGE[item.weight];
        const Icon = cfg.Icon;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg px-4 py-3 flex items-start gap-3"
            style={{
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
            }}
          >
            <Icon size={14} className="shrink-0 mt-0.5" style={{ color: cfg.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#F1E8D2", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {item.evidenceTitle}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: "rgba(241,232,210,0.06)",
                      color: weight.color,
                    }}
                  >
                    {weight.label}
                  </span>
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(241,232,210,0.45)" }}>
                {item.reason}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
