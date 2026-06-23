"use client";

import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useCases } from "@/hooks/useCases";
import { useContract } from "@/hooks/useContract";
import { useState, useEffect } from "react";
import type { ProtocolStats } from "@/hooks/useContract";

const STATUS_COLORS: Record<string, string> = {
  RULING_ISSUED: "#648F70",
  UNDER_REVIEW: "#C69C5D",
  SUBMISSIONS_OPEN: "#6B8FB3",
  AWAITING_RESPONDENT: "#C58B3B",
  APPEALED: "#A94343",
  SETTLED: "#648F70",
  DRAFT: "rgba(241,232,210,0.4)",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", color: "#C69C5D", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", marginTop: "0.5rem" }}>{sub}</div>}
    </div>
  );
}

export default function AppPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { cases, loading: casesLoading } = useCases();
  const { getProtocolStats } = useContract();

  const [stats, setStats] = useState<ProtocolStats | null>(null);

  useEffect(() => {
    getProtocolStats().then(setStats).catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCases = cases.filter(c => !["SETTLED", "CANCELLED"].includes(c.status)).length;
  const rulings = cases.filter(c => c.status === "RULING_ISSUED").length;
  const appeals = cases.filter(c => c.status === "APPEALED").length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Arbitration Console
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
          Overview of your active cases, rulings, and audit trail.
        </p>
      </div>

      {/* Connect Wallet Prompt */}
      {!isConnected && (
        <div style={{ background: "rgba(14,76,79,0.15)", border: "1px solid rgba(14,76,79,0.4)", borderRadius: "4px", padding: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, marginBottom: "0.25rem" }}>Connect your wallet to manage cases</div>
            <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)" }}>Connect to interact with GenLayer arbitration contract.</div>
          </div>
          <button
            onClick={() => connect({ connector: injected() })}
            style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {isConnected && (
        <div style={{ background: "rgba(100,143,112,0.1)", border: "1px solid rgba(100,143,112,0.3)", borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.5)", marginBottom: "0.25rem", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>CONNECTED WALLET</div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.875rem", color: "#648F70" }}>{address}</div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        <StatCard label="ACTIVE CASES" value={stats ? stats.activeCase : activeCases} sub="in progress" />
        <StatCard label="RULINGS ISSUED" value={stats ? stats.rulingsIssued : rulings} sub="awaiting acceptance" />
        <StatCard label="TOTAL CASES" value={stats ? stats.totalCases : cases.length} sub="on contract" />
        <StatCard label="APPEALS PENDING" value={stats ? stats.appealsFiled : appeals} sub="filed" />
      </div>

      {/* Your Cases */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#F1E8D2", letterSpacing: "0.06em" }}>Your Cases</h2>
          <Link href="/app/cases/new" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.5rem 1.25rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700 }}>
            + New Case
          </Link>
        </div>

        {casesLoading && (
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "2rem", textAlign: "center", color: "rgba(241,232,210,0.4)", fontSize: "0.875rem" }}>
            Loading cases from contract...
          </div>
        )}

        {!casesLoading && cases.length === 0 && isConnected && (
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "3rem", textAlign: "center", color: "rgba(241,232,210,0.4)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚖️</div>
            <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem", color: "#F1E8D2" }}>No cases yet</div>
            <div style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>You have no arbitration cases on this contract.</div>
            <Link href="/app/cases/new" style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
              Open First Case
            </Link>
          </div>
        )}

        {!casesLoading && cases.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {cases.map(c => (
              <Link key={c.caseId} href={`/app/cases/${c.caseId}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#F1E8D2", marginBottom: "0.25rem" }}>{c.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                      {c.caseId} · {c.frameworkId} · {c.category}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.75rem", borderRadius: "2px", background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status] || "#C69C5D", border: `1px solid ${STATUS_COLORS[c.status]}44`, fontFamily: "var(--font-ibm-plex-mono), monospace", letterSpacing: "0.05em" }}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                    <span style={{ color: "rgba(241,232,210,0.3)", fontSize: "0.8rem" }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Contract Info */}
      <div>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#F1E8D2", letterSpacing: "0.06em", marginBottom: "1.25rem" }}>Contract</h2>
        <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace", marginBottom: "0.25rem" }}>CONTRACT ADDRESS</div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "#C69C5D" }}>
            {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x607476f5AFB55140D5C92AbF906A05eA1003E208"}
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-mono), monospace", marginTop: "0.75rem", marginBottom: "0.25rem" }}>NETWORK</div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.8rem", color: "rgba(241,232,210,0.6)" }}>
            GenLayer Studio · Chain ID 61999
          </div>
        </div>
      </div>
    </div>
  );
}
