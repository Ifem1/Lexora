"use client";

import { useState, useEffect, useRef } from "react";
import { useContract } from "@/hooks/useContract";
import { motion } from "framer-motion";
import { StatSkeleton } from "@/components/ui/Skeleton";
import type { ProtocolStats } from "@/hooks/useContract";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/client";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started || value === 0) { setDisplay(value); return; }
    setStarted(true);
    const duration = 1000;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [value, started]);

  return <span>{display}</span>;
}

function StatCard({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, borderColor: "rgba(198,156,93,0.25)", boxShadow: "0 8px 24px rgba(198,156,93,0.06)" }}
      style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", transition: "border-color 0.3s, box-shadow 0.3s" }}
    >
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", color: "#C69C5D", lineHeight: 1 }}>
        <AnimatedNumber value={value} />
      </div>
    </motion.div>
  );
}

export default function AuditPage() {
  const { getProtocolStats } = useContract();
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [caseIdLookup, setCaseIdLookup] = useState("");

  useEffect(() => {
    setStatsLoading(true);
    getProtocolStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}
    >
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Transparency Log
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
          Protocol statistics and direct case lookup from the GenLayer contract.
        </p>
      </motion.div>

      {/* Protocol Stats */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>PROTOCOL STATISTICS</div>
        {statsLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {[0, 1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
          </div>
        ) : stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            <StatCard label="TOTAL CASES" value={stats.totalCases} delay={0.15} />
            <StatCard label="ACTIVE CASES" value={stats.activeCase} delay={0.2} />
            <StatCard label="RULINGS ISSUED" value={stats.rulingsIssued} delay={0.25} />
            <StatCard label="APPEALS FILED" value={stats.appealsFiled} delay={0.3} />
            <StatCard label="SETTLED" value={stats.settledCases} delay={0.35} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", color: "rgba(241,232,210,0.4)", fontSize: "0.875rem" }}
          >
            Could not load stats from contract. The RPC endpoint may be unavailable.
          </motion.div>
        )}
      </motion.div>

      {/* Case Lookup */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>CASE LOOKUP</div>
        <motion.div
          whileHover={{ borderColor: "rgba(198,156,93,0.2)" }}
          style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", transition: "border-color 0.3s" }}
        >
          <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginBottom: "1rem", lineHeight: 1.6 }}>
            Enter a case ID to look up its details directly on the GenLayer contract.
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="text"
              value={caseIdLookup}
              onChange={e => setCaseIdLookup(e.target.value)}
              placeholder="Enter case ID..."
              style={{ flex: 1, background: "#0B0D10", border: "1px solid rgba(241,232,210,0.15)", color: "#F1E8D2", padding: "0.625rem 0.875rem", borderRadius: "2px", fontSize: "0.875rem", fontFamily: "var(--font-ibm-plex-mono), monospace" }}
            />
            <motion.a
              whileHover={{ scale: 1.03, boxShadow: "0 0 16px rgba(198,156,93,0.3)" }}
              whileTap={{ scale: 0.97 }}
              href={caseIdLookup ? `/app/cases/${caseIdLookup}` : "#"}
              style={{
                background: caseIdLookup ? "#C69C5D" : "rgba(198,156,93,0.3)",
                color: "#0B0D10",
                padding: "0.625rem 1.5rem",
                borderRadius: "2px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                pointerEvents: caseIdLookup ? "auto" : "none",
              }}
            >
              View Case
            </motion.a>
          </div>
        </motion.div>
      </motion.div>

      {/* Contract Info */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>CONTRACT DETAILS</div>
        <motion.div
          whileHover={{ borderColor: "rgba(198,156,93,0.2)" }}
          style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "border-color 0.3s" }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.35)", marginBottom: "0.25rem" }}>CONTRACT ADDRESS</div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.875rem", color: "#C69C5D" }}>
              {CONTRACT_ADDRESS}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.35)", marginBottom: "0.25rem" }}>NETWORK</div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.875rem", color: "rgba(241,232,210,0.6)" }}>
              GenLayer Studio (studionet) · Chain ID 61999
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.35)", marginBottom: "0.25rem" }}>RPC ENDPOINT</div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.875rem", color: "rgba(241,232,210,0.6)" }}>
              {process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api"}
            </div>
          </div>
          <div style={{ paddingTop: "0.75rem", borderTop: "1px solid rgba(241,232,210,0.06)", fontSize: "0.8rem", color: "rgba(241,232,210,0.4)", lineHeight: 1.6 }}>
            Individual audit events are indexed by internal event IDs on the contract. Per-case event history is accessible via each case&apos;s room page. On-chain data is immutable once finalized by GenLayer validators.
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
