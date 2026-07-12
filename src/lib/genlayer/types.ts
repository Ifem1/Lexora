// ─── Case Status ──────────────────────────────────────────────────────────────

export type CaseStatus =
  | "DRAFT"
  | "AWAITING_RESPONDENT"
  | "SUBMISSIONS_OPEN"
  | "RESPONSE_WINDOW"
  | "UNDER_REVIEW"
  | "RULING_ISSUED"
  | "ACCEPTED"
  | "APPEALED"
  | "SETTLED"
  | "CANCELLED";

// ─── Arbitration Case ─────────────────────────────────────────────────────────

export type ArbitrationCase = {
  caseId: string;
  title: string;
  category: string;
  claimant: string;
  respondent: string;
  frameworkId: string;
  status: CaseStatus;
  claimHash: string;
  responseHash?: string;
  evidenceRoot?: string;
  rulingId?: string;
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
  | "PARTIAL_SETTLEMENT"
  | "RENEGOTIATE"
  | "MORE_EVIDENCE_REQUIRED"
  | "OUT_OF_SCOPE";

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
  createdAt: number;
};

// ─── Appeal ───────────────────────────────────────────────────────────────────

export type AppealGround =
  | "NEW_EVIDENCE"
  | "MATERIAL_ERROR"
  | "FRAMEWORK_MISAPPLIED"
  | "PROCEDURAL_UNFAIRNESS"
  | "EVIDENCE_MISUNDERSTOOD"
  | "REMEDY_DISPROPORTIONATE";

export type AppealOutcome =
  | "UPHOLD"
  | "REVISE"
  | "REQUEST_MORE_EVIDENCE"
  | "PROCEDURAL_ERROR_FOUND"
  | "OUT_OF_SCOPE";

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
