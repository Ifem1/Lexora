"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useContract } from "@/hooks/useContract";
import { waitForRuling } from "@/lib/genlayer/client";
import type { Agreement, EscrowAccount } from "@/lib/genlayer/types";

function genToWei(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{0,18})?$/.test(trimmed)) throw new Error("Enter a valid GEN amount with at most 18 decimals.");
  const [whole, fraction = ""] = trimmed.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt((fraction + "0".repeat(18)).slice(0, 18));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return "0x" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export default function AgreementRoomPage() {
  const params = useParams();
  const agreementId = String(params?.id ?? "");
  const { address } = useAccount();
  const {
    getAgreement, getEscrow, acceptAgreement, depositEscrow, openDispute,
  } = useContract();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [nextAgreement, nextEscrow] = await Promise.all([
      getAgreement(agreementId), getEscrow(agreementId),
    ]);
    setAgreement(nextAgreement);
    setEscrow(nextEscrow);
  }, [agreementId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  async function run(label: string, action: () => Promise<`0x${string}`>) {
    setError("");
    try {
      setStatus("submitted");
      const txHash = await action();
      setStatus(`${label}: processing`);
      await waitForRuling(txHash);
      setStatus(`${label}: finalized; verifying authoritative state`);
      await refresh();
      setStatus(`${label}: execution success`);
    } catch (err) {
      setStatus(`${label}: execution failure`);
      setError(err instanceof Error ? err.message : "Transaction failed.");
    }
  }

  if (!agreement) {
    return <main style={{ padding: "2rem" }}>Loading agreement {agreementId}…</main>;
  }

  const isCounterparty = address?.toLowerCase() === agreement.counterparty.toLowerCase();
  const isFunder = address?.toLowerCase() === agreement.funder.toLowerCase();
  const active = agreement.lifecycleState === "ACTIVE";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <p style={{ color: "#C69C5D", fontSize: 12, letterSpacing: "0.12em" }}>AGREEMENT {agreement.agreementId}</p>
      <h1>{agreement.title}</h1>
      <div style={{ display: "grid", gap: 8, padding: 18, border: "1px solid rgba(241,232,210,.12)" }}>
        <div>Lifecycle: <strong>{agreement.lifecycleState}</strong></div>
        <div>Acceptance: <strong>{agreement.acceptanceState}</strong></div>
        <div>Creator: {agreement.creator}</div>
        <div>Counterparty: {agreement.counterparty}</div>
        <div>Funder: {agreement.funder}</div>
        <div>Framework: {agreement.frameworkId}</div>
        <div>Maximum exposure: {agreement.maximumExposureWei ?? String(agreement.maximumExposure)} wei</div>
        <div>Required funding: {agreement.requiredFundingWei ?? String(agreement.requiredFunding)} wei</div>
        <div>Agreement commitment: <code>{agreement.commitment}</code></div>
      </div>

      {escrow && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
          {[
            ["Deposited", escrow.totalDepositedWei ?? String(escrow.totalDeposited)],
            ["Available", escrow.availableWei ?? String(escrow.available)],
            ["Reserved", escrow.reservedWei ?? String(escrow.reserved)],
            ["Claimable", escrow.claimableWei ?? String(escrow.claimable)],
            ["Refundable", escrow.refundableWei ?? String(escrow.refundable)],
            ["Paid", escrow.paidWei ?? String(escrow.paid)],
            ["Refunded", escrow.refundedWei ?? String(escrow.refunded)],
          ].map(([label, value]) => <div key={String(label)} style={{ padding: 12, border: "1px solid rgba(241,232,210,.1)" }}>{label}: {String(value)}</div>)}
        </div>
      )}

      {agreement.acceptanceState === "PROPOSED" && isCounterparty && (
        <button onClick={() => run("accept", () => acceptAgreement(agreement.agreementId, agreement.version, agreement.commitment))}
          style={{ marginTop: 20, padding: "0.8rem 1rem" }}>
          Accept exact agreement commitment
        </button>
      )}

      {agreement.acceptanceState === "ACCEPTED" && isFunder && !active && (
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          run("fund", () => depositEscrow(agreement.agreementId, genToWei(String(form.get("amount") ?? "0"))));
        }} style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <input name="amount" inputMode="decimal" required placeholder="GEN amount to deposit" />
          <button type="submit">Deposit native GEN</button>
        </form>
      )}

      {active && (
        <form onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const title = String(form.get("title") ?? "");
          const category = String(form.get("category") ?? "AGREEMENT_DISPUTE");
          const manifestHash = await sha256([agreement.agreementId, title, category].join("|"));
          run("open dispute", () => openDispute({
            agreementId: agreement.agreementId,
            caseManifestHash: manifestHash,
            title,
            category,
            responseDeadlineDays: Number(form.get("days") ?? 7),
          }));
        }} style={{ marginTop: 28, display: "grid", gap: 10 }}>
          <h2>Open agreement-bound dispute</h2>
          <input name="title" minLength={5} required placeholder="Dispute title" />
          <input name="category" required defaultValue="AGREEMENT_DISPUTE" />
          <input name="days" type="number" min="1" max="90" defaultValue="7" />
          <button type="submit" disabled={Boolean(escrow?.activeDisputeId)}>Open dispute and reserve escrow</button>
          {escrow?.activeDisputeId && <p>Unresolved dispute: <a href={`/app/cases/${escrow.activeDisputeId}`}>{escrow.activeDisputeId}</a></p>}
        </form>
      )}

      {status && <p style={{ marginTop: 20 }}>Transaction: <strong>{status}</strong></p>}
      {error && <p style={{ color: "#A94343" }}>{error}</p>}
    </main>
  );
}
