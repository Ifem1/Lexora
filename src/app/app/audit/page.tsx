"use client";

import { useState, useEffect } from "react";
import { useContract } from "@/hooks/useContract";
import type { ProtocolStats } from "@/hooks/useContract";

const EVENT_TYPE_COLORS: Record<string, string> = {
  CASE_CREATED: "#6B8FB3",
  RESPONDENT_ACCEPTED: "#648F70",
  CLAIM_SUBMITTED: "#C69C5D",
  RESPONSE_SUBMITTED: "#C69C5D",
  EVIDENCE_ADDED: "#6B8FB3",
  RULING_REQUESTED: "#C58B3B",
  RULING_ISSUED: "#648F70",
  APPEAL_FILED: "#A94343",
  RULING_ACCEPTED: "#648F70",
  CASE_SETTLED: "#648F70",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", color: "#C69C5D", lineHeight: 1 }}>{value}</div>
    </div>
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
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Transparency Log
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
          Protocol statistics and direct case lookup from the GenLayer contract.
        </p>
      </div>

      {/* Protocol Stats */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>PROTOCOL STATISTICS</div>
        {statsLoading ? (
          <div style={{ color: "rgba(241,232,210,0.4)", fontSize: "0.875rem", padding: "1rem" }}>Loading stats from contract...</div>
        ) : stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            <StatCard label="TOTAL CASES" value={stats.totalCases} />
            <StatCard label="ACTIVE CASES" value={stats.activeCase} />
            <StatCard label="RULINGS ISSUED" value={stats.rulingsIssued} />
            <StatCard label="APPEALS FILED" value={stats.appealsFiled} />
            <StatCard label="SETTLED" value={stats.settledCases} />
          </div>
        ) : (
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", color: "rgba(241,232,210,0.4)", fontSize: "0.875rem" }}>
            Could not load stats from contract. The RPC endpoint may be unavailable.
          </div>
        )}
      </div>

      {/* Case Lookup */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>CASE LOOKUP</div>
        <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
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
            <a
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
            </a>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>CONTRACT DETAILS</div>
        <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.35)", marginBottom: "0.25rem" }}>CONTRACT ADDRESS</div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.875rem", color: "#C69C5D" }}>
              {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x607476f5AFB55140D5C92AbF906A05eA1003E208"}
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
        </div>
      </div>
    </div>
  );
}
