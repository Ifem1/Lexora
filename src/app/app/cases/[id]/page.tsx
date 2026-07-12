"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useCase } from "@/hooks/useCase";
import { useContract } from "@/hooks/useContract";
import { waitForRuling } from "@/lib/genlayer/client";
import ProceduralChecklist from "@/components/cases/ProceduralChecklist";
import PartyPanel from "@/components/cases/PartyPanel";
import CaseStatusTimeline from "@/components/cases/CaseStatusTimeline";
import ClaimStatementCard from "@/components/cases/ClaimStatementCard";
import ResponseStatementCard from "@/components/cases/ResponseStatementCard";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";
import { buildReviewPacket, serializeReviewPacket } from "@/lib/genlayer/reviewPacketBuilder";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { loadCaseDossier, retainStatement } from "@/lib/genlayer/caseDossier";

const STATUS_COLORS: Record<string, string> = {
  RULING_ISSUED: "#648F70",
  UNDER_REVIEW: "#C69C5D",
  SUBMISSIONS_OPEN: "#6B8FB3",
  AWAITING_RESPONDENT: "#C58B3B",
};

export default function CaseRoomPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const { address, isConnected } = useAccount();

  const { caseData, ruling, canRule, loading, refresh } = useCase(caseId);
  const { submitClaim, submitResponse, requestRuling } = useContract();

  const [claimText, setClaimText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const framework = caseData
    ? FRAMEWORKS.find(f => f.frameworkId === caseData.frameworkId)
    : undefined;

  const isClaimant =
    isConnected && address?.toLowerCase() === caseData?.claimant?.toLowerCase();
  const isRespondent =
    isConnected && address?.toLowerCase() === caseData?.respondent?.toLowerCase();
  const hasClaim = !!caseData?.claimHash;
  const hasResponse = !!caseData?.responseHash;
  const checklistComplete = hasClaim && hasResponse;

  async function handleSubmitClaim() {
    if (!caseData || !claimText.trim()) return;
    setTxError(null);
    setTxPending(true);
    setTxStatus("Submitting claim...");
    try {
      const txHash = await submitClaim({
        caseId: caseData.caseId,
        claimStatement: claimText.trim(),
      });
      setTxStatus("Waiting for validators...");
      await waitForRuling(txHash);
      retainStatement(caseData.caseId, "claimant", claimText.trim());
      setTxStatus("Claim submitted. Refreshing...");
      await refresh();
      setClaimText("");
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setTxPending(false);
      setTxStatus(null);
    }
  }

  async function handleSubmitResponse() {
    if (!caseData || !responseText.trim()) return;
    setTxError(null);
    setTxPending(true);
    setTxStatus("Submitting response...");
    try {
      const txHash = await submitResponse({
        caseId: caseData.caseId,
        responseStatement: responseText.trim(),
      });
      setTxStatus("Waiting for validators...");
      await waitForRuling(txHash);
      retainStatement(caseData.caseId, "respondent", responseText.trim());
      setTxStatus("Response submitted. Refreshing...");
      await refresh();
      setResponseText("");
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setTxPending(false);
      setTxStatus(null);
    }
  }

  async function handleRequestRuling() {
    if (!caseData || !framework) return;
    setTxError(null);
    setTxPending(true);
    setTxStatus("Building review packet...");
    try {
      const dossier = loadCaseDossier(caseData.caseId);
      const packet = await buildReviewPacket(
        caseData,
        framework,
        dossier.claimantStatement,
        dossier.respondentStatement,
        dossier.evidence,
        {}
      );
      const packetJson = serializeReviewPacket(packet);
      setTxStatus("Requesting ruling from validators...");
      const txHash = await requestRuling(caseData.caseId, packetJson);
      setTxStatus("Waiting for AI arbitration (this may take a few minutes)...");
      await waitForRuling(txHash);
      setTxStatus("Ruling issued. Refreshing...");
      await refresh();
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setTxPending(false);
      setTxStatus(null);
    }
  }

  // Loading
  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}><Skeleton width="200px" height="0.7rem" /></div>
        <div style={{ marginBottom: "0.5rem" }}><Skeleton width="400px" height="1.5rem" /></div>
        <div style={{ marginBottom: "2rem", display: "flex", gap: "0.75rem" }}>
          <Skeleton width="120px" height="1.5rem" borderRadius="2px" />
          <Skeleton width="100px" height="1.5rem" borderRadius="2px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Skeleton width="100%" height="200px" borderRadius="4px" />
            <Skeleton width="100%" height="150px" borderRadius="4px" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Skeleton width="100%" height="300px" borderRadius="4px" />
            <Skeleton width="100%" height="120px" borderRadius="4px" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!caseData) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)" }}>
          <div style={{ fontFamily: "var(--font-cinzel), serif", marginBottom: "0.5rem" }}>Case not found</div>
          <div style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Case <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "#C69C5D" }}>{caseId}</span> was not found on the contract.
          </div>
          <Link href="/app/cases" style={{ color: "#C69C5D", textDecoration: "none", fontSize: "0.875rem" }}>← Back to Cases</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
        <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
        {" → "}
        <span style={{ color: "#C69C5D" }}>{caseId}</span>
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

      {/* Case Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", color: "#F1E8D2", marginBottom: "0.5rem" }}>{caseData.title}</h1>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.75rem", borderRadius: "2px", background: `${STATUS_COLORS[caseData.status] ?? "#C69C5D"}22`, color: STATUS_COLORS[caseData.status] ?? "#C69C5D", border: `1px solid ${STATUS_COLORS[caseData.status] ?? "#C69C5D"}44`, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
              {caseData.status.replace(/_/g, " ")}
            </span>
            <span style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)" }}>{caseData.category}</span>
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.3)" }}>{caseData.caseId}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={refresh}
            style={{ border: "1px solid rgba(241,232,210,0.2)", background: "transparent", color: "rgba(241,232,210,0.55)", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Refresh
          </button>
          <Link href={`/app/cases/${caseId}/evidence`} style={{ border: "1px solid rgba(241,232,210,0.2)", color: "rgba(241,232,210,0.68)", padding: "0.5rem 1rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.8rem" }}>
            Evidence Vault
          </Link>
          {caseData.rulingId && (
            <Link href={`/app/cases/${caseId}/ruling`} style={{ background: "#C69C5D", color: "#0B0D10", padding: "0.5rem 1rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700 }}>
              View Ruling
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <ProceduralChecklist caseData={caseData} />
          <PartyPanel caseData={caseData} connectedAddress={address} />

          {/* Framework Card */}
          {framework && (
            <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.25rem" }}>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>FRAMEWORK</div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{framework.icon}</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#C69C5D", marginBottom: "0.5rem" }}>{framework.title}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.55)", lineHeight: 1.6, marginBottom: "0.75rem" }}>{framework.description.slice(0, 100)}...</div>
              <div style={{ fontSize: "0.7rem", background: "rgba(14,76,79,0.2)", color: "#6B8FB3", border: "1px solid rgba(14,76,79,0.3)", padding: "0.15rem 0.5rem", borderRadius: "2px", display: "inline-block" }}>
                Burden: {framework.burdenOfProof}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <CaseStatusTimeline currentStatus={caseData.status} />

          <ClaimStatementCard
            statement={caseData.claimHash
              ? `Claim submitted. Hash: ${caseData.claimHash.slice(0, 40)}...`
              : "No claim submitted yet."}
            hash={caseData.claimHash}
            submittedAt={caseData.createdAt + 3600}
            submittedBy={caseData.claimant}
          />

          <ResponseStatementCard
            statement={hasResponse
              ? `Response submitted. Hash: ${caseData.responseHash!.slice(0, 40)}...`
              : undefined}
            hash={caseData.responseHash}
            submittedAt={hasResponse ? caseData.updatedAt : undefined}
            submittedBy={caseData.respondent}
          />

          {/* Submit Claim */}
          {isClaimant && !hasClaim && (
            <div style={{ background: "rgba(100,143,112,0.1)", border: "1px solid rgba(100,143,112,0.35)", borderRadius: "4px", padding: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#648F70", marginBottom: "0.75rem" }}>Submit Your Claim</div>
              <textarea
                value={claimText}
                onChange={e => setClaimText(e.target.value)}
                placeholder="Describe your claim in detail..."
                rows={6}
                style={{ width: "100%", background: "#0B0D10", border: "1px solid rgba(241,232,210,0.15)", borderRadius: "2px", color: "#F1E8D2", padding: "0.75rem", fontSize: "0.875rem", fontFamily: "var(--font-ibm-plex-sans), sans-serif", resize: "vertical", boxSizing: "border-box" }}
              />
              <button
                onClick={handleSubmitClaim}
                disabled={txPending || !claimText.trim()}
                style={{ marginTop: "0.75rem", background: txPending ? "rgba(100,143,112,0.4)" : "#648F70", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: txPending ? "not-allowed" : "pointer", fontSize: "0.875rem" }}
              >
                {txPending ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          )}

          {/* Submit Response */}
          {isRespondent && !hasResponse && (
            <div style={{ background: "rgba(14,76,79,0.1)", border: "1px solid rgba(14,76,79,0.35)", borderRadius: "4px", padding: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", color: "#6B8FB3", marginBottom: "0.75rem" }}>Submit Your Response</div>
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Enter your response statement..."
                rows={6}
                style={{ width: "100%", background: "#0B0D10", border: "1px solid rgba(241,232,210,0.15)", borderRadius: "2px", color: "#F1E8D2", padding: "0.75rem", fontSize: "0.875rem", fontFamily: "var(--font-ibm-plex-sans), sans-serif", resize: "vertical", boxSizing: "border-box" }}
              />
              <button
                onClick={handleSubmitResponse}
                disabled={txPending || !responseText.trim()}
                style={{ marginTop: "0.75rem", background: txPending ? "rgba(198,156,93,0.4)" : "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: txPending ? "not-allowed" : "pointer", fontSize: "0.875rem" }}
              >
                {txPending ? "Submitting..." : "Submit Response"}
              </button>
            </div>
          )}

          {/* Request Ruling */}
          {(checklistComplete || canRule) && caseData.status !== "RULING_ISSUED" && caseData.status !== "UNDER_REVIEW" && (
            <div style={{ background: "rgba(198,156,93,0.07)", border: "1px solid rgba(198,156,93,0.25)", borderRadius: "4px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, marginBottom: "0.25rem" }}>Procedural checklist complete</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.55)" }}>All required submissions received. Request AI arbitration.</div>
              </div>
              <button
                onClick={handleRequestRuling}
                disabled={txPending}
                style={{ background: txPending ? "rgba(198,156,93,0.4)" : "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.5rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: txPending ? "not-allowed" : "pointer", fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                {txPending ? "Processing..." : "Request Ruling"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
