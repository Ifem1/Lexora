"use client";

import React from "react";
import { MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import ClaimStatementCard from "./ClaimStatementCard";
import EmptyState from "@/components/ui/EmptyState";

interface ResponseStatementCardProps {
  statement?: string;
  hash?: string;
  submittedAt?: number;
  submittedBy?: string;
  deadlineAt?: number;
  className?: string;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ResponseStatementCard({
  statement,
  hash,
  submittedAt,
  submittedBy,
  deadlineAt,
  className,
}: ResponseStatementCardProps) {
  if (statement && hash && submittedAt && submittedBy) {
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        {/* Override border to crimson accent */}
        <div
          className="rounded-lg p-5 flex flex-col gap-4"
          style={{
            backgroundColor: "#171B20",
            border: "1px solid rgba(169,67,67,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: "rgba(169,67,67,0.12)" }}
            >
              <MessageSquare size={14} style={{ color: "#A94343" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F1E8D2", fontFamily: "Space Grotesk, sans-serif" }}>
                Respondent Statement
              </p>
              <p className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>
                {formatDate(submittedAt)}
              </p>
            </div>
          </div>
          <div
            className="text-sm leading-relaxed rounded p-3"
            style={{
              color: "#F1E8D2",
              backgroundColor: "rgba(241,232,210,0.04)",
              fontFamily: "IBM Plex Sans, sans-serif",
              whiteSpace: "pre-wrap",
            }}
          >
            {statement}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-lg p-5 flex flex-col gap-4", className)}
      style={{
        backgroundColor: "#171B20",
        border: "1px dashed rgba(241,232,210,0.12)",
      }}
    >
      <EmptyState
        icon={<Clock size={22} />}
        title="Awaiting Response"
        description={
          deadlineAt
            ? `Response due by ${formatDate(deadlineAt)}`
            : "The respondent has not yet submitted their response."
        }
      />
    </div>
  );
}
