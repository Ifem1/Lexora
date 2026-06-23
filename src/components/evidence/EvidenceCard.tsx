"use client";

import React from "react";
import {
  FileText,
  MessageSquare,
  Image,
  Receipt,
  Package,
  CreditCard,
  Clock,
  Users,
  FileQuestion,
  Copy,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import type { EvidencePacket, EvidenceType } from "@/lib/genlayer/types";
import Badge from "@/components/ui/Badge";

const EVIDENCE_ICONS: Record<EvidenceType, React.ElementType> = {
  CONTRACT: FileText,
  MESSAGE: MessageSquare,
  SCREENSHOT: Image,
  INVOICE: Receipt,
  DELIVERY_FILE: Package,
  PAYMENT_PROOF: CreditCard,
  TIMELINE: Clock,
  WITNESS_STATEMENT: Users,
  OTHER: FileQuestion,
};

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  CONTRACT: "Contract",
  MESSAGE: "Message",
  SCREENSHOT: "Screenshot",
  INVOICE: "Invoice",
  DELIVERY_FILE: "Delivery",
  PAYMENT_PROOF: "Payment",
  TIMELINE: "Timeline",
  WITNESS_STATEMENT: "Witness",
  OTHER: "Other",
};

interface EvidenceCardProps {
  evidence: EvidencePacket;
  className?: string;
  onClick?: () => void;
}

function truncate(addr: string, len = 8) {
  return addr.length > len * 2 + 2 ? `${addr.slice(0, len)}…${addr.slice(-4)}` : addr;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EvidenceCard({ evidence, className, onClick }: EvidenceCardProps) {
  const [copied, setCopied] = React.useState(false);
  const Icon = EVIDENCE_ICONS[evidence.evidenceType];

  const copyHash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (evidence.fileHash) {
      await navigator.clipboard.writeText(evidence.fileHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      whileHover={{ translateY: -1 }}
      onClick={onClick}
      className={cn(
        "rounded-lg p-4 flex flex-col gap-3 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(241,232,210,0.16)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(107,143,179,0.15)" }}
          >
            <Icon size={13} style={{ color: "#6B8FB3" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6B8FB3" }}
          >
            {EVIDENCE_LABELS[evidence.evidenceType]}
          </span>
        </div>
        {evidence.relevanceTag && (
          <div className="flex items-center gap-1 shrink-0">
            <Tag size={10} style={{ color: "rgba(241,232,210,0.3)" }} />
            <span className="text-[10px]" style={{ color: "rgba(241,232,210,0.4)" }}>
              {evidence.relevanceTag}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <p
        className="text-sm font-semibold line-clamp-2"
        style={{ color: "#F1E8D2", fontFamily: "Space Grotesk, sans-serif" }}
      >
        {evidence.title}
      </p>

      {/* Summary */}
      <p
        className="text-xs line-clamp-3"
        style={{ color: "rgba(241,232,210,0.5)", fontFamily: "IBM Plex Sans, sans-serif" }}
      >
        {evidence.summary}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid rgba(241,232,210,0.08)" }}
      >
        <div>
          <p className="text-[10px]" style={{ color: "rgba(241,232,210,0.3)" }}>
            By {truncate(evidence.submittedBy, 6)}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(241,232,210,0.25)" }}>
            {formatDate(evidence.createdAt)}
          </p>
        </div>
        {evidence.fileHash && (
          <button
            onClick={copyHash}
            className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-70"
            style={{ color: copied ? "#648F70" : "rgba(241,232,210,0.3)", fontFamily: "IBM Plex Mono, monospace" }}
          >
            {copied ? <CheckCircle2 size={10} /> : <Copy size={10} />}
            {truncate(evidence.fileHash, 5)}
          </button>
        )}
      </div>
    </motion.div>
  );
}
