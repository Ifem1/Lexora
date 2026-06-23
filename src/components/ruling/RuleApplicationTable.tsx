"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import type { RuleApplication } from "@/lib/genlayer/types";

interface RuleApplicationTableProps {
  rules: RuleApplication[];
  className?: string;
}

type Finding = "satisfied" | "partial" | "not satisfied" | string;

function FindingBadge({ finding }: { finding: string }) {
  const lower = finding.toLowerCase();
  const isSatisfied = lower === "satisfied" || lower === "met" || lower === "complied";
  const isPartial = lower.includes("partial");
  const isNot = lower.includes("not") || lower === "failed" || lower === "breached";

  const color = isSatisfied ? "#648F70" : isPartial ? "#C58B3B" : isNot ? "#A94343" : "rgba(241,232,210,0.4)";
  const bg = isSatisfied
    ? "rgba(100,143,112,0.15)"
    : isPartial
    ? "rgba(197,139,59,0.15)"
    : isNot
    ? "rgba(169,67,67,0.15)"
    : "rgba(241,232,210,0.06)";

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {finding}
    </span>
  );
}

export default function RuleApplicationTable({ rules, className }: RuleApplicationTableProps) {
  return (
    <div
      className={cn("rounded-lg overflow-hidden", className)}
      style={{ border: "1px solid rgba(241,232,210,0.14)" }}
    >
      {/* Header */}
      <div
        className="grid grid-cols-[2fr_1fr_3fr] gap-3 px-4 py-2.5"
        style={{
          backgroundColor: "rgba(241,232,210,0.04)",
          borderBottom: "1px solid rgba(241,232,210,0.1)",
        }}
      >
        {["Rule", "Finding", "Reason"].map((h) => (
          <span
            key={h}
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: "rgba(241,232,210,0.4)", fontFamily: "Space Grotesk, sans-serif" }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {rules.map((rule, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_1fr_3fr] gap-3 px-4 py-3 items-start"
          style={{
            backgroundColor: i % 2 === 0 ? "transparent" : "rgba(241,232,210,0.02)",
            borderBottom:
              i < rules.length - 1 ? "1px solid rgba(241,232,210,0.06)" : "none",
          }}
        >
          <p className="text-xs font-medium" style={{ color: "#F1E8D2" }}>
            {rule.rule}
          </p>
          <div>
            <FindingBadge finding={rule.finding} />
          </div>
          <p className="text-xs" style={{ color: "rgba(241,232,210,0.55)" }}>
            {rule.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
