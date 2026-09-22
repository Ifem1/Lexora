"use client";

import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useCases } from "@/hooks/useCases";
import { useContract } from "@/hooks/useContract";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CardSkeleton, StatSkeleton } from "@/components/ui/Skeleton";
import type { ProtocolStats } from "@/hooks/useContract";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const STATUS_COLORS: Record<string, string> = {
  RULING_ISSUED: "#648F70",
  UNDER_REVIEW: "#C69C5D",
  SUBMISSIONS_OPEN: "#6B8FB3",
  AWAITING_RESPONDENT: "#C58B3B",
  RESPONSE_WINDOW: "#6BBFC3",
  APPEALED: "#A94343",
  SETTLED: "#648F70",
  DRAFT: "rgba(241,232,210,0.4)",
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

function StatCard({ label, value, sub, delay = 0 }: { label: string; value: string | number; sub?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, borderColor: "rgba(198,156,93,0.25)", boxShadow: "0 8px 24px rgba(198,156,93,0.06)" }}
      style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", transition: "border-color 0.3s, box-shadow 0.3s" }}
    >
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", color: "#C69C5D", lineHeight: 1 }}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
      {sub && <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", marginTop: "0.5rem" }}>{sub}</div>}
    </motion.div>
  );
}

export default function AppPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { cases, loading: casesLoading } = useCases();
  const { getProtocolStats } = useContract();

  const [stats, setStats] = useState<ProtocolStats | null>(null);

  useEffect(() => {
    void Promise.resolve().then(getProtocolStats).then(setStats).catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCases = cases.filter(c => !["SETTLED", "CANCELLED"].includes(c.status)).length;
  const rulings = cases.filter(c => c.status === "RULING_ISSUED").length;
  const appeals = cases.filter(c => c.status === "APPEALED").length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Arbitration Console
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
          Overview of your active cases, rulings, and audit trail.
        </p>
      </motion.div>

      {/* Connect Wallet */}
      {!isConnected && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "rgba(14,76,79,0.15)", border: "1px solid rgba(14,76,79,0.4)", borderRadius: "4px", padding: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, marginBottom: "0.25rem" }}>Connect your wallet to manage cases</div>
            <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)" }}>Connect to interact with GenLayer arbitration contract.</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(198,156,93,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => connect({ connector: injected() })}
            style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          >
            Connect Wallet
          </motion.button>
        </motion.div>
      )}

      {isConnected && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ background: "rgba(100,143,112,0.1)", border: "1px solid rgba(100,143,112,0.3)", borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.5)", marginBottom: "0.25rem", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>CONNECTED WALLET</div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.875rem", color: "#648F70" }}>{address}</div>
        </motion.div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        {stats === null ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard label="ACTIVE CASES" value={stats.activeCase || activeCases} sub="in progress" delay={0.15} />
            <StatCard label="RULINGS ISSUED" value={stats.rulingsIssued || rulings} sub="awaiting acceptance" delay={0.2} />
            <StatCard label="TOTAL CASES" value={stats.totalCases || cases.length} sub="on contract" delay={0.25} />
            <StatCard label="APPEALS PENDING" value={stats.appealsFiled || appeals} sub="filed" delay={0.3} />
          </>
        )}
      </div>

      {/* Cases */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#F1E8D2", letterSpacing: "0.06em" }}>Your Cases</h2>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/app/cases/new" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.5rem 1.25rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700, display: "inline-block" }}>
              + New Case
            </Link>
          </motion.div>
        </div>

        {casesLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {!casesLoading && cases.length === 0 && isConnected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "3rem", textAlign: "center", color: "rgba(241,232,210,0.4)" }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚖️</motion.div>
            <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem", color: "#F1E8D2" }}>No cases yet</div>
            <div style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>You have no arbitration cases on this contract.</div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
              <Link href="/app/cases/new" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
                Open First Case
              </Link>
            </motion.div>
          </motion.div>
        )}

        {!casesLoading && cases.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {cases.map((c, i) => (
              <motion.div
                key={c.caseId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ x: 4, borderColor: "rgba(198,156,93,0.25)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
              >
                <Link href={`/app/cases/${c.caseId}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#F1E8D2", marginBottom: "0.25rem" }}>{c.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                        {c.caseId} · {c.frameworkId} · {c.category}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.75rem", borderRadius: "2px", background: `${STATUS_COLORS[c.status] ?? "#C69C5D"}22`, color: STATUS_COLORS[c.status] || "#C69C5D", border: `1px solid ${STATUS_COLORS[c.status] ?? "#C69C5D"}44`, fontFamily: "var(--font-ibm-plex-mono), monospace", letterSpacing: "0.05em" }}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                      <span style={{ color: "rgba(241,232,210,0.3)", fontSize: "0.8rem" }}>→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Contract Info */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#F1E8D2", letterSpacing: "0.06em", marginBottom: "1.25rem" }}>Contract</h2>
        <motion.div
          whileHover={{ borderColor: "rgba(198,156,93,0.2)" }}
          style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.25rem 1.5rem", transition: "border-color 0.3s" }}
        >
          <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace", marginBottom: "0.25rem" }}>CONTRACT ADDRESS</div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "#C69C5D" }}>
            {CONTRACT_ADDRESS}
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace", marginTop: "0.75rem", marginBottom: "0.25rem" }}>NETWORK</div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "rgba(241,232,210,0.6)" }}>
            GenLayer Studio · Chain ID 61999
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
