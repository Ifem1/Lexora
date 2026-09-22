"use client";

import React from "react";
import { Gavel, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { ArbitrationRuling, RulingOutcome } from "@/lib/genlayer/types";

interface RulingOutcomePanelProps {
  ruling: ArbitrationRuling;
  className?: string;
}

const OUTCOME_CONFIG: Record<
  RulingOutcome,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  CLAIMANT_PREVAILS: {
    label: "Claimant Prevails", color: "#6B8FB3", bg: "rgba(107,143,179,0.08)",
    border: "rgba(107,143,179,0.25)", description: "The ruling found for the claimant within the accepted agreement bounds.",
  },
  RESPONDENT_PREVAILS: {
    label: "Respondent Prevails", color: "#A94343", bg: "rgba(169,67,67,0.08)",
    border: "rgba(169,67,67,0.25)", description: "The ruling found for the respondent.",
  },
  PARTIAL: {
    label: "Partial", color: "#C58B3B", bg: "rgba(197,139,59,0.08)",
    border: "rgba(197,139,59,0.25)", description: "Responsibility or relief was only partially established.",
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient Evidence", color: "#C69C5D", bg: "rgba(198,156,93,0.08)",
    border: "rgba(198,156,93,0.2)", description: "The locked evidence was insufficient for a claimant award.",
  },
  PROCEDURAL_FAILURE: {
    label: "Procedural Failure", color: "rgba(241,232,210,0.55)", bg: "rgba(241,232,210,0.04)",
    border: "rgba(241,232,210,0.12)", description: "The dispute could not produce an enforceable outcome because the procedure materially failed.",
  },
};

function ArcMeter({ value, color }: { value: number; color: string }) {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const circumference = Math.PI * r; // half circle
  const offset = circumference * (1 - value / 100);

  return (
    <svg width={112} height={64} viewBox="0 0 112 64">
      {/* Track */}
      <path
        d={`M 12 56 A ${r} ${r} 0 0 1 100 56`}
        fill="none"
        stroke="rgba(241,232,210,0.08)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M 12 56 A ${r} ${r} 0 0 1 100 56`}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      {/* Value text */}
      <text
        x={cx}
        y={52}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fill={color}
        fontFamily="Cinzel, serif"
      >
        {value}%
      </text>
    </svg>
  );
}

export default function RulingOutcomePanel({ ruling, className }: RulingOutcomePanelProps) {
  const cfg = OUTCOME_CONFIG[ruling.outcome];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl p-6 flex flex-col gap-5", className)}
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 32px ${cfg.color}18`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${cfg.color}18`, border: `1.5px solid ${cfg.color}40` }}
        >
          <Gavel size={18} style={{ color: cfg.color }} />
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: "rgba(241,232,210,0.4)" }}
          >
            Ruling Outcome
          </p>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ color: cfg.color, fontFamily: "Cinzel, serif" }}
          >
            {cfg.label}
          </h2>
        </div>
      </div>

      {/* Confidence meter + description */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ArcMeter value={ruling.confidence} color={cfg.color} />
          </motion.div>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(241,232,210,0.3)" }}>
            Confidence
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm" style={{ color: "rgba(241,232,210,0.6)", lineHeight: 1.6 }}>
            {cfg.description}
          </p>
          <p
            className="text-xs mt-2 italic"
            style={{ color: "rgba(241,232,210,0.45)", fontFamily: "IBM Plex Sans, sans-serif" }}
          >
            {ruling.reasoningSummary}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid rgba(241,232,210,0.08)" }}>
        <Clock size={11} style={{ color: "rgba(241,232,210,0.3)" }} />
        <span className="text-[10px]" style={{ color: "rgba(241,232,210,0.3)" }}>
          Issued {new Date(ruling.createdAt).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
