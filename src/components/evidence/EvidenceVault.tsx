"use client";

import React, { useState } from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EvidencePacket, EvidenceType } from "@/lib/genlayer/types";
import EvidenceCard from "./EvidenceCard";
import EmptyState from "@/components/ui/EmptyState";
import { Package } from "lucide-react";

const FILTER_OPTIONS: { label: string; value: EvidenceType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Agreements", value: "CONTRACT" },
  { label: "Communications", value: "MESSAGE" },
  { label: "Performance", value: "DELIVERY_FILE" },
  { label: "Payment", value: "PAYMENT_PROOF" },
  { label: "Screenshots", value: "SCREENSHOT" },
  { label: "Invoices", value: "INVOICE" },
  { label: "Timeline", value: "TIMELINE" },
  { label: "Witness", value: "WITNESS_STATEMENT" },
  { label: "Other", value: "OTHER" },
];

interface EvidenceVaultProps {
  evidence: EvidencePacket[];
  onEvidenceClick?: (ev: EvidencePacket) => void;
  className?: string;
}

export default function EvidenceVault({ evidence, onEvidenceClick, className }: EvidenceVaultProps) {
  const [filter, setFilter] = useState<EvidenceType | "ALL">("ALL");

  const filtered = filter === "ALL" ? evidence : evidence.filter((e) => e.evidenceType === filter);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} style={{ color: "rgba(241,232,210,0.3)" }} />
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? "rgba(198,156,93,0.15)" : "rgba(241,232,210,0.05)",
                color: isActive ? "#C69C5D" : "rgba(241,232,210,0.4)",
                border: isActive ? "1px solid rgba(198,156,93,0.3)" : "1px solid transparent",
              }}
            >
              {opt.label}
              {opt.value !== "ALL" && (
                <span className="ml-1 opacity-60">
                  ({evidence.filter((e) => e.evidenceType === opt.value).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={22} />}
          title="No Evidence"
          description={
            filter === "ALL"
              ? "No evidence has been submitted for this case."
              : `No ${filter.toLowerCase()} evidence found.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((ev) => (
            <EvidenceCard
              key={ev.evidenceId}
              evidence={ev}
              onClick={() => onEvidenceClick?.(ev)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
