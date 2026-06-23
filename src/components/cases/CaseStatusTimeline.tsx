"use client";

import React from "react";
import {
  Circle,
  CheckCircle2,
  Clock,
  Gavel,
  FileText,
  MessageSquare,
  Paperclip,
  Search,
  Award,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { CaseStatus } from "@/lib/genlayer/types";

interface TimelineStep {
  status: CaseStatus;
  label: string;
  description: string;
  timestamp?: number;
  icon: React.ElementType;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: "DRAFT", label: "Case Created", description: "Case drafted and submitted on-chain", icon: FileText },
  { status: "AWAITING_RESPONDENT", label: "Awaiting Response", description: "Respondent notified, response window open", icon: MessageSquare },
  { status: "RESPONSE_WINDOW", label: "Response Window", description: "Response period active", icon: Clock },
  { status: "SUBMISSIONS_OPEN", label: "Evidence Phase", description: "Both parties may submit evidence", icon: Paperclip },
  { status: "UNDER_REVIEW", label: "Under Review", description: "AI arbitrators deliberating", icon: Search },
  { status: "RULING_ISSUED", label: "Ruling Issued", description: "AI ruling published on-chain", icon: Gavel },
  { status: "ACCEPTED", label: "Final", description: "Ruling accepted and finalized", icon: Award },
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

interface CaseStatusTimelineProps {
  currentStatus: CaseStatus;
  statusHistory?: { status: CaseStatus; timestamp: number; note?: string }[];
  className?: string;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CaseStatusTimeline({
  currentStatus,
  statusHistory = [],
  className,
}: CaseStatusTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  const getTimestamp = (status: CaseStatus) => {
    return statusHistory.find((h) => h.status === status)?.timestamp;
  };

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {TIMELINE_STEPS.map((step, i) => {
        const stageIdx = STATUS_ORDER.indexOf(step.status);
        const isDone = stageIdx < currentIdx;
        const isCurrent = stageIdx === currentIdx;
        const isFuture = stageIdx > currentIdx;
        const timestamp = getTimestamp(step.status);
        const Icon = step.icon;

        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="flex items-start gap-3 relative"
          >
            {/* Vertical line */}
            {i < TIMELINE_STEPS.length - 1 && (
              <div
                className="absolute left-4 top-8 bottom-0 w-px"
                style={{
                  backgroundColor: isDone
                    ? "rgba(198,156,93,0.35)"
                    : "rgba(241,232,210,0.08)",
                  height: "calc(100% - 8px)",
                }}
              />
            )}

            {/* Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
              style={{
                backgroundColor: isCurrent
                  ? "rgba(14,76,79,0.3)"
                  : isDone
                  ? "rgba(198,156,93,0.12)"
                  : "rgba(241,232,210,0.04)",
                border: isCurrent
                  ? "1.5px solid #0E4C4F"
                  : isDone
                  ? "1.5px solid rgba(198,156,93,0.4)"
                  : "1.5px solid rgba(241,232,210,0.08)",
                boxShadow: isCurrent ? "0 0 12px rgba(14,76,79,0.5), 0 0 24px rgba(14,76,79,0.2)" : isDone ? "0 0 8px rgba(198,156,93,0.1)" : "none",
                animation: isCurrent ? "pulse-brass 2s ease-in-out infinite" : "none",
              }}
            >
              <Icon
                size={14}
                style={{
                  color: isCurrent
                    ? "#6BBFC3"
                    : isDone
                    ? "#C69C5D"
                    : "rgba(241,232,210,0.2)",
                }}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-0.5 pb-5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: isCurrent
                      ? "#6BBFC3"
                      : isDone
                      ? "#C69C5D"
                      : "rgba(241,232,210,0.25)",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <span className="text-[10px] shrink-0" style={{ color: "rgba(241,232,210,0.3)" }}>
                    {formatDate(timestamp)}
                  </span>
                )}
              </div>
              <p
                className="text-xs"
                style={{
                  color: isFuture ? "rgba(241,232,210,0.2)" : "rgba(241,232,210,0.45)",
                }}
              >
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
