"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCase } from "@/hooks/useCase";
import { useContract } from "@/hooks/useContract";
import { waitForRuling } from "@/lib/genlayer/client";
import EvidenceVault from "@/components/evidence/EvidenceVault";
import EvidenceUploadPanel from "@/components/evidence/EvidenceUploadPanel";
import EvidenceHashPanel from "@/components/evidence/EvidenceHashPanel";
import type { EvidenceManifest } from "@/lib/genlayer/types";
import { useAccount } from "wagmi";
import { hashString } from "@/lib/utils/hashes";
import { createRetainedEvidence, loadCaseDossier, retainEvidence } from "@/lib/genlayer/caseDossier";
import { evidenceCommitment } from "@/lib/genlayer/packetCommitments";

export default function EvidencePage() {
  const params = useParams();
  const caseId = params?.id as string;
  const { address } = useAccount();

  const { caseData, loading, refresh } = useCase(caseId);
  const { submitEvidence } = useContract();

  const [txPending, setTxPending] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  async function handleSubmitEvidence(evidenceData: {
    evidenceType: string;
    title: string;
    summary: string;
    fileHash?: string;
    storageUri?: string;
    sourceUrl?: string;
    relevanceTag?: string;
  }) {
    if (!caseData) return;
    setTxError(null);
    setTxPending(true);
    setTxStatus("Submitting evidence...");
    try {
      // Hash the evidence manifest locally — only the hash goes on-chain
      const manifestStr = JSON.stringify({ caseId: caseData.caseId, ...evidenceData });
      const manifestHash = `0x${await hashString(manifestStr)}`;
      const item = createRetainedEvidence(caseData.caseId, address ?? "unknown", evidenceData);
      const evidenceRoot = await evidenceCommitment([...loadCaseDossier(caseData.caseId).evidence, item]);
      const txHash = await submitEvidence({
        caseId: caseData.caseId,
        evidenceManifestHash: manifestHash,
        evidenceRoot,
      });
      setTxStatus("Waiting for validators...");
      await waitForRuling(txHash);
      retainEvidence(item);
      setTxStatus("Evidence submitted. Refreshing...");
      await refresh();
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setTxPending(false);
      setTxStatus(null);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)", fontSize: "0.875rem" }}>
          Loading case from contract...
        </div>
      </div>
    );
  }

  const retainedEvidence = loadCaseDossier(caseId).evidence;
  const manifest: EvidenceManifest = {
    caseId: caseData?.caseId ?? caseId,
    evidenceItems: retainedEvidence,
    manifestHash: caseData?.evidenceRoot ?? "0x0000000000000000000000000000000000000000000000000000000000000000",
    createdAt: retainedEvidence.at(-1)?.createdAt ?? 0,
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
        <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
        {" → "}
        <Link href={`/app/cases/${caseId}`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>{caseId}</Link>
        {" → "}
        <span style={{ color: "#C69C5D" }}>EVIDENCE</span>
      </div>

      {/* Tx Status Banner */}
      {(txPending || txStatus || txError) && (
        <div style={{
          background: txError ? "rgba(125,31,42,0.12)" : "rgba(198,156,93,0.08)",
          border: `1px solid ${txError ? "rgba(125,31,42,0.4)" : "rgba(198,156,93,0.3)"}`,
          borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "1.5rem",
          color: txError ? "#A94343" : "#C69C5D", fontSize: "0.875rem"
        }}>
          {txError ?? txStatus}
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", color: "#C69C5D", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Evidence Vault
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.5)" }}>
          All evidence submitted for case <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "#C69C5D" }}>{caseId}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <EvidenceVault evidence={retainedEvidence} />
          <EvidenceUploadPanel
            onSubmit={handleSubmitEvidence}
            submitting={txPending}
          />
        </div>
        <div>
          <EvidenceHashPanel manifest={manifest} />
        </div>
      </div>
    </div>
  );
}
