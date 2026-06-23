"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCase } from "@/hooks/useCase";
import { useContract } from "@/hooks/useContract";
import { waitForRuling as waitForTx } from "@/lib/genlayer/client";
import RulingOutcomePanel from "@/components/ruling/RulingOutcomePanel";
import RemedyPanel from "@/components/ruling/RemedyPanel";
import RuleApplicationTable from "@/components/ruling/RuleApplicationTable";
import EvidenceMappingPanel from "@/components/ruling/EvidenceMappingPanel";
import ProceduralWarnings from "@/components/ruling/ProceduralWarnings";
import AppealActions from "@/components/ruling/AppealActions";
import { RULING_DISCLAIMER } from "@/lib/arbitration/disclaimers";

export default function RulingPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;

  const { caseData, ruling, loading, refresh } = useCase(caseId);
  const { acceptRuling } = useContract();

  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  async function handleAccept() {
    if (!caseData || !ruling) return;
    setTxError(null);
    setTxPending(true);
    try {
      const txHash = await acceptRuling(caseData.caseId, ruling.rulingId);
      await waitForTx(txHash);
      await refresh();
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setTxPending(false);
    }
  }

  function handleAppeal() {
    router.push(`/app/cases/${caseId}/appeal`);
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)", fontSize: "0.875rem" }}>
          Loading ruling from contract...
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem" }}>Case not found</div>
          <Link href="/app/cases" style={{ color: "#C69C5D", textDecoration: "none", fontSize: "0.875rem" }}>← Back to Cases</Link>
        </div>
      </div>
    );
  }

  if (!ruling) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
          <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
          {" → "}
          <Link href={`/app/cases/${caseId}`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>{caseId}</Link>
          {" → "}
          <span style={{ color: "#C69C5D" }}>RULING</span>
        </div>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem", color: "#F1E8D2" }}>No ruling yet</div>
          <div style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {caseData.status === "UNDER_REVIEW"
              ? "Validators are processing the ruling. This may take a few minutes."
              : "A ruling has not been requested yet for this case."}
          </div>
          <Link href={`/app/cases/${caseId}`} style={{ color: "#C69C5D", textDecoration: "none", fontSize: "0.875rem" }}>← Back to Case Room</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
        <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
        {" → "}
        <Link href={`/app/cases/${caseId}`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>{caseId}</Link>
        {" → "}
        <span style={{ color: "#C69C5D" }}>RULING</span>
      </div>

      {/* Tx Error */}
      {txError && (
        <div style={{ background: "rgba(125,31,42,0.12)", border: "1px solid rgba(125,31,42,0.4)", borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#A94343", fontSize: "0.875rem" }}>
          {txError}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
            Arbitration Ruling
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
            {caseData.title}
          </p>
        </div>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", textAlign: "right" }}>
          <div>Ruling ID: <span style={{ color: "#C69C5D" }}>{ruling.rulingId}</span></div>
          <div>Issued: {new Date(ruling.createdAt * 1000).toLocaleDateString()}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <RulingOutcomePanel ruling={ruling} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <RemedyPanel remedy={ruling.remedy} />

          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>REASONING SUMMARY</div>
            <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.75)", lineHeight: 1.8 }}>{ruling.reasoningSummary}</div>
          </div>
        </div>

        <RuleApplicationTable rules={ruling.ruleApplication} />
        <EvidenceMappingPanel evidenceMap={ruling.evidenceMap} />
        <ProceduralWarnings warnings={ruling.proceduralWarnings} />

        <AppealActions
          onAccept={handleAccept}
          onAppeal={handleAppeal}
          deadlineAt={(ruling.createdAt + 86400 * 14) * 1000}
        />

        {txPending && (
          <div style={{ textAlign: "center", padding: "1rem", color: "#C69C5D", fontSize: "0.875rem" }}>
            Processing transaction...
          </div>
        )}

        <div style={{ background: "rgba(125,31,42,0.08)", border: "1px solid rgba(125,31,42,0.25)", borderRadius: "4px", padding: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", color: "#7D1F2A", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>RULING DISCLAIMER</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.45)", lineHeight: 1.8 }}>{RULING_DISCLAIMER}</div>
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(125,31,42,0.1)", borderRadius: "2px", fontSize: "0.8rem", color: "rgba(241,232,210,0.45)", lineHeight: 1.7 }}>
            <strong style={{ color: "rgba(241,232,210,0.6)" }}>Safety Boundary:</strong> {ruling.safetyBoundary}
          </div>
        </div>
      </div>
    </div>
  );
}
