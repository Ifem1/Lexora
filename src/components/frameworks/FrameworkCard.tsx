"use client";

import React from "react";
import { CheckCircle2, Scale } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { ArbitrationFramework } from "@/lib/genlayer/types";
import Badge from "@/components/ui/Badge";

interface FrameworkCardProps {
  framework: ArbitrationFramework;
  selected?: boolean;
  onSelect?: (framework: ArbitrationFramework) => void;
  onViewDetail?: (framework: ArbitrationFramework) => void;
  className?: string;
}

export default function FrameworkCard({
  framework,
  selected = false,
  onSelect,
  onViewDetail,
  className,
}: FrameworkCardProps) {
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      onClick={() => onSelect?.(framework)}
      className={cn(
        "rounded-lg p-5 flex flex-col gap-4 cursor-pointer transition-all",
        className
      )}
      style={{
        backgroundColor: selected ? "rgba(198,156,93,0.06)" : "#171B20",
        border: selected
          ? "1.5px solid rgba(198,156,93,0.45)"
          : "1px solid rgba(241,232,210,0.14)",
        boxShadow: selected ? "0 0 20px rgba(198,156,93,0.12)" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: "rgba(198,156,93,0.1)" }}
          >
            {framework.icon || <Scale size={16} style={{ color: "#C69C5D" }} />}
          </div>
          <div>
            <h3
              className="text-sm font-semibold leading-tight"
              style={{ color: "#F1E8D2", fontFamily: "Cinzel, serif" }}
            >
              {framework.title}
            </h3>
            <Badge variant="framework" size="sm" className="mt-1">
              {framework.category}
            </Badge>
          </div>
        </div>
        {selected && (
          <CheckCircle2 size={16} className="shrink-0" style={{ color: "#C69C5D" }} />
        )}
      </div>

      {/* Description */}
      <p className="text-xs line-clamp-2" style={{ color: "rgba(241,232,210,0.5)" }}>
        {framework.description}
      </p>

      {/* Principles preview */}
      <div className="flex flex-col gap-1.5">
        {framework.principles.slice(0, 2).map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              className="w-1 h-1 rounded-full shrink-0 mt-1.5"
              style={{ backgroundColor: "rgba(198,156,93,0.5)" }}
            />
            <p className="text-xs" style={{ color: "rgba(241,232,210,0.45)" }}>
              {p}
            </p>
          </div>
        ))}
        {framework.principles.length > 2 && (
          <p className="text-[10px]" style={{ color: "rgba(241,232,210,0.25)" }}>
            +{framework.principles.length - 2} more principles
          </p>
        )}
      </div>

      {/* Burden of proof */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(241,232,210,0.08)" }}>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(241,232,210,0.3)" }}>
          Burden
        </span>
        <span className="text-[10px] font-semibold" style={{ color: "#C69C5D" }}>
          {framework.burdenOfProof}
        </span>
      </div>

      {onViewDetail && (
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetail(framework); }}
          className="text-xs text-left transition-opacity hover:opacity-80"
          style={{ color: "rgba(198,156,93,0.6)" }}
        >
          View full details →
        </button>
      )}
    </motion.div>
  );
}
