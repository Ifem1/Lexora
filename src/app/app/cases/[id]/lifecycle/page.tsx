"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useContract } from "@/hooks/useContract";
import { waitForRuling } from "@/lib/genlayer/client";
import type { ArbitrationCase, SettlementRecord } from "@/lib/genlayer/types";

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return "0x" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

const APPEAL_GROUNDS = [
  "MATERIAL_NEW_EVIDENCE",
  "EVIDENCE_RETRIEVAL_FAILURE",
  "MATERIAL_CONTRADICTION",
  "PROCEDURAL_ERROR",
  "MATERIAL_AGREEMENT_MISAPPLICATION",
  "MATERIAL_REMEDY_MISCALCULATION",
] as const;

export default function CaseLifecyclePage() {
  const caseId = String(useParams()?.id ?? "");
  const { address } = useAccount();
  const {
    getCase, getSettlement, getCaseEvidence, submitEvidenceRecord, lockEvidence,
    submitAppealEvidence, appealRuling, finalizeNoAppeal,
    finalizeZeroAwardSettlement, executeClaimablePayout,
  } = useContract();
  const [caseData, setCaseData] = useState<ArbitrationCase | null>(null);
  const [settlement, setSettlement] = useState<SettlementRecord | null>(null);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [appealEvidenceCount, setAppealEvidenceCount] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  const refresh = useCallback(async () => {
    const [nextCase, originalEvidence, appealEvidence] = await Promise.all([
      getCase(caseId), getCaseEvidence(caseId, false), getCaseEvidence(caseId, true),
    ]);
    setCaseData(nextCase);
    setEvidenceCount(originalEvidence.length);
    setAppealEvidenceCount(appealEvidence.length);
    if (nextCase?.status === "SETTLEMENT_READY" || nextCase?.status === "SETTLED") {
      setSettlement(await getSettlement(caseId));
    } else {
      setSettlement(null);
    }
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const timer = window.setTimeout(() => setNow(Math.floor(Date.now() / 1000)), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function run(label: string, action: () => Promise<`0x${string}`>) {
    setError("");
    try {
      setStatus(`${label}: submitted`);
      const txHash = await action();
      setStatus(`${label}: processing`);
      await waitForRuling(txHash);
      setStatus(`${label}: finalized; verifying execution state`);
      await refresh();
      setStatus(`${label}: execution success`);
    } catch (err) {
      setStatus(`${label}: execution failure`);
      setError(err instanceof Error ? err.message : "Transaction failed.");
    }
  }

  if (!caseData) return <main style={{ padding: "2rem" }}>Loading dispute {caseId}…</main>;

  const isClaimant = address?.toLowerCase() === caseData.claimant.toLowerCase();
  const isRespondent = address?.toLowerCase() === caseData.respondent.toLowerCase();
  const isParty = isClaimant || isRespondent;
  const appealOpen = caseData.status === "RULING_ISSUED" && now <= (caseData.appealDeadlineTs ?? 0);
  const appealExpired = caseData.status === "RULING_ISSUED" && now > (caseData.appealDeadlineTs ?? 0);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <p><Link href={`/app/cases/${caseId}`}>← Back to dispute</Link></p>
      <h1>Dispute lifecycle</h1>
      <div style={{ display: "grid", gap: 6, padding: 16, border: "1px solid rgba(241,232,210,.12)" }}>
        <div>Case: <strong>{caseData.caseId}</strong></div>
        <div>Agreement: <strong>{caseData.agreementId}</strong></div>
        <div>Status: <strong>{caseData.status}</strong></div>
        <div>Evidence: <strong>{caseData.evidenceState ?? "EVIDENCE_OPEN"}</strong> ({evidenceCount} original / {appealEvidenceCount} appeal)</div>
        <div>Reserved escrow: <strong>{caseData.reservedAmountWei ?? String(caseData.reservedAmount ?? 0)} wei</strong></div>
        <div>Initial ruling: {caseData.initialRulingId || "—"}</div>
        <div>Final ruling: {caseData.finalRulingId || "—"}</div>
        <div>Settlement: {caseData.settlementState || "NONE"}</div>
      </div>

      {isParty && caseData.evidenceState !== "EVIDENCE_LOCKED" && ["AWAITING_RESPONDENT","SUBMISSIONS_OPEN","RESPONSE_WINDOW"].includes(caseData.status) && (
        <section style={{ marginTop: 26 }}>
          <h2>Append immutable evidence</h2>
          <form onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
            const description = String(form.get("description") ?? "").trim();
            const evidenceType = String(form.get("evidenceType") ?? "OTHER");
            const evidenceClass = sourceUrl
              ? "PUBLIC_WEB"
              : isClaimant ? "CLAIMANT_EVIDENCE" : "RESPONDENT_EVIDENCE";
            const commitment = await sha256([evidenceType, sourceUrl, description].join("|"));
            await run("append evidence", () => submitEvidenceRecord({
              caseId, evidenceClass, evidenceType, sourceUrl, description, commitment,
            }));
            e.currentTarget.reset();
          }} style={{ display: "grid", gap: 10 }}>
            <input name="evidenceType" required defaultValue="OTHER" placeholder="Evidence type" />
            <input name="sourceUrl" placeholder="https:// public source (optional)" />
            <textarea name="description" rows={3} required placeholder="Description and claimed relevance" />
            <button type="submit">Append evidence</button>
          </form>
          <button
            onClick={() => run("lock evidence", () => lockEvidence(caseId))}
            disabled={evidenceCount === 0}
            style={{ marginTop: 12 }}
          >
            Lock original evidence
          </button>
        </section>
      )}

      {isParty && appealOpen && (
        <section style={{ marginTop: 30 }}>
          <h2>One application-level appeal</h2>
          <p>Original ruling and original evidence remain immutable. New material is appended to the appeal record only.</p>
          <form onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
            const description = String(form.get("description") ?? "").trim();
            const commitment = await sha256([sourceUrl, description].join("|"));
            await run("append appeal evidence", () => submitAppealEvidence({
              caseId, evidenceType: "APPEAL", sourceUrl, description, commitment,
            }));
            e.currentTarget.reset();
          }} style={{ display: "grid", gap: 10 }}>
            <input name="sourceUrl" placeholder="https:// new public source (optional)" />
            <textarea name="description" required rows={3} placeholder="New appeal evidence" />
            <button type="submit">Append appeal evidence</button>
          </form>

          <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const appealPacket = JSON.stringify({
              appealGround: String(form.get("ground") ?? ""),
              appealStatement: String(form.get("statement") ?? ""),
            });
            run("appeal", () => appealRuling(caseId, appealPacket));
          }} style={{ display: "grid", gap: 10, marginTop: 20 }}>
            <select name="ground" required defaultValue="">
              <option value="" disabled>Select closed appeal ground</option>
              {APPEAL_GROUNDS.map(g => <option key={g} value={g}>{g.replaceAll("_", " ")}</option>)}
            </select>
            <textarea name="statement" required rows={4} placeholder="Explain why this ground materially affects the initial ruling" />
            <button type="submit">Submit one appeal</button>
          </form>
        </section>
      )}

      {appealExpired && (
        <section style={{ marginTop: 30 }}>
          <h2>Appeal window expired</h2>
          <button onClick={() => run("finalize no appeal", () => finalizeNoAppeal(caseId))}>
            Finalize initial ruling and prepare settlement
          </button>
        </section>
      )}

      {settlement && (
        <section style={{ marginTop: 30, padding: 16, border: "1px solid rgba(241,232,210,.12)" }}>
          <h2>Settlement accounting</h2>
          <div>State: {settlement.state}</div>
          <div>Recipient: {settlement.recipient || "none"}</div>
          <div>Award: {settlement.awardAmountWei ?? String(settlement.awardAmount)} wei</div>
          <div>Unused reservation released: {settlement.releasedAmountWei ?? String(settlement.releasedAmount)} wei</div>
          {BigInt(settlement.awardAmountWei ?? String(settlement.awardAmount)) === BigInt(0) && settlement.state === "READY" && (
            <button onClick={() => run("settle zero award", () => finalizeZeroAwardSettlement(caseId))} style={{ marginTop: 12 }}>
              Finalize zero-award settlement
            </button>
          )}
          {BigInt(settlement.awardAmountWei ?? String(settlement.awardAmount)) > BigInt(0) && settlement.state === "READY" && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => run("emit payout transfer", () => executeClaimablePayout(caseId))}>
                Schedule finalization-bound GEN payout
              </button>
              <p style={{ opacity: 0.75 }}>
                This emits the external transfer on finalization and locks replay. Accounting remains CLAIMABLE until Codex/live verification proves the transfer-completion confirmation path.
              </p>
            </div>
          )}
          {settlement.state === "TRANSFER_EMITTED" && (
            <p style={{ marginTop: 12, opacity: 0.75 }}>
              Finalization-bound payout message emitted. This UI deliberately does not label the award PAID until live transfer completion is verified.
            </p>
          )}
        </section>
      )}

      {status && <p style={{ marginTop: 24 }}>Transaction: <strong>{status}</strong></p>}
      {error && <p style={{ color: "#A94343" }}>{error}</p>}
    </main>
  );
}
