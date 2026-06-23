"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, CheckCircle2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import type { ReviewPacket } from "@/lib/genlayer/types";

interface ArbitrationPacketPanelProps {
  packet: ReviewPacket;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  data: unknown;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, data, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const json = JSON.stringify(data, null, 2);

  return (
    <div style={{ borderBottom: "1px solid rgba(198,156,93,0.12)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:opacity-80 transition-opacity"
      >
        {open ? (
          <ChevronDown size={12} style={{ color: "#C69C5D" }} />
        ) : (
          <ChevronRight size={12} style={{ color: "#C69C5D" }} />
        )}
        <span
          className="text-xs font-semibold"
          style={{ color: "#C69C5D", fontFamily: "IBM Plex Mono, monospace" }}
        >
          {title}
        </span>
        {!open && (
          <span
            className="text-[10px] ml-2 truncate max-w-[200px]"
            style={{ color: "rgba(241,232,210,0.25)", fontFamily: "IBM Plex Mono, monospace" }}
          >
            {typeof data === "object" ? `{…}` : String(data).slice(0, 40)}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <pre
              className="px-6 pb-4 text-xs overflow-x-auto"
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                color: "rgba(241,232,210,0.7)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {json}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArbitrationPacketPanel({ packet, className }: ArbitrationPacketPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn("rounded-lg overflow-hidden flex flex-col", className)}
      style={{
        backgroundColor: "#0B0D10",
        border: "1px solid rgba(198,156,93,0.2)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(198,156,93,0.14)", backgroundColor: "#111418" }}
      >
        <Code2 size={14} style={{ color: "#C69C5D" }} />
        <span
          className="text-xs font-semibold flex-1"
          style={{ color: "#C69C5D", fontFamily: "IBM Plex Mono, monospace" }}
        >
          review_packet.json
        </span>
        <button
          onClick={copyAll}
          className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
          style={{ color: copied ? "#648F70" : "rgba(241,232,210,0.3)" }}
        >
          {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy All"}
        </button>
      </div>

      {/* Sections */}
      <CollapsibleSection title="caseId / category" data={{ caseId: packet.caseId, category: packet.category }} defaultOpen />
      <CollapsibleSection title="framework" data={packet.framework} />
      <CollapsibleSection title="claimantStatement" data={packet.claimantStatement} />
      <CollapsibleSection title="respondentStatement" data={packet.respondentStatement} />
      <CollapsibleSection title="evidence" data={packet.evidence} />
      <CollapsibleSection title="proceduralState" data={packet.proceduralState} />
    </div>
  );
}
