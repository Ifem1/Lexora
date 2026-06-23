"use client";

import React from "react";
import { Bot, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import Progress from "@/components/ui/Progress";

export interface ValidatorPerspective {
  validatorId: string;
  initialAssessment: string;
  confidence: number;
  keyFactors: string[];
}

interface ValidatorReasoningGridProps {
  validators: ValidatorPerspective[];
  className?: string;
}

const VALIDATOR_COLORS = ["#6B8FB3", "#C69C5D", "#648F70", "#C58B3B", "#A94343"];

export default function ValidatorReasoningGrid({
  validators,
  className,
}: ValidatorReasoningGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {validators.map((v, i) => {
        const color = VALIDATOR_COLORS[i % VALIDATOR_COLORS.length];
        return (
          <motion.div
            key={v.validatorId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg p-4 flex flex-col gap-3"
            style={{
              backgroundColor: "#171B20",
              border: `1px solid ${color}20`,
            }}
          >
            {/* Validator header */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}18` }}
              >
                <Bot size={13} style={{ color }} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color, fontFamily: "IBM Plex Mono, monospace" }}
                >
                  {v.validatorId}
                </p>
                <p className="text-[10px]" style={{ color: "rgba(241,232,210,0.3)" }}>
                  Validator Node
                </p>
              </div>
            </div>

            {/* Assessment */}
            <p className="text-xs" style={{ color: "rgba(241,232,210,0.65)" }}>
              {v.initialAssessment}
            </p>

            {/* Confidence */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <BarChart2 size={11} style={{ color: "rgba(241,232,210,0.3)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(241,232,210,0.35)" }}>
                    Confidence
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color }}>
                  {v.confidence}%
                </span>
              </div>
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(241,232,210,0.08)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${v.confidence}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 + 0.3 }}
                />
              </div>
            </div>

            {/* Key factors */}
            <div className="flex flex-col gap-1.5 pt-1" style={{ borderTop: "1px solid rgba(241,232,210,0.07)" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(241,232,210,0.3)" }}>
                Key Factors
              </p>
              {v.keyFactors.map((factor, fi) => (
                <div key={fi} className="flex items-start gap-1.5">
                  <div
                    className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: `${color}70` }}
                  />
                  <p className="text-[10px]" style={{ color: "rgba(241,232,210,0.45)" }}>
                    {factor}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
