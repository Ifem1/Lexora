"use client";

import React, { useState } from "react";
import { SlidersHorizontal, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import type { ArbitrationRuling, EvidenceMapItem } from "@/lib/genlayer/types";
import Badge from "@/components/ui/Badge";

interface RemedySimulatorProps {
  ruling: ArbitrationRuling;
  evidenceItems?: EvidenceMapItem[];
  className?: string;
}

interface WeightSlider {
  title: string;
  weight: number;
  supports: EvidenceMapItem["supports"];
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export default function RemedySimulator({
  ruling,
  evidenceItems,
  className,
}: RemedySimulatorProps) {
  const items = evidenceItems ?? ruling.evidenceMap;

  const [weights, setWeights] = useState<WeightSlider[]>(
    items.map((item) => ({
      title: item.evidenceTitle,
      weight: item.weight === "high" ? 80 : item.weight === "medium" ? 50 : 20,
      supports: item.supports,
    }))
  );

  // Derive simulated confidence from weights
  const claimantScore = weights
    .filter((w) => w.supports === "claimant")
    .reduce((s, w) => s + w.weight, 0);
  const respondentScore = weights
    .filter((w) => w.supports === "respondent")
    .reduce((s, w) => s + w.weight, 0);
  const total = claimantScore + respondentScore || 1;
  const simConfidence = Math.round((claimantScore / total) * 100);

  const simOutcome =
    simConfidence > 65
      ? "CLAIMANT_PREVAILS"
      : simConfidence < 35
      ? "RESPONDENT_PREVAILS"
      : "PARTIAL_SETTLEMENT";

  const outcomeColor =
    simOutcome === "CLAIMANT_PREVAILS"
      ? "#6B8FB3"
      : simOutcome === "RESPONDENT_PREVAILS"
      ? "#A94343"
      : "#C58B3B";

  const resetWeights = () => {
    setWeights(
      items.map((item) => ({
        title: item.evidenceTitle,
        weight: item.weight === "high" ? 80 : item.weight === "medium" ? 50 : 20,
        supports: item.supports,
      }))
    );
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} style={{ color: "#C69C5D" }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#C69C5D", fontFamily: "Space Grotesk, sans-serif" }}
          >
            Remedy Simulator
          </span>
        </div>
        <button
          onClick={resetWeights}
          className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
          style={{ color: "rgba(241,232,210,0.35)" }}
        >
          <RefreshCw size={11} />
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        {weights.map((item, i) => {
          const supportColor =
            item.supports === "claimant"
              ? "#6B8FB3"
              : item.supports === "respondent"
              ? "#A94343"
              : "rgba(241,232,210,0.35)";

          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "rgba(241,232,210,0.6)" }}>
                  {item.title}
                </p>
                <span className="text-xs font-semibold" style={{ color: supportColor }}>
                  {item.weight}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={item.weight}
                onChange={(e) => {
                  const next = [...weights];
                  next[i] = { ...next[i], weight: Number(e.target.value) };
                  setWeights(next);
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${supportColor} 0%, ${supportColor} ${item.weight}%, rgba(241,232,210,0.1) ${item.weight}%, rgba(241,232,210,0.1) 100%)`,
                  accentColor: supportColor,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Simulated outcome */}
      <motion.div
        layout
        className="rounded-lg p-4 flex flex-col gap-2"
        style={{
          backgroundColor: `${outcomeColor}08`,
          border: `1px solid ${outcomeColor}25`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(241,232,210,0.4)" }}>
            Simulated Outcome
          </span>
          <Badge
            variant={
              simOutcome === "CLAIMANT_PREVAILS"
                ? "active"
                : simOutcome === "RESPONDENT_PREVAILS"
                ? "cancelled"
                : "pending"
            }
          >
            {simConfidence}% confidence
          </Badge>
        </div>
        <p className="text-base font-bold" style={{ color: outcomeColor, fontFamily: "Cinzel, serif" }}>
          {simOutcome.replace(/_/g, " ")}
        </p>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(241,232,210,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: outcomeColor }}
            animate={{ width: `${simConfidence}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
