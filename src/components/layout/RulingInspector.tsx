"use client";

import React, { useState } from "react";
import { ChevronRight, X, Gavel, Users, BookOpen, Percent } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import type { ArbitrationCase, ArbitrationRuling } from "@/lib/genlayer/types";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import Button from "@/components/ui/Button";

interface RulingInspectorProps {
  caseData?: ArbitrationCase;
  ruling?: ArbitrationRuling;
  onQuickAction?: (action: string) => void;
  className?: string;
}

function truncateAddress(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function mapStatusToVariant(status: string) {
  const map: Record<string, "pending" | "active" | "ruling" | "accepted" | "appealed" | "settled" | "cancelled"> = {
    DRAFT: "pending",
    AWAITING_RESPONDENT: "pending",
    SUBMISSIONS_OPEN: "active",
    RESPONSE_WINDOW: "active",
    UNDER_REVIEW: "active",
    RULING_ISSUED: "ruling",
    ACCEPTED: "accepted",
    APPEALED: "appealed",
    SETTLED: "settled",
    CANCELLED: "cancelled",
  };
  return map[status] ?? "pending";
}

export default function RulingInspector({
  caseData,
  ruling,
  onQuickAction,
  className,
}: RulingInspectorProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AnimatePresence initial={false}>
      {collapsed ? (
        <motion.button
          key="collapsed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex flex-col items-center justify-center w-8 shrink-0 h-full cursor-pointer transition-colors"
          style={{
            backgroundColor: "#0B0D10",
            borderLeft: "1px solid rgba(241,232,210,0.10)",
            color: "rgba(241,232,210,0.3)",
          }}
        >
          <ChevronRight size={14} />
        </motion.button>
      ) : (
        <motion.aside
          key="open"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "hidden lg:flex flex-col h-full shrink-0 overflow-hidden",
            className
          )}
          style={{
            backgroundColor: "#0B0D10",
            borderLeft: "1px solid rgba(241,232,210,0.10)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 h-12 shrink-0"
            style={{ borderBottom: "1px solid rgba(241,232,210,0.10)" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(241,232,210,0.5)", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Inspector
            </span>
            <button
              onClick={() => setCollapsed(true)}
              style={{ color: "rgba(241,232,210,0.3)" }}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
            {/* Ruling summary */}
            {ruling && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Gavel size={13} style={{ color: "#C69C5D" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#C69C5D" }}>
                    Ruling
                  </span>
                </div>
                <div
                  className="rounded-lg p-3 flex flex-col gap-2"
                  style={{ backgroundColor: "rgba(198,156,93,0.06)", border: "1px solid rgba(198,156,93,0.18)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "#F1E8D2" }}>
                    {ruling.outcome.replace(/_/g, " ")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Percent size={11} style={{ color: "rgba(241,232,210,0.4)" }} />
                    <span className="text-xs" style={{ color: "rgba(241,232,210,0.6)" }}>
                      {ruling.confidence}% confidence
                    </span>
                  </div>
                  <Progress value={ruling.confidence} size="sm" color="brass" />
                </div>
              </section>
            )}

            {/* Case metadata */}
            {caseData && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={13} style={{ color: "rgba(241,232,210,0.4)" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(241,232,210,0.4)" }}>
                    Case
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>Status</span>
                    <Badge variant={mapStatusToVariant(caseData.status)} size="sm">
                      {caseData.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>Category</span>
                    <span className="text-xs" style={{ color: "#F1E8D2" }}>{caseData.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>Framework</span>
                    <span className="text-xs truncate max-w-[100px]" style={{ color: "#F1E8D2" }}>{caseData.frameworkId}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Parties */}
            {caseData && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Users size={13} style={{ color: "rgba(241,232,210,0.4)" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(241,232,210,0.4)" }}>
                    Parties
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>Claimant</span>
                    <span className="text-xs font-mono" style={{ color: "#6B8FB3" }}>
                      {truncateAddress(caseData.claimant)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>Respondent</span>
                    <span className="text-xs font-mono" style={{ color: "#A94343" }}>
                      {truncateAddress(caseData.respondent)}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Quick actions */}
            {onQuickAction && (
              <section className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(241,232,210,0.4)" }}>
                  Quick Actions
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => onQuickAction("request-ruling")}
                >
                  Request Ruling
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onQuickAction("add-evidence")}
                >
                  Add Evidence
                </Button>
              </section>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
