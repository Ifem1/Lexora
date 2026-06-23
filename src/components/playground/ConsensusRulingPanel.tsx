"use client";

import React, { useState } from "react";
import { Gavel, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import type { ArbitrationRuling } from "@/lib/genlayer/types";
import RulingOutcomePanel from "@/components/ruling/RulingOutcomePanel";
import RemedyPanel from "@/components/ruling/RemedyPanel";
import RuleApplicationTable from "@/components/ruling/RuleApplicationTable";
import Button from "@/components/ui/Button";

interface ConsensusRulingPanelProps {
  ruling: ArbitrationRuling;
  revealed?: boolean;
  onReveal?: () => void;
  className?: string;
}

export default function ConsensusRulingPanel({
  ruling,
  revealed: controlledRevealed,
  onReveal,
  className,
}: ConsensusRulingPanelProps) {
  const [internalRevealed, setInternalRevealed] = useState(false);
  const revealed = controlledRevealed ?? internalRevealed;

  const handleReveal = () => {
    setInternalRevealed(true);
    onReveal?.();
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Reveal gate */}
      <AnimatePresence>
        {!revealed ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl p-10 flex flex-col items-center gap-5 text-center"
            style={{
              backgroundColor: "rgba(198,156,93,0.04)",
              border: "1px solid rgba(198,156,93,0.18)",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(198,156,93,0.1)", border: "1.5px solid rgba(198,156,93,0.3)" }}
            >
              <Gavel size={28} style={{ color: "#C69C5D" }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "#F1E8D2", fontFamily: "Cinzel, serif" }}>
                Consensus Ruling Ready
              </h3>
              <p className="text-sm mt-1" style={{ color: "rgba(241,232,210,0.45)" }}>
                All validators have deliberated. Click to reveal the final ruling.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles size={16} />}
              onClick={handleReveal}
            >
              Reveal Ruling
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} style={{ color: "#C69C5D" }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#C69C5D", fontFamily: "Space Grotesk, sans-serif" }}
              >
                Consensus Ruling
              </span>
            </div>

            <RulingOutcomePanel ruling={ruling} />
            <RemedyPanel remedy={ruling.remedy} />

            {ruling.ruleApplication.length > 0 && (
              <div className="flex flex-col gap-3">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(241,232,210,0.4)", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Rule Application
                </p>
                <RuleApplicationTable rules={ruling.ruleApplication} />
              </div>
            )}

            {ruling.safetyBoundary && (
              <div
                className="rounded p-3 text-xs"
                style={{
                  backgroundColor: "rgba(197,139,59,0.06)",
                  border: "1px solid rgba(197,139,59,0.18)",
                  color: "rgba(241,232,210,0.5)",
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              >
                <span style={{ color: "#C58B3B" }}>SAFETY: </span>
                {ruling.safetyBoundary}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
