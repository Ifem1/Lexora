"use client";

import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";
import { useContract } from "@/hooks/useContract";
import { waitForRuling } from "@/lib/genlayer/client";

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return "0x" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

function genToWei(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{0,18})?$/.test(trimmed)) throw new Error("Enter a valid GEN amount with at most 18 decimals.");
  const [whole, fraction = ""] = trimmed.split(".");
  return BigInt(whole) * BigInt(10) ** BigInt(18) + BigInt((fraction + "0".repeat(18)).slice(0, 18));
}

export default function NewAgreementPage() {
  const { address } = useAccount();
  const { proposeAgreement, getAgreement } = useContract();
  const [status, setStatus] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreatedId("");
    const form = new FormData(event.currentTarget);
    const agreementId = String(form.get("agreementId") ?? "").trim();
    try {
      if (!address) throw new Error("Connect the designated funder wallet first.");
      const counterparty = String(form.get("counterparty") ?? "").trim();
      const frameworkId = String(form.get("frameworkId") ?? "");
      const title = String(form.get("title") ?? "").trim();
      const description = String(form.get("description") ?? "").trim();
      const obligations = String(form.get("obligations") ?? "").trim();
      const criteria = String(form.get("criteria") ?? "").trim();
      const evidenceRules = String(form.get("evidenceRules") ?? "").trim();
      const remedies = String(form.get("remedies") ?? "")
        .split(",").map(x => x.trim().toUpperCase()).filter(Boolean);
      if (!agreementId || !counterparty || !title || !description || !obligations || !criteria || !evidenceRules) {
        throw new Error("Complete all agreement fields.");
      }

      setStatus("submitted");
      const txHash = await proposeAgreement({
        agreementId,
        counterparty,
        funder: address,
        frameworkId,
        frameworkVersion: "v1",
        title,
        descriptionCommitment: await sha256(description),
        obligationCommitment: await sha256(obligations),
        acceptanceCriteriaCommitment: await sha256(criteria),
        evidenceRulesCommitment: await sha256(evidenceRules),
        permittedRemedies: remedies,
        maximumExposure: genToWei(String(form.get("maximumExposure") ?? "0")),
        requiredFunding: genToWei(String(form.get("requiredFunding") ?? "0")),
        acceptanceWindowDays: Number(form.get("acceptanceWindowDays") ?? 7),
        performanceWindowDays: Number(form.get("performanceWindowDays") ?? 30),
        disputeWindowDays: Number(form.get("disputeWindowDays") ?? 45),
      });
      setStatus("processing");
      await waitForRuling(txHash);
      setStatus("finalized; verifying execution state");
      const authoritative = await getAgreement(agreementId);
      if (!authoritative || authoritative.agreementId !== agreementId) {
        throw new Error("Transaction finalized but authoritative agreement state was not found.");
      }
      setCreatedId(agreementId);
      setStatus("execution success");
    } catch (err) {
      setStatus("execution failure");
      setError(err instanceof Error ? err.message : "Agreement transaction failed.");
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "2rem" }}>
      <p style={{ color: "#C69C5D", fontSize: 12, letterSpacing: "0.12em" }}>AGREEMENT → REVIEW → ACCEPT → FUND</p>
      <h1 style={{ fontSize: 30, margin: "0.5rem 0" }}>Create bilateral agreement</h1>
      <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
        A dispute cannot exist until the counterparty accepts these committed terms and the designated funder deposits the required native GEN escrow.
      </p>

      <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 28 }}>
        <input name="agreementId" required placeholder="Agreement ID, e.g. AGREEMENT-MARY-001" />
        <input name="counterparty" required placeholder="Counterparty 0x address" />
        <input name="title" required placeholder="Agreement title" />
        <select name="frameworkId" required defaultValue="">
          <option value="" disabled>Select arbitration framework</option>
          {FRAMEWORKS.map(f => <option key={f.frameworkId} value={f.frameworkId}>{f.title}</option>)}
        </select>
        <textarea name="description" required rows={3} placeholder="Agreement description" />
        <textarea name="obligations" required rows={4} placeholder="Frozen obligations of both parties" />
        <textarea name="criteria" required rows={3} placeholder="Acceptance/performance criteria" />
        <textarea name="evidenceRules" required rows={3} placeholder="Evidence rules" />
        <input name="remedies" required defaultValue="PAY,NO_ACTION,REWORK" placeholder="Permitted remedies, comma-separated" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input name="maximumExposure" required inputMode="decimal" placeholder="Maximum exposure (GEN)" />
          <input name="requiredFunding" required inputMode="decimal" placeholder="Required escrow (GEN)" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <input name="acceptanceWindowDays" type="number" min="1" defaultValue="7" aria-label="Acceptance window days" />
          <input name="performanceWindowDays" type="number" min="1" defaultValue="30" aria-label="Performance window days" />
          <input name="disputeWindowDays" type="number" min="1" defaultValue="45" aria-label="Dispute window days" />
        </div>
        <button type="submit" style={{ padding: "0.85rem", cursor: "pointer" }}>Propose agreement</button>
      </form>

      {status && <p style={{ marginTop: 18 }}>Transaction: <strong>{status}</strong></p>}
      {error && <p style={{ color: "#A94343" }}>{error}</p>}
      {createdId && (
        <p>
          Agreement verified. <a href={`/app/agreements/${encodeURIComponent(createdId)}`}>Review, accept or fund {createdId} →</a>
        </p>
      )}
    </main>
  );
}
