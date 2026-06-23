"use client";

import React from "react";
import { ChevronRight, Radio } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CaseStatus } from "@/lib/genlayer/types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProceduralTopStripProps {
  breadcrumbs?: BreadcrumbItem[];
  currentStatus?: CaseStatus;
  className?: string;
}

const STAGES: { key: CaseStatus | "START"; label: string }[] = [
  { key: "DRAFT", label: "Created" },
  { key: "AWAITING_RESPONDENT", label: "Claim" },
  { key: "RESPONSE_WINDOW", label: "Response" },
  { key: "SUBMISSIONS_OPEN", label: "Evidence" },
  { key: "UNDER_REVIEW", label: "Review" },
  { key: "RULING_ISSUED", label: "Ruling" },
  { key: "ACCEPTED", label: "Final" },
];

const STATUS_ORDER: CaseStatus[] = [
  "DRAFT",
  "AWAITING_RESPONDENT",
  "RESPONSE_WINDOW",
  "SUBMISSIONS_OPEN",
  "UNDER_REVIEW",
  "RULING_ISSUED",
  "ACCEPTED",
];

function getStageIndex(status?: CaseStatus) {
  if (!status) return -1;
  return STATUS_ORDER.indexOf(status);
}

export default function ProceduralTopStrip({
  breadcrumbs,
  currentStatus,
  className,
}: ProceduralTopStripProps) {
  const currentIdx = getStageIndex(currentStatus);

  return (
    <div
      className={cn("flex items-center justify-between px-4 shrink-0 gap-4", className)}
      style={{
        height: 48,
        backgroundColor: "#0B0D10",
        borderBottom: "1px solid rgba(241,232,210,0.10)",
      }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight size={12} style={{ color: "rgba(241,232,210,0.25)" }} />
              )}
              <span
                className="text-xs truncate"
                style={{
                  color:
                    i === breadcrumbs.length - 1
                      ? "#F1E8D2"
                      : "rgba(241,232,210,0.4)",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                }}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))
        ) : (
          <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>
            Lexora Arbitration
          </span>
        )}
      </div>

      {/* Stage pills */}
      {currentStatus && (
        <div className="hidden md:flex items-center gap-1">
          {STAGES.map((stage, i) => {
            const stageStatus = stage.key as CaseStatus;
            const stageIdx = getStageIndex(stageStatus);
            const isDone = stageIdx < currentIdx;
            const isCurrent = stageIdx === currentIdx;

            return (
              <React.Fragment key={stage.key}>
                {i > 0 && (
                  <div
                    className="w-4 h-px"
                    style={{
                      backgroundColor: isDone
                        ? "rgba(198,156,93,0.5)"
                        : "rgba(241,232,210,0.12)",
                    }}
                  />
                )}
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isCurrent
                        ? "#C69C5D"
                        : isDone
                        ? "rgba(198,156,93,0.5)"
                        : "rgba(241,232,210,0.15)",
                      boxShadow: isCurrent
                        ? "0 0 6px rgba(198,156,93,0.6)"
                        : "none",
                    }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-wider hidden lg:block"
                    style={{
                      color: isCurrent
                        ? "#C69C5D"
                        : isDone
                        ? "rgba(198,156,93,0.5)"
                        : "rgba(241,232,210,0.2)",
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Network */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Radio size={10} style={{ color: "#648F70" }} />
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "#648F70" }}
        >
          GenLayer Testnet
        </span>
      </div>
    </div>
  );
}
