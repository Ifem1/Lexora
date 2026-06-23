"use client";

import React from "react";
import {
  DollarSign,
  RotateCcw,
  Unlock,
  Wrench,
  XCircle,
  MinusCircle,
  MessageCircle,
  Clock,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ArbitrationRuling, RemedyAction } from "@/lib/genlayer/types";

interface RemedyPanelProps {
  remedy: ArbitrationRuling["remedy"];
  className?: string;
}

const ACTION_CONFIG: Record<
  RemedyAction,
  { label: string; icon: React.ElementType; color: string }
> = {
  PAY: { label: "Pay", icon: DollarSign, color: "#648F70" },
  REFUND: { label: "Refund", icon: RotateCcw, color: "#6B8FB3" },
  RELEASE_ESCROW: { label: "Release Escrow", icon: Unlock, color: "#C69C5D" },
  REWORK: { label: "Rework Required", icon: Wrench, color: "#C58B3B" },
  CANCEL: { label: "Cancel", icon: XCircle, color: "#A94343" },
  NO_ACTION: { label: "No Action", icon: MinusCircle, color: "rgba(241,232,210,0.4)" },
  NEGOTIATE: { label: "Negotiate", icon: MessageCircle, color: "#C58B3B" },
};

export default function RemedyPanel({ remedy, className }: RemedyPanelProps) {
  const cfg = ACTION_CONFIG[remedy.action];
  const Icon = cfg.icon;

  return (
    <div
      className={cn("rounded-lg p-5 flex flex-col gap-4", className)}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(241,232,210,0.16)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(241,232,210,0.5)", fontFamily: "Space Grotesk, sans-serif" }}
      >
        Remedy
      </p>

      {/* Action */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cfg.color}15`, border: `1.5px solid ${cfg.color}30` }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>
        <p
          className="text-lg font-bold"
          style={{ color: cfg.color, fontFamily: "Cinzel, serif" }}
        >
          {cfg.label}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {remedy.amountBasis && (
          <div className="flex items-start gap-2">
            <DollarSign size={13} className="shrink-0 mt-0.5" style={{ color: "rgba(241,232,210,0.3)" }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(241,232,210,0.35)" }}>
                Amount Basis
              </p>
              <p className="text-sm" style={{ color: "#F1E8D2" }}>
                {remedy.amountBasis}
              </p>
            </div>
          </div>
        )}

        {remedy.deadlineDays !== undefined && (
          <div className="flex items-start gap-2">
            <Clock size={13} className="shrink-0 mt-0.5" style={{ color: "rgba(241,232,210,0.3)" }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(241,232,210,0.35)" }}>
                Deadline
              </p>
              <p className="text-sm" style={{ color: "#F1E8D2" }}>
                {remedy.deadlineDays} day{remedy.deadlineDays !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {remedy.notes && (
          <div className="flex items-start gap-2">
            <StickyNote size={13} className="shrink-0 mt-0.5" style={{ color: "rgba(241,232,210,0.3)" }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(241,232,210,0.35)" }}>
                Notes
              </p>
              <p className="text-sm" style={{ color: "rgba(241,232,210,0.7)" }}>
                {remedy.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
