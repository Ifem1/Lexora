import type {
  ArbitrationCase,
  ArbitrationRuling,
  CaseStatus,
  RulingOutcome,
  RemedyAction,
} from "@/lib/genlayer/types";

// ─── Case Mapper ──────────────────────────────────────────────────────────────

/**
 * Map a raw JSON string (or object) from chain into a typed ArbitrationCase.
 * The contract is expected to return a JSON-encoded case object.
 */
export function mapCaseFromChain(raw: string | Record<string, unknown>): ArbitrationCase {
  const data: Record<string, unknown> =
    typeof raw === "string" ? JSON.parse(raw) : raw;

  return {
    caseId: String(data.case_id ?? data.caseId ?? ""),
    title: String(data.title ?? "Untitled Case"),
    category: String(data.category ?? ""),
    claimant: String(data.claimant ?? ""),
    respondent: String(data.respondent ?? ""),
    frameworkId: String(data.framework_id ?? data.frameworkId ?? ""),
    status: normalizeStatus(String(data.status ?? "DRAFT")),
    claimHash: String(data.claim_hash ?? data.claimHash ?? ""),
    responseHash: data.response_hash
      ? String(data.response_hash)
      : data.responseHash
      ? String(data.responseHash)
      : undefined,
    evidenceRoot: data.evidence_root
      ? String(data.evidence_root)
      : data.evidenceRoot
      ? String(data.evidenceRoot)
      : undefined,
    rulingId: data.ruling_id
      ? String(data.ruling_id)
      : data.rulingId
      ? String(data.rulingId)
      : undefined,
    createdAt: Number(data.created_at ?? data.createdAt ?? 0),
    updatedAt: Number(data.updated_at ?? data.updatedAt ?? 0),
  };
}

// ─── Ruling Mapper ────────────────────────────────────────────────────────────

/**
 * Map a raw JSON string (or object) from chain into a typed ArbitrationRuling.
 */
export function mapRulingFromChain(raw: string | Record<string, unknown>): ArbitrationRuling {
  const data: Record<string, unknown> =
    typeof raw === "string" ? JSON.parse(raw) : raw;

  const remedy = (data.remedy ?? {}) as Record<string, unknown>;
  const ruleApplication = Array.isArray(data.rule_application ?? data.ruleApplication)
    ? (data.rule_application ?? data.ruleApplication) as Record<string, unknown>[]
    : [];

  const evidenceMap = Array.isArray(data.evidence_map ?? data.evidenceMap)
    ? (data.evidence_map ?? data.evidenceMap) as Record<string, unknown>[]
    : [];

  return {
    rulingId: String(data.ruling_id ?? data.rulingId ?? ""),
    caseId: String(data.case_id ?? data.caseId ?? ""),
    outcome: normalizeRulingOutcome(String(data.outcome ?? "")),
    confidence: Number(data.confidence ?? 0),
    remedy: {
      action: normalizeRemedyAction(String(remedy.action ?? "NO_ACTION")),
      amountBasis: remedy.amount_basis
        ? String(remedy.amount_basis)
        : remedy.amountBasis
        ? String(remedy.amountBasis)
        : undefined,
      deadlineDays: remedy.deadline_days
        ? Number(remedy.deadline_days)
        : remedy.deadlineDays
        ? Number(remedy.deadlineDays)
        : undefined,
      notes: remedy.notes ? String(remedy.notes) : undefined,
    },
    reasoningSummary: String(data.reasoning_summary ?? data.reasoningSummary ?? ""),
    ruleApplication: ruleApplication.map((r) => ({
      rule: String(r.rule ?? ""),
      finding: String(r.finding ?? ""),
      reason: String(r.reason ?? ""),
    })),
    evidenceMap: evidenceMap.map((e) => ({
      evidenceTitle: String(e.evidence_title ?? e.evidenceTitle ?? ""),
      supports: normalizeSupports(String(e.supports ?? "neutral")),
      weight: normalizeWeight(String(e.weight ?? "medium")),
      reason: String(e.reason ?? ""),
    })),
    proceduralWarnings: Array.isArray(data.procedural_warnings ?? data.proceduralWarnings)
      ? ((data.procedural_warnings ?? data.proceduralWarnings) as unknown[]).map(String)
      : [],
    safetyBoundary: String(data.safety_boundary ?? data.safetyBoundary ?? ""),
    createdAt: Number(data.created_at ?? data.createdAt ?? 0),
  };
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

const VALID_STATUSES: CaseStatus[] = [
  "DRAFT",
  "AWAITING_RESPONDENT",
  "SUBMISSIONS_OPEN",
  "RESPONSE_WINDOW",
  "UNDER_REVIEW",
  "RULING_ISSUED",
  "ACCEPTED",
  "APPEALED",
  "SETTLED",
  "CANCELLED",
];

function normalizeStatus(raw: string): CaseStatus {
  const upper = raw.toUpperCase() as CaseStatus;
  return VALID_STATUSES.includes(upper) ? upper : "DRAFT";
}

const VALID_OUTCOMES: RulingOutcome[] = [
  "CLAIMANT_PREVAILS",
  "RESPONDENT_PREVAILS",
  "PARTIAL_SETTLEMENT",
  "RENEGOTIATE",
  "MORE_EVIDENCE_REQUIRED",
  "OUT_OF_SCOPE",
];

export function normalizeRulingOutcome(outcome: string): RulingOutcome {
  const upper = outcome.toUpperCase() as RulingOutcome;
  return VALID_OUTCOMES.includes(upper) ? upper : "MORE_EVIDENCE_REQUIRED";
}

const VALID_REMEDY_ACTIONS: RemedyAction[] = [
  "PAY",
  "REFUND",
  "RELEASE_ESCROW",
  "REWORK",
  "CANCEL",
  "NO_ACTION",
  "NEGOTIATE",
];

function normalizeRemedyAction(raw: string): RemedyAction {
  const upper = raw.toUpperCase() as RemedyAction;
  return VALID_REMEDY_ACTIONS.includes(upper) ? upper : "NO_ACTION";
}

function normalizeSupports(raw: string): "claimant" | "respondent" | "neutral" {
  const lower = raw.toLowerCase();
  if (lower === "claimant" || lower === "respondent") return lower;
  return "neutral";
}

function normalizeWeight(raw: string): "high" | "medium" | "low" {
  const lower = raw.toLowerCase();
  if (lower === "high" || lower === "medium" || lower === "low") return lower;
  return "medium";
}
