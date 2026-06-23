"use client";

import { useState } from "react";
import ArbitrationPacketPanel from "@/components/playground/ArbitrationPacketPanel";
import ValidatorReasoningGrid from "@/components/playground/ValidatorReasoningGrid";
import ConsensusRulingPanel from "@/components/playground/ConsensusRulingPanel";
import RemedySimulator from "@/components/playground/RemedySimulator";
import ArbitrationConsole from "@/components/layout/ArbitrationConsole";
import { getMockRuling, MOCK_CASES } from "@/lib/genlayer/mockDevRulings";
import { FRAMEWORKS } from "@/lib/arbitration/frameworks";
import { buildReviewPacket } from "@/lib/genlayer/reviewPacketBuilder";
import type { ValidatorPerspective } from "@/components/playground/ValidatorReasoningGrid";

type RunState = "idle" | "running" | "complete";

const MOCK_VALIDATORS: ValidatorPerspective[] = [
  {
    validatorId: "validator-01",
    initialAssessment: "Evidence strongly supports partial delivery. Claimant's documentation is clear and internally consistent.",
    confidence: 74,
    keyFactors: ["Original brief matches scope claim", "Milestone 1 & 2 deliverables accepted", "No formal change order exists"],
  },
  {
    validatorId: "validator-02",
    initialAssessment: "Respondent's delay attribution is weak without documented client-caused delays exceeding reasonable turnaround.",
    confidence: 70,
    keyFactors: ["48hr average response time is reasonable", "Milestone 3 incomplete against brief", "Counter-statement unsupported"],
  },
  {
    validatorId: "validator-03",
    initialAssessment: "Framework rule on undocumented scope change is dispositive. Partial payment at 65% is proportionate.",
    confidence: 73,
    keyFactors: ["Freelance-Milestone framework applies", "Substantial completion triggers partial payment", "Proportionate remedy aligns with framework"],
  },
];

export default function PlaygroundPage() {
  const [runState, setRunState] = useState<RunState>("idle");
  const [ruling, setRuling] = useState<ReturnType<typeof getMockRuling> | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  const sampleCase = MOCK_CASES[0] ?? null;
  const framework = sampleCase
    ? FRAMEWORKS.find(f => f.frameworkId === sampleCase.frameworkId) ?? FRAMEWORKS[0]
    : FRAMEWORKS[0];

  const packet = sampleCase && framework
    ? buildReviewPacket(
        sampleCase,
        framework,
        "The respondent failed to deliver the final milestone within the agreed timeline. I provided prompt feedback on all revision requests and the work remains incomplete as per the original brief.",
        "The scope was changed multiple times during delivery and timeline overruns were caused by client revision cycles, not our delay.",
        [],
      )
    : null;

  function handleRunArbitration() {
    setRunState("running");
    setShowConsole(true);
    setTimeout(() => {
      setRuling(getMockRuling(sampleCase.caseId, sampleCase.frameworkId));
      setRunState("complete");
    }, 3500);
  }

  function handleReset() {
    setRunState("idle");
    setRuling(null);
    setShowConsole(false);
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.7rem", color: "rgba(241,232,210,0.4)", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>
            DEMO ENVIRONMENT · NO REAL CONTRACT
          </div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.75rem", color: "#C69C5D", letterSpacing: "0.08em" }}>
            Arbitration Playground
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(241,232,210,0.55)", marginTop: "0.25rem" }}>
            Simulate a full GenLayer arbitration run on a sample dispute.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {runState !== "idle" && (
            <button onClick={handleReset}
              style={{ border: "1px solid rgba(241,232,210,0.2)", color: "rgba(241,232,210,0.68)", padding: "0.625rem 1.25rem", borderRadius: "2px", background: "transparent", cursor: "pointer", fontSize: "0.875rem" }}>
              Reset
            </button>
          )}
          <button onClick={handleRunArbitration} disabled={runState === "running"}
            style={{ background: runState === "running" ? "rgba(198,156,93,0.4)" : "#C69C5D", color: "#0B0D10", padding: "0.625rem 1.75rem", borderRadius: "2px", border: "none", fontWeight: 700, cursor: runState === "running" ? "not-allowed" : "pointer", fontSize: "0.875rem" }}>
            {runState === "idle" ? "▶ Run Arbitration" : runState === "running" ? "⏳ Processing..." : "✓ Complete"}
          </button>
        </div>
      </div>

      {/* Main Layout: 3 column */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 280px", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {/* Left: Packet */}
        <ArbitrationPacketPanel packet={packet!} />

        {/* Center: Validator Grid + Consensus */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {runState !== "idle" && <ValidatorReasoningGrid validators={MOCK_VALIDATORS} />}
          {runState === "idle" && (
            <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "4rem", textAlign: "center", color: "rgba(241,232,210,0.35)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "3rem" }}>⚖️</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem" }}>Click Run Arbitration to begin</div>
              <div style={{ fontSize: "0.8rem" }}>Validators will analyse the packet and produce a ruling.</div>
            </div>
          )}
          {ruling && <ConsensusRulingPanel ruling={ruling} />}
        </div>

        {/* Right: Remedy Simulator */}
        {ruling ? (
          <RemedySimulator ruling={ruling} evidenceItems={ruling.evidenceMap} />
        ) : (
          <div style={{ background: "#171B20", border: "1px solid rgba(241,232,210,0.08)", borderRadius: "4px", padding: "2rem", textAlign: "center", color: "rgba(241,232,210,0.35)", fontSize: "0.8rem" }}>
            Remedy Simulator<br />available after ruling
          </div>
        )}
      </div>

      {/* Bottom: Console */}
      {showConsole && (
        <ArbitrationConsole defaultOpen={true} />
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: "1.5rem", background: "rgba(125,31,42,0.08)", border: "1px solid rgba(125,31,42,0.2)", borderRadius: "4px", padding: "1rem 1.5rem" }}>
        <div style={{ fontSize: "0.75rem", color: "rgba(241,232,210,0.4)", lineHeight: 1.7 }}>
          <span style={{ fontFamily: "var(--font-cinzel), serif", color: "#7D1F2A", fontSize: "0.65rem", letterSpacing: "0.1em" }}>DEMO DISCLAIMER </span>
          — The arbitration shown here is simulated using mock data. No actual AI analysis is performed. No GenLayer contract is called. This is for demonstration purposes only. Rulings are advisory and carry no legal force.
        </div>
      </div>
    </div>
  );
}
