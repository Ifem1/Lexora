"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface ProceduralWarningsProps {
  warnings: string[];
  className?: string;
}

export default function ProceduralWarnings({ warnings, className }: ProceduralWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      className={cn("rounded-lg p-4 flex flex-col gap-3", className)}
      style={{
        backgroundColor: "rgba(197,139,59,0.06)",
        border: "1px solid rgba(197,139,59,0.2)",
      }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} style={{ color: "#C58B3B" }} />
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#C58B3B", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Procedural Warnings
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold ml-auto"
          style={{ backgroundColor: "rgba(197,139,59,0.18)", color: "#C58B3B" }}
        >
          {warnings.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {warnings.map((warning, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2"
          >
            <div
              className="w-1 h-1 rounded-full shrink-0 mt-1.5"
              style={{ backgroundColor: "#C58B3B" }}
            />
            <p className="text-xs" style={{ color: "rgba(241,232,210,0.65)" }}>
              {warning}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
