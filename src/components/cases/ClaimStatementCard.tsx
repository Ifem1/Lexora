"use client";

import React from "react";
import { FileText, Copy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";

interface ClaimStatementCardProps {
  statement: string;
  hash: string;
  submittedAt: number;
  submittedBy: string;
  className?: string;
}

function truncateHash(hash: string) {
  return hash.length > 20 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClaimStatementCard({
  statement,
  hash,
  submittedAt,
  submittedBy,
  className,
}: ClaimStatementCardProps) {
  const [copied, setCopied] = React.useState(false);

  const copyHash = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg p-5 flex flex-col gap-4", className)}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(107,143,179,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(107,143,179,0.12)" }}
          >
            <FileText size={14} style={{ color: "#6B8FB3" }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#F1E8D2", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Claimant Statement
            </p>
            <p className="text-xs" style={{ color: "rgba(241,232,210,0.4)" }}>
              {formatDate(submittedAt)}
            </p>
          </div>
        </div>
        <Badge variant="active" size="sm">Submitted</Badge>
      </div>

      {/* Statement body */}
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

      {/* Hash verification */}
      <div
        className="flex items-center justify-between rounded px-3 py-2"
        style={{
          backgroundColor: "rgba(107,143,179,0.06)",
          border: "1px solid rgba(107,143,179,0.15)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 size={12} style={{ color: "#648F70" }} />
          <span
            className="text-xs font-mono truncate"
            style={{ color: "rgba(241,232,210,0.45)", fontFamily: "IBM Plex Mono, monospace" }}
          >
            {truncateHash(hash)}
          </span>
        </div>
        <button
          onClick={copyHash}
          className="ml-2 flex items-center gap-1 text-xs transition-opacity hover:opacity-70 shrink-0"
          style={{ color: copied ? "#648F70" : "rgba(241,232,210,0.4)" }}
        >
          {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </motion.div>
  );
}
