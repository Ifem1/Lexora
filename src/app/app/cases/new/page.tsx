"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CaseCreateForm from "@/components/cases/CaseCreateForm";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";
import { useContract } from "@/hooks/useContract";
import { waitForRuling } from "@/lib/genlayer/client";
import { motion } from "framer-motion";

export default function NewCasePage() {
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [newCaseId, setNewCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createCase } = useContract();

  const frameworkOptions = FRAMEWORKS.map(f => ({ value: f.frameworkId, label: f.title }));

  async function handleSubmit(data: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);

    try {
      const result = await createCase({
        title: String(data.title ?? ""),
        category: String(data.category ?? ""),
        respondent: String(data.respondent ?? ""),
        frameworkId: String(data.frameworkId ?? ""),
        claimSummary: String(data.claimSummary ?? ""),
        requestedRemedy: String(data.requestedRemedy ?? ""),
        responseDeadlineDays: Number(data.responseDeadlineDays ?? 7),
      });

      setTxHash(result.txHash);
      setPending(true);
      setSubmitting(false);

      const receipt = await waitForRuling(result.txHash);

      setPending(false);

      setTimeout(() => {
        router.push("/app/cases");
      }, 1500);
    } catch (err: unknown) {
      console.error("[NewCasePage] createCase failed:", err);
      setError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
      setSubmitting(false);
      setPending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "2rem" }}
      >
        <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>
          ARBITRATION → NEW CASE
        </div>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em" }}>
          Open New Arbitration Case
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginTop: "0.5rem", lineHeight: 1.6 }}>
          Define the dispute, select a framework, and identify the respondent. All fields are required unless marked optional.
        </p>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(125,31,42,0.12)", border: "1px solid rgba(125,31,42,0.4)", borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#A94343", fontSize: "0.875rem" }}
        >
          {error}
        </motion.div>
      )}

      {/* Pending: validators processing */}
      {pending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: "rgba(198,156,93,0.08)", border: "1px solid rgba(198,156,93,0.3)", borderRadius: "4px", padding: "2rem", textAlign: "center" }}
        >
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ fontSize: "2rem", marginBottom: "1rem", display: "inline-block" }}>⏳</motion.div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", color: "#C69C5D", marginBottom: "0.5rem" }}>Validators Processing</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginBottom: "0.75rem" }}>
            GenLayer validators are reaching consensus. This may take a few seconds to minutes.
          </div>
          {txHash && (
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.75rem", color: "rgba(241,232,210,0.4)" }}>
              Tx: {txHash.slice(0, 20)}...
            </div>
          )}
        </motion.div>
      )}

      {/* Success state */}
      {!pending && newCaseId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ background: "rgba(100,143,112,0.1)", border: "1px solid rgba(100,143,112,0.4)", borderRadius: "4px", padding: "3rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.25rem", color: "#648F70", marginBottom: "0.5rem" }}>Case Created</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginBottom: "1rem" }}>
            Case ID: <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "#C69C5D" }}>{newCaseId}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.4)" }}>Redirecting to case room...</div>
        </motion.div>
      )}

      {/* Form */}
      {!pending && !newCaseId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "2rem" }}
        >
          <CaseCreateForm
            onSubmit={handleSubmit}
            frameworks={frameworkOptions}
            submitting={submitting}
          />
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: "2rem", background: "rgba(125,31,42,0.08)", border: "1px solid rgba(125,31,42,0.2)", borderRadius: "4px", padding: "1.25rem" }}
      >
        <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.45)", lineHeight: 1.7 }}>
          <span style={{ fontFamily: "var(--font-cinzel), serif", color: "#7D1F2A", fontSize: "0.65rem", letterSpacing: "0.1em" }}>DISCLAIMER </span>
          — Lexora arbitration is advisory only. Rulings do not constitute legal judgments and carry no legal enforceability. By creating a case, you acknowledge that participation is voluntary.
        </div>
      </motion.div>
    </motion.div>
  );
}
