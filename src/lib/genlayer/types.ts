// ─── Case Status ──────────────────────────────────────────────────────────────

export type CaseStatus =
  | "DRAFT"
  | "AWAITING_RESPONDENT"
  | "SUBMISSIONS_OPEN"
  | "RESPONSE_WINDOW"
  | "UNDER_REVIEW"
  | "RULING_ISSUED"
  | "FINAL_RULING"
  | "SETTLEMENT_READY"
  | "SETTLED"
  | "CANCELLED";

// ─── Arbitration Case ─────────────────────────────────────────────────────────

export type ArbitrationCase = {
  caseId: string;
  agreementId?: string;
  title: string;
  category: string;
  claimant: string;
  respondent: string;
  frameworkId: string;
  status: CaseStatus;
  claimHash: string;
  responseHash?: string;
  evidenceRoot?: string;
  evidenceState?: "EVIDENCE_OPEN" | "EVIDENCE_LOCKED";
  rulingId?: string;
  initialRulingId?: string;
  finalRulingId?: string;
  appealId?: string;
  appealDeadlineTs?: number;
  reservedAmount?: number;
  settlementState?: string;
  createdAt: number;
  updatedAt: number;
};

// ─── Arbitration Framework ────────────────────────────────────────────────────

export type ArbitrationFramework = {
  frameworkId: string;
  title: string;
  category: string;
  description: string;
  principles: string[];
  decisionFactors: string[];
  remedyOptions: string[];
  burdenOfProof: "CLAIMANT" | "BALANCED" | "RESPONDENT";
  evidenceRules: string[];
  excludedMatters: string[];
  icon: string;
};

// ─── Evidence ─────────────────────────────────────────────────────────────────

export type EvidenceType =
  | "CONTRACT"
  | "MESSAGE"
  | "SCREENSHOT"
  | "INVOICE"
  | "DELIVERY_FILE"
  | "PAYMENT_PROOF"
  | "TIMELINE"
  | "WITNESS_STATEMENT"
  | "OTHER";

export type EvidencePacket = {
  evidenceId: string;
  caseId: string;
  submittedBy: string;
  evidenceType: EvidenceType;
  title: string;
  summary: string;
  fileHash?: string;
  storageUri?: string;
  sourceUrl?: string;
  relevanceTag?: string;
  createdAt: number;
};

export type EvidenceManifest = {
  caseId: string;
  evidenceItems: EvidencePacket[];
  manifestHash: string;
  createdAt: number;
};

// ─── Ruling ───────────────────────────────────────────────────────────────────

export type RulingOutcome =
  | "CLAIMANT_PREVAILS"
  | "RESPONDENT_PREVAILS"
  | "PARTIAL"
  | "INSUFFICIENT_EVIDENCE"
  | "PROCEDURAL_FAILURE";

export type RemedyAction =
  | "PAY"
  | "REFUND"
  | "RELEASE_ESCROW"
  | "REWORK"
  | "CANCEL"
  | "NO_ACTION"
  | "NEGOTIATE";

export type RuleApplication = {
  rule: string;
  finding: string;
  reason: string;
};

export type EvidenceMapItem = {
  evidenceTitle: string;
  supports: "claimant" | "respondent" | "neutral";
  weight: "high" | "medium" | "low";
  reason: string;
};

export type ArbitrationRuling = {
  rulingId: string;
  caseId: string;
  outcome: RulingOutcome;
  confidence: number;
  remedy: {
    action: RemedyAction;
    amountBasis?: string;
    deadlineDays?: number;
    notes?: string;
  };
  reasoningSummary: string;
  ruleApplication: RuleApplication[];
  evidenceMap: EvidenceMapItem[];
  proceduralWarnings: string[];
  safetyBoundary: string;
  liabilityBps?: number;
  boundedAward?: number;
  createdAt: number;
};

// ─── Appeal ───────────────────────────────────────────────────────────────────

export type AppealGround =
  | "MATERIAL_NEW_EVIDENCE"
  | "EVIDENCE_RETRIEVAL_FAILURE"
  | "MATERIAL_CONTRADICTION"
  | "PROCEDURAL_ERROR"
  | "MATERIAL_AGREEMENT_MISAPPLICATION"
  | "MATERIAL_REMEDY_MISCALCULATION";

export type AppealOutcome = "UPHOLD" | "REVISE" | "PROCEDURAL_FAILURE";

export type Agreement = {
  agreementId: string;
  version: number;
  creator: string;
  counterparty: string;
  funder: string;
  frameworkId: string;
  frameworkVersion: string;
  title: string;
  permittedRemedies: RemedyAction[];
  maximumExposure: number;
  requiredFunding: number;
  acceptanceDeadlineTs: number;
  performanceDeadlineTs: number;
  disputeDeadlineTs: number;
  proposedAt: number;
  acceptedAt: number;
  acceptanceState: "PROPOSED" | "ACCEPTED" | "CANCELLED";
  lifecycleState: "PROPOSED" | "ACCEPTED_PENDING_FUNDING" | "ACTIVE" | "CANCELLED";
  commitment: string;
};

export type EscrowAccount = {
  agreementId: string;
  totalDeposited: number;
  available: number;
  reserved: number;
  claimable: number;
  refundable: number;
  paid: number;
  refunded: number;
  activeDisputeId: string;
};

export type SettlementRecord = {
  disputeId: string;
  agreementId: string;
  state: string;
  recipient: string;
  awardAmount: number;
  releasedAmount: number;
  preparedAt: number;
  paidAt: number;
};

// ─── Review Packet ────────────────────────────────────────────────────────────

export type ReviewPacket = {
  caseId: string;
  category: string;
  framework: ArbitrationFramework;
  claimantStatement: string;
  respondentStatement: string;
  evidence: EvidencePacket[];
  evidenceCommitment: string;
  packetCommitment: string;
  proceduralState: Record<string, unknown>;
};

// ─── Audit ────────────────────────────────────────────────────────────────────

export type AuditEvent = {
  eventId: string;
  caseId: string;
  eventType: string;
  actor: string;
  data: Record<string, unknown>;
  timestamp: number;
};
