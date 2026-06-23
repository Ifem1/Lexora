"use client";

import React from "react";
import { Map } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EvidenceMapItem } from "@/lib/genlayer/types";
import EvidenceMap from "@/components/evidence/EvidenceMap";

interface EvidenceMappingPanelProps {
  evidenceMap: EvidenceMapItem[];
  className?: string;
}

export default function EvidenceMappingPanel({ evidenceMap, className }: EvidenceMappingPanelProps) {
  const claimantCount = evidenceMap.filter((e) => e.supports === "claimant").length;
  const respondentCount = evidenceMap.filter((e) => e.supports === "respondent").length;
  const neutralCount = evidenceMap.filter((e) => e.supports === "neutral").length;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Summary stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Map size={13} style={{ color: "#C69C5D" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#C69C5D" }}>
            Evidence Mapping
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs flex items-center gap-1" style={{ color: "#6B8FB3" }}>
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: "#6B8FB3" }}
            />
            {claimantCount} claimant
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: "#A94343" }}>
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: "#A94343" }}
            />
            {respondentCount} respondent
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: "rgba(241,232,210,0.4)" }}>
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: "rgba(241,232,210,0.2)" }}
            />
            {neutralCount} neutral
          </span>
        </div>
      </div>

      <EvidenceMap items={evidenceMap} />
    </div>
  );
}
