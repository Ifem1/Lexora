"use client";

import React, { useState } from "react";
import { Hash, Copy, CheckCircle2, Link2, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EvidenceManifest } from "@/lib/genlayer/types";

interface EvidenceHashPanelProps {
  manifest: EvidenceManifest;
  anchorTxHash?: string;
  anchored?: boolean;
  className?: string;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(241,232,210,0.4)" }}>
        {label}
      </span>
      <div
        className="flex items-center justify-between gap-2 rounded px-3 py-2"
        style={{ backgroundColor: "rgba(241,232,210,0.04)", border: "1px solid rgba(241,232,210,0.1)" }}
      >
        <span
          className="text-xs font-mono truncate"
          style={{ color: "rgba(241,232,210,0.7)", fontFamily: "IBM Plex Mono, monospace" }}
        >
          {value}
        </span>
        <button onClick={copy} className="shrink-0 transition-opacity hover:opacity-70" style={{ color: copied ? "#648F70" : "rgba(241,232,210,0.35)" }}>
          {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function EvidenceHashPanel({
  manifest,
  anchorTxHash,
  anchored = false,
  className,
}: EvidenceHashPanelProps) {
  return (
    <div
      className={cn("rounded-lg p-4 flex flex-col gap-4", className)}
      style={{
        backgroundColor: "#171B20",
        border: "1px solid rgba(241,232,210,0.16)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash size={14} style={{ color: "#C69C5D" }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#C69C5D" }}
          >
            Evidence Hashes
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {anchored ? (
            <>
              <Shield size={11} style={{ color: "#648F70" }} />
              <span className="text-[10px] font-semibold" style={{ color: "#648F70" }}>
                Anchored
              </span>
            </>
          ) : (
            <span className="text-[10px]" style={{ color: "rgba(241,232,210,0.3)" }}>
              Not anchored
            </span>
          )}
        </div>
      </div>

      <CopyRow label="Manifest Hash" value={manifest.manifestHash} />

      {anchorTxHash && (
        <CopyRow label="Anchor Transaction" value={anchorTxHash} />
      )}

      <div className="flex items-center justify-between text-xs" style={{ color: "rgba(241,232,210,0.35)" }}>
        <span>{manifest.evidenceItems.length} evidence item(s)</span>
        <span>{new Date(manifest.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
