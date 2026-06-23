import type {
  ArbitrationRuling,
  ArbitrationCase,
  AuditEvent,
} from "@/lib/genlayer/types";

// ─── Mock Ruling Factory ──────────────────────────────────────────────────────

/**
 * Returns a realistic mock ruling for development/testing.
 * Used when no contract is deployed or when NEXT_PUBLIC_CONTRACT_ADDRESS is unset.
 */
export function getMockRuling(
  caseId: string,
  frameworkId: string
): ArbitrationRuling {
  const now = Math.floor(Date.now() / 1000);

  return {
    rulingId: `mock-ruling-${caseId.slice(0, 8)}`,
    caseId,
    outcome: "PARTIAL_SETTLEMENT",
    confidence: 72,
    remedy: {
      action: "PAY",
      amountBasis: "65% of the disputed amount, reflecting partial delivery of the agreed milestones",
      deadlineDays: 14,
      notes:
        "Payment should be made directly to the claimant's wallet within 14 calendar days of acceptance. Failure to comply may result in further action through appropriate channels.",
    },
    reasoningSummary:
      `Under the ${frameworkId} framework, the evidence presented indicates that the respondent delivered ` +
      `a substantial portion of the agreed work, but failed to complete the final milestone within the ` +
      `contracted timeline. The claimant provided communication records demonstrating repeated follow-up ` +
      `with no satisfactory response. The respondent's counter-submission acknowledged the delay but ` +
      `attributed it to scope changes not documented in any formal change order. On balance, a partial ` +
      `payment of 65% is consistent with the principle that payment is owed for accepted or substantially ` +
      `complete work, while recognising the claimant's loss from the incomplete final milestone.`,
    ruleApplication: [
      {
        rule: "Milestones are evaluated against the original brief, not evolving expectations",
        finding: "APPLIED",
        reason:
          "The original brief was clear and the respondent acknowledged the scope at the start. Undocumented scope changes are not admissible.",
      },
      {
        rule: "Payment is owed for accepted or substantially complete work",
        finding: "APPLIED",
        reason:
          "Milestones 1 and 2 were delivered and used by the claimant without objection. Payment for these is due.",
      },
      {
        rule: "Late delivery is a breach unless force majeure or client-caused delay applies",
        finding: "PARTIAL",
        reason:
          "The respondent cited client feedback delays for milestone 3, but the evidence shows responses were provided within 48 hours on average, which is reasonable.",
      },
    ],
    evidenceMap: [
      {
        evidenceTitle: "Original Project Brief (PDF)",
        supports: "claimant",
        weight: "high",
        reason:
          "Clearly defines milestone scope and timeline. Respondent's delivered work is measurably incomplete against this document.",
      },
      {
        evidenceTitle: "Email Thread — Revision Requests",
        supports: "claimant",
        weight: "medium",
        reason:
          "Shows claimant provided structured feedback promptly. Contradicts respondent's delay justification.",
      },
      {
        evidenceTitle: "Respondent's Milestone 1 & 2 Deliverables",
        supports: "respondent",
        weight: "high",
        reason:
          "Deliverables for milestones 1 and 2 meet the specification in the brief. Justifies partial payment.",
      },
      {
        evidenceTitle: "Respondent's Counter-Statement",
        supports: "neutral",
        weight: "low",
        reason:
          "Unsubstantiated claims of scope change without a written change order carry low evidentiary weight.",
      },
    ],
    proceduralWarnings: [
      "This is a mock ruling generated in development mode. No actual AI analysis was performed.",
      "Do not rely on this ruling for any real-world dispute resolution.",
    ],
    safetyBoundary:
      "This ruling is advisory only. It does not constitute a legal judgment and carries no legal enforceability. Parties remain free to seek resolution through formal legal channels.",
    createdAt: now,
  };
}

// ─── Mock Audit Events ────────────────────────────────────────────────────────

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    eventId: "evt-001",
    caseId: "mock-case-001",
    eventType: "CASE_CREATED",
    actor: "0xClaimant0000000000000000000000000000000001",
    data: { frameworkId: "freelance-milestone", title: "Website Redesign Dispute" },
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 7,
  },
  {
    eventId: "evt-002",
    caseId: "mock-case-001",
    eventType: "RESPONDENT_ACCEPTED",
    actor: "0xRespondent000000000000000000000000000000002",
    data: {},
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 6,
  },
  {
    eventId: "evt-003",
    caseId: "mock-case-001",
    eventType: "CLAIM_SUBMITTED",
    actor: "0xClaimant0000000000000000000000000000000001",
    data: { claimHash: "0xabc123" },
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
  },
  {
    eventId: "evt-004",
    caseId: "mock-case-001",
    eventType: "RESPONSE_SUBMITTED",
    actor: "0xRespondent000000000000000000000000000000002",
    data: { responseHash: "0xdef456" },
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 4,
  },
  {
    eventId: "evt-005",
    caseId: "mock-case-001",
    eventType: "RULING_REQUESTED",
    actor: "0xClaimant0000000000000000000000000000000001",
    data: {},
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
  },
  {
    eventId: "evt-006",
    caseId: "mock-case-001",
    eventType: "RULING_ISSUED",
    actor: "SYSTEM",
    data: { outcome: "PARTIAL_SETTLEMENT", confidence: 72 },
    timestamp: Math.floor(Date.now() / 1000) - 86400,
  },
];

// ─── Mock Cases ───────────────────────────────────────────────────────────────

export const MOCK_CASES: ArbitrationCase[] = [
  {
    caseId: "mock-case-001",
    title: "Website Redesign — Incomplete Final Milestone",
    category: "Freelance & Services",
    claimant: "0xClaimant0000000000000000000000000000000001",
    respondent: "0xRespondent000000000000000000000000000000002",
    frameworkId: "freelance-milestone",
    status: "RULING_ISSUED",
    claimHash: "0xabc123def456000000000000000000000000000000000000000000000000abcd",
    responseHash: "0xdef456abc123000000000000000000000000000000000000000000000000efgh",
    evidenceRoot: "0x789000000000000000000000000000000000000000000000000000000000root",
    rulingId: "mock-ruling-mock-case",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
    updatedAt: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    caseId: "mock-case-002",
    title: "SaaS Subscription — Service Downtime Refund Request",
    category: "Consumer & Subscriptions",
    claimant: "0xClaimant0000000000000000000000000000000003",
    respondent: "0xRespondent000000000000000000000000000000004",
    frameworkId: "digital-service-refund",
    status: "UNDER_REVIEW",
    claimHash: "0x111222333444555666777888999aaabbbccc0000000000000000000000000000",
    responseHash: "0xdddeeefff000111222333444555666777888999aaabbbccc0000000000000000",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    caseId: "mock-case-003",
    title: "DAO Grant — Milestone 2 Deliverable Not Met",
    category: "Web3 & DAO",
    claimant: "0xClaimant0000000000000000000000000000000005",
    respondent: "0xRespondent000000000000000000000000000000006",
    frameworkId: "dao-grant-performance",
    status: "SUBMISSIONS_OPEN",
    claimHash: "0xgrant00000000000000000000000000000000000000000000000000000grant1",
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    updatedAt: Math.floor(Date.now() / 1000) - 1800,
  },
];
