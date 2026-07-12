"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useCases } from "@/hooks/useCases";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "@/components/ui/Skeleton";

const STATUS_COLORS: Record<string, string> = {
  RULING_ISSUED: "#648F70",
  UNDER_REVIEW: "#C69C5D",
  SUBMISSIONS_OPEN: "#6B8FB3",
  AWAITING_RESPONDENT: "#C58B3B",
  APPEALED: "#A94343",
  SETTLED: "#648F70",
  DRAFT: "rgba(241,232,210,0.4)",
};

const FILTER_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Awaiting Response", value: "AWAITING_RESPONDENT" },
  { label: "Ruling Issued", value: "RULING_ISSUED" },
  { label: "Settled", value: "SETTLED" },
];

export default function CasesPage() {
  const [filter, setFilter] = useState("ALL");
  const { isConnected } = useAccount();
  const { cases, loading, refresh } = useCases();

  const filtered = cases.filter(c => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return !["SETTLED", "CANCELLED", "RULING_ISSUED"].includes(c.status);
    return c.status === filter;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
            All Cases
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
            {loading ? "Loading..." : `${cases.length} total case${cases.length !== 1 ? "s" : ""} on contract.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <motion.button
            whileHover={{ scale: 1.04, borderColor: "rgba(241,232,210,0.4)" }}
            whileTap={{ scale: 0.96 }}
            onClick={refresh}
            style={{ border: "1px solid rgba(241,232,210,0.2)", background: "transparent", color: "rgba(241,232,210,0.55)", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Refresh
          </motion.button>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/app/cases/new" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem", display: "inline-block" }}>
              + New Case
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: "rgba(14,76,79,0.1)", border: "1px solid rgba(14,76,79,0.3)", borderRadius: "4px", padding: "1.25rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(241,232,210,0.55)" }}
        >
          Connect your wallet to see your cases.
        </motion.div>
      )}

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}
      >
        {FILTER_OPTIONS.map(opt => (
          <motion.button
            key={opt.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(opt.value)}
            style={{ padding: "0.4rem 1rem", borderRadius: "2px", border: filter === opt.value ? "1px solid #C69C5D" : "1px solid rgba(241,232,210,0.15)", background: filter === opt.value ? "rgba(198,156,93,0.1)" : "transparent", color: filter === opt.value ? "#C69C5D" : "rgba(241,232,210,0.55)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "var(--font-space-grotesk), sans-serif", transition: "all 0.2s" }}
          >
            {opt.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {[0, 1, 2, 3, 4, 5].map(i => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Cases Grid */}
      {!loading && filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)" }}
        >
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚖️</motion.div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem" }}>No cases found</div>
          <div style={{ fontSize: "0.875rem" }}>
            {isConnected ? "No cases match the selected filter." : "Connect your wallet to see your cases."}
          </div>
        </motion.div>
      ) : !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <motion.div
                key={c.caseId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                whileHover={{ y: -4, borderColor: "rgba(198,156,93,0.25)", boxShadow: "0 8px 30px rgba(198,156,93,0.06)" }}
                style={{ transition: "border-color 0.3s, box-shadow 0.3s" }}
              >
                <Link href={`/app/cases/${c.caseId}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.6rem", background: `${STATUS_COLORS[c.status] || "#C69C5D"}22`, color: STATUS_COLORS[c.status] || "#C69C5D", border: `1px solid ${STATUS_COLORS[c.status] || "#C69C5D"}44`, borderRadius: "2px", fontFamily: "var(--font-ibm-plex-mono), monospace", letterSpacing: "0.05em" }}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "rgba(241,232,210,0.3)", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                        {c.createdAt ? new Date(c.createdAt * 1000).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#F1E8D2", lineHeight: 1.4 }}>{c.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                      {c.frameworkId}
                    </div>
                    <div style={{ fontSize: "0.7rem", background: "rgba(14,76,79,0.2)", color: "#6B8FB3", border: "1px solid rgba(14,76,79,0.3)", padding: "0.15rem 0.5rem", borderRadius: "2px", display: "inline-block", width: "fit-content" }}>
                      {c.category}
                    </div>
                    <div style={{ borderTop: "1px solid rgba(241,232,210,0.06)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(241,232,210,0.3)" }}>
                        <span style={{ color: "rgba(241,232,210,0.5)" }}>Claimant:</span> {c.claimant ? `${c.claimant.slice(0, 22)}...` : "—"}
                      </div>
                      {c.respondent && (
                        <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-ibm-plex-mono), monospace", color: "rgba(241,232,210,0.3)" }}>
                          <span style={{ color: "rgba(241,232,210,0.5)" }}>Respondent:</span> {c.respondent.slice(0, 22)}...
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
