"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCase } from "@/hooks/useCase";
import { useContract } from "@/hooks/useContract";
import { waitForRuling as waitForTx } from "@/lib/genlayer/client";
import type { AppealGround } from "@/lib/genlayer/types";

const APPEAL_GROUNDS: { value: AppealGround; label: string; desc: string }[] = [
  { value: "NEW_EVIDENCE", label: "New Evidence", desc: "Material evidence that was not available at the time of the original ruling." },
  { value: "MATERIAL_ERROR", label: "Material Error of Fact", desc: "The ruling contains a factual error that materially affected the outcome." },
  { value: "FRAMEWORK_MISAPPLIED", label: "Framework Misapplied", desc: "The selected framework was applied incorrectly or an incorrect framework was used." },
  { value: "PROCEDURAL_UNFAIRNESS", label: "Procedural Unfairness", desc: "A party was denied the opportunity to submit evidence or respond." },
  { value: "EVIDENCE_MISUNDERSTOOD", label: "Evidence Misunderstood", desc: "The ruling misinterpreted or mischaracterised key evidence." },
  { value: "REMEDY_DISPROPORTIONATE", label: "Remedy Disproportionate", desc: "The remedy ordered is disproportionate to the nature of the breach." },
];

export default function AppealPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const { caseData, ruling, loading } = useCase(caseId);
  const { appealRuling } = useContract();

  const [selectedGround, setSelectedGround] = useState<AppealGround | "">("");
  const [appealStatement, setAppealStatement] = useState("");
  const [newEvidence, setNewEvidence] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGround || !appealStatement.trim() || !caseData) return;

    setTxError(null);
    setTxPending(true);

    const appealPacket = JSON.stringify({
      ground: selectedGround,
      statement: appealStatement.trim(),
      newEvidence: newEvidence.trim() || null,
      rulingId: ruling?.rulingId ?? caseData.rulingId ?? null,
      submittedAt: Math.floor(Date.now() / 1000),
    });

    try {
      const hash = await appealRuling(caseData.caseId, appealPacket);
      setTxHash(hash);
      // Wait for validators to process the appeal
      await waitForTx(hash);
      setSubmitted(true);
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
    } finally {
      setTxPending(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(241,232,210,0.4)", fontSize: "0.875rem" }}>
          Loading case from contract...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "1.5rem" }}>
        <Link href="/app/cases" style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>CASES</Link>
        {" → "}
        <Link href={`/app/cases/${caseId}`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>{caseId}</Link>
        {" → "}
        <Link href={`/app/cases/${caseId}/ruling`} style={{ color: "rgba(241,232,210,0.4)", textDecoration: "none" }}>RULING</Link>
        {" → "}
        <span style={{ color: "#A94343" }}>APPEAL</span>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", color: "#A94343", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          Appeal Arbitration Ruling
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)" }}>
          Appeals must be filed on one of the six defined grounds. Unsupported appeals will not be admitted.
        </p>
      </div>

      {/* Tx Error */}
      {txError && (
        <div style={{ background: "rgba(125,31,42,0.12)", border: "1px solid rgba(125,31,42,0.4)", borderRadius: "4px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#A94343", fontSize: "0.875rem" }}>
          {txError}
        </div>
      )}

      {/* Pending */}
      {txPending && (
        <div style={{ background: "rgba(198,156,93,0.08)", border: "1px solid rgba(198,156,93,0.3)", borderRadius: "4px", padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", color: "#C69C5D", marginBottom: "0.5rem" }}>Validators Processing Appeal</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginBottom: "0.5rem" }}>GenLayer validators are reviewing your appeal. This may take several minutes.</div>
          {txHash && (
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.75rem", color: "rgba(241,232,210,0.4)" }}>
              Tx: {txHash.slice(0, 20)}...
            </div>
          )}
        </div>
      )}

      {submitted ? (
        <div style={{ background: "rgba(100,143,112,0.1)", border: "1px solid rgba(100,143,112,0.3)", borderRadius: "4px", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.25rem", color: "#648F70", marginBottom: "0.5rem" }}>Appeal Filed</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginBottom: "0.75rem" }}>Your appeal has been submitted and validators are processing it. Check the ruling page for updates.</div>
          {txHash && (
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.75rem", color: "rgba(241,232,210,0.4)" }}>Tx: {txHash}</div>
          )}
        </div>
      ) : !txPending && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Previous Ruling Summary */}
          {ruling && (
            <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.65rem", color: "rgba(241,232,210,0.4)", letterSpacing: "0.1em", marginBottom: "1rem" }}>RULING BEING APPEALED</div>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "0.25rem" }}>Outcome</div>
                  <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#C69C5D" }}>{ruling.outcome.replace(/_/g, " ")}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "0.25rem" }}>Confidence</div>
                  <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#C69C5D" }}>{ruling.confidence}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "0.25rem" }}>Remedy</div>
                  <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, color: "#C69C5D" }}>{ruling.remedy.action}</div>
                </div>
              </div>
              <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "rgba(241,232,210,0.5)", lineHeight: 1.6 }}>{ruling.reasoningSummary.slice(0, 200)}...</div>
            </div>
          )}

          {/* Appeal Ground */}
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "1rem" }}>Select Appeal Ground</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {APPEAL_GROUNDS.map(ground => (
                <label key={ground.value} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer", padding: "0.875rem", borderRadius: "2px", background: selectedGround === ground.value ? "rgba(169,67,67,0.1)" : "transparent", border: `1px solid ${selectedGround === ground.value ? "rgba(169,67,67,0.4)" : "rgba(241,232,210,0.06)"}` }}>
                  <input type="radio" name="ground" value={ground.value} checked={selectedGround === ground.value} onChange={() => setSelectedGround(ground.value as AppealGround)}
                    style={{ marginTop: "3px", accentColor: "#A94343" }} />
                  <div>
                    <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#F1E8D2", marginBottom: "0.25rem" }}>{ground.label}</div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.5)", lineHeight: 1.5 }}>{ground.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* New Evidence */}
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "0.5rem" }}>New Evidence <span style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", fontFamily: "var(--font-ibm-plex-sans), sans-serif", fontWeight: 400 }}>(optional)</span></div>
            <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.5)", marginBottom: "0.75rem" }}>If your appeal is based on new evidence, describe it here. Upload will be available after submission.</div>
            <textarea
              value={newEvidence}
              onChange={e => setNewEvidence(e.target.value)}
              placeholder="Describe the new evidence and why it was not available previously..."
              rows={4}
              style={{ width: "100%", background: "#0B0D10", border: "1px solid rgba(241,232,210,0.15)", borderRadius: "2px", color: "#F1E8D2", padding: "0.75rem", fontSize: "0.875rem", fontFamily: "var(--font-ibm-plex-sans), sans-serif", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Appeal Statement */}
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "#F1E8D2", marginBottom: "0.5rem" }}>Appeal Statement <span style={{ fontSize: "0.75rem", color: "#A94343" }}>*</span></div>
            <div style={{ fontSize: "0.8rem", color: "rgba(241,232,210,0.5)", marginBottom: "0.75rem" }}>Provide a clear and reasoned argument for why the original ruling should be revised.</div>
            <textarea
              value={appealStatement}
              onChange={e => setAppealStatement(e.target.value)}
              placeholder="State clearly why the ruling was incorrect and what outcome you believe is appropriate..."
              rows={8}
              required
              style={{ width: "100%", background: "#0B0D10", border: "1px solid rgba(241,232,210,0.15)", borderRadius: "2px", color: "#F1E8D2", padding: "0.75rem", fontSize: "0.875rem", fontFamily: "var(--font-ibm-plex-sans), sans-serif", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href={`/app/cases/${caseId}/ruling`} style={{ color: "rgba(241,232,210,0.5)", textDecoration: "none", fontSize: "0.875rem" }}>
              ← Back to Ruling
            </Link>
            <button
              type="submit"
              disabled={!selectedGround || !appealStatement.trim()}
              style={{ background: selectedGround && appealStatement.trim() ? "#A94343" : "rgba(169,67,67,0.3)", color: "#F1E8D2", padding: "0.75rem 2rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: selectedGround && appealStatement.trim() ? "pointer" : "not-allowed", fontSize: "0.9rem" }}
            >
              File Appeal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
