"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import type { AuditEvent } from "@/lib/genlayer/types";

interface ArbitrationConsoleProps {
  events?: AuditEvent[];
  className?: string;
  defaultOpen?: boolean;
}

const EVENT_COLORS: Record<string, string> = {
  CASE_CREATED: "#C69C5D",
  CLAIM_SUBMITTED: "#6B8FB3",
  RESPONSE_SUBMITTED: "#6B8FB3",
  EVIDENCE_ADDED: "#648F70",
  RULING_REQUESTED: "#C58B3B",
  RULING_ISSUED: "#C69C5D",
  APPEAL_FILED: "#A94343",
  CASE_SETTLED: "#648F70",
  CASE_CANCELLED: "#A94343",
  PROCEDURAL_WARNING: "#C58B3B",
};

function formatTimestamp(ts: number) {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 19);
}

export default function ArbitrationConsole({
  events = [],
  className,
  defaultOpen = false,
}: ArbitrationConsoleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, open]);

  return (
    <div
      className={cn("shrink-0 flex flex-col", className)}
      style={{
        borderTop: "1px solid rgba(241,232,210,0.10)",
        backgroundColor: "#0B0D10",
      }}
    >
      {/* Toggle bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 h-9 w-full hover:opacity-80 transition-opacity"
        style={{ borderBottom: open ? "1px solid rgba(241,232,210,0.10)" : "none" }}
      >
        <Terminal size={12} style={{ color: "#C69C5D" }} />
        <span
          className="text-[11px] font-semibold uppercase tracking-widest flex-1 text-left"
          style={{ color: "#C69C5D", fontFamily: "IBM Plex Mono, monospace" }}
        >
          Arbitration Console
        </span>
        <span
          className="text-[10px] rounded px-1.5 py-0.5"
          style={{
            backgroundColor: "rgba(198,156,93,0.12)",
            color: "rgba(198,156,93,0.7)",
          }}
        >
          {events.length} events
        </span>
        {open ? (
          <ChevronDown size={12} style={{ color: "rgba(241,232,210,0.4)" }} />
        ) : (
          <ChevronUp size={12} style={{ color: "rgba(241,232,210,0.4)" }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 180, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto px-4 py-3 flex flex-col gap-1.5"
            >
              {events.length === 0 ? (
                <p
                  className="text-xs opacity-40"
                  style={{ fontFamily: "IBM Plex Mono, monospace", color: "#F1E8D2" }}
                >
                  {"> "}No events recorded.
                </p>
              ) : (
                events.map((ev) => {
                  const color = EVENT_COLORS[ev.eventType] ?? "rgba(241,232,210,0.5)";
                  return (
                    <div
                      key={ev.eventId}
                      className="flex items-start gap-3 text-xs"
                      style={{ fontFamily: "IBM Plex Mono, monospace" }}
                    >
                      <span style={{ color: "rgba(241,232,210,0.25)", flexShrink: 0 }}>
                        {formatTimestamp(ev.timestamp)}
                      </span>
                      <span
                        className="font-semibold shrink-0"
                        style={{ color }}
                      >
                        [{ev.eventType}]
                      </span>
                      <span style={{ color: "rgba(241,232,210,0.6)" }}>
                        {ev.actor}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
