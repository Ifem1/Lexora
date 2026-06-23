"use client";

import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { ArbitrationCase } from "@/lib/genlayer/types";

interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  note?: string;
}

interface ProceduralChecklistProps {
  caseData: ArbitrationCase;
  responseWindowClosed?: boolean;
  className?: string;
}

export default function ProceduralChecklist({
  caseData,
  responseWindowClosed = false,
  className,
}: ProceduralChecklistProps) {
  const items: ChecklistItem[] = [
    {
      key: "claim",
      label: "Claim submitted",
      done: !!caseData.claimHash,
      note: caseData.claimHash ? "On-chain verified" : undefined,
    },
    {
      key: "response",
      label: "Response submitted",
      done: !!caseData.responseHash,
      note: !caseData.responseHash ? "Awaiting respondent" : "On-chain verified",
    },
    {
      key: "evidence",
      label: "Evidence anchored",
      done: !!caseData.evidenceRoot,
      note: caseData.evidenceRoot ? "Evidence root committed" : "No evidence root yet",
    },
    {
      key: "window",
      label: "Response window closed",
      done: responseWindowClosed,
      note: !responseWindowClosed ? "Window still open" : undefined,
    },
  ];

  const allDone = items.every((i) => i.done);

  return (
    <div
      className={cn("rounded-lg p-4 flex flex-col gap-3", className)}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(241,232,210,0.16)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(241,232,210,0.5)", fontFamily: "Space Grotesk, sans-serif" }}
      >
        Procedural Checklist
      </p>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            {item.done ? (
              <CheckSquare
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: "#C69C5D" }}
              />
            ) : (
              <Square
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: "rgba(241,232,210,0.2)" }}
              />
            )}
            <div>
              <p
                className="text-sm"
                style={{
                  color: item.done ? "#F1E8D2" : "rgba(241,232,210,0.4)",
                  fontWeight: item.done ? 500 : 400,
                }}
              >
                {item.label}
              </p>
              {item.note && (
                <p className="text-xs" style={{ color: "rgba(241,232,210,0.3)" }}>
                  {item.note}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded px-3 py-2 text-xs font-semibold text-center"
          style={{
            backgroundColor: "rgba(14,76,79,0.2)",
            color: "#648F70",
            border: "1px solid rgba(100,143,112,0.3)",
          }}
        >
          All conditions met — ruling can be requested
        </motion.div>
      )}
    </div>
  );
}
