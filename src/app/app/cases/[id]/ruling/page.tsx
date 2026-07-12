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
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};

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
        <Skeleton width="200px" height="0.7rem" />
        <div style={{ marginTop: "1.5rem" }}>
          <Skeleton width="300px" height="1.5rem" />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <Skeleton width="250px" height="0.875rem" />
        </div>
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <Skeleton width="100%" height="180px" borderRadius="4px" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Skeleton width="100%" height="150px" borderRadius="4px" />
            <Skeleton width="100%" height="150px" borderRadius="4px" />
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem" }}>Case not found</div>
          <Link href="/app/cases" style={{ color: "#C69C5D", textDecoration: "none", fontSize: "0.875rem" }}>← Back to Cases</Link>
        </div>
      </motion.div>
    );
  }

  if (!ruling) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
          <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
          {" → "}
          <Link href={`/app/cases/${caseId}`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>{caseId}</Link>
          {" → "}
          <span style={{ color: "#C69C5D" }}>RULING</span>
        </div>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)" }}>
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</motion.div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem", color: "#F1E8D2" }}>No ruling yet</div>
          <div style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {caseData.status === "UNDER_REVIEW"
              ? "Validators are processing the ruling. This may take a few minutes."
              : "A ruling has not been requested yet for this case."}
          </div>
          <Link href={`/app/cases/${caseId}`} style={{ color: "#C69C5D", textDecoration: "none", fontSize: "0.875rem" }}>← Back to Case Room</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}
    >
      {/* Breadcrumb */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
        <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
        {" → "}
        <Link href={`/app/cases/${caseId}`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>{caseId}</Link>
        {" → "}
        <span style={{ color: "#C69C5D" }}>RULING</span>
      </motion.div>

      {/* Tx Error */}
      {txError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(125,31,42,0.12)", border: "1px solid rgba(125,31,42,0.4)", borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#A94343", fontSize: "0.875rem" }}>
          {txError}
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <RulingOutcomePanel ruling={ruling} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <RemedyPanel remedy={ruling.remedy} />
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>REASONING SUMMARY</div>
            <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.75)", lineHeight: 1.8 }}>{ruling.reasoningSummary}</div>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <RuleApplicationTable rules={ruling.ruleApplication} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <EvidenceMappingPanel evidenceMap={ruling.evidenceMap} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <ProceduralWarnings warnings={ruling.proceduralWarnings} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <AppealActions
            onAccept={handleAccept}
            onAppeal={handleAppeal}
            deadlineAt={(ruling.createdAt + 86400 * 14) * 1000}
          />
        </motion.div>

        {txPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "1rem", color: "#C69C5D", fontSize: "0.875rem" }}>
            Processing transaction...
          </motion.div>
        )}

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}
          style={{ background: "rgba(125,31,42,0.08)", border: "1px solid rgba(125,31,42,0.25)", borderRadius: "4px", padding: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.7rem", color: "#7D1F2A", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>RULING DISCLAIMER</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.45)", lineHeight: 1.8 }}>{RULING_DISCLAIMER}</div>
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(125,31,42,0.1)", borderRadius: "2px", fontSize: "0.8rem", color: "rgba(241,232,210,0.45)", lineHeight: 1.7 }}>
            <strong style={{ color: "rgba(241,232,210,0.6)" }}>Safety Boundary:</strong> {ruling.safetyBoundary}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
