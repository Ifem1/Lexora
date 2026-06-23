import type { CaseStatus, ArbitrationCase } from "@/lib/genlayer/types";

// ─── Status Transition Map ────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus | null> = {
  DRAFT: "AWAITING_RESPONDENT",
  AWAITING_RESPONDENT: "SUBMISSIONS_OPEN",
  SUBMISSIONS_OPEN: "RESPONSE_WINDOW",
  RESPONSE_WINDOW: "UNDER_REVIEW",
  UNDER_REVIEW: "RULING_ISSUED",
  RULING_ISSUED: "ACCEPTED",
  ACCEPTED: null,
  APPEALED: "UNDER_REVIEW",
  SETTLED: null,
  CANCELLED: null,
};

// ─── Terminal statuses (no further transitions) ───────────────────────────────

export const TERMINAL_STATUSES: CaseStatus[] = [
  "ACCEPTED",
  "SETTLED",
  "CANCELLED",
];

// ─── Ordered status flow for progress indicators ──────────────────────────────

export const STATUS_FLOW: CaseStatus[] = [
  "DRAFT",
  "AWAITING_RESPONDENT",
  "SUBMISSIONS_OPEN",
  "RESPONSE_WINDOW",
  "UNDER_REVIEW",
  "RULING_ISSUED",
  "ACCEPTED",
];

/**
 * Returns the next status in the standard case lifecycle, or null if terminal.
 */
export function getNextStatus(current: CaseStatus): CaseStatus | null {
  return STATUS_TRANSITIONS[current] ?? null;
}

/**
 * Returns true if the case can have a ruling requested.
 * Requires the case to be in UNDER_REVIEW status and to have both
 * a claim hash and a response hash (both parties have submitted).
 */
export function canRequestRuling(caseData: ArbitrationCase): boolean {
  return (
    caseData.status === "UNDER_REVIEW" &&
    Boolean(caseData.claimHash) &&
    Boolean(caseData.responseHash)
  );
}

/**
 * Returns a human-readable label for a case status.
 */
export function getStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    DRAFT: "Draft",
    AWAITING_RESPONDENT: "Awaiting Respondent",
    SUBMISSIONS_OPEN: "Submissions Open",
    RESPONSE_WINDOW: "Response Window",
    UNDER_REVIEW: "Under Review",
    RULING_ISSUED: "Ruling Issued",
    ACCEPTED: "Accepted",
    APPEALED: "Appealed",
    SETTLED: "Settled",
    CANCELLED: "Cancelled",
  };
  return labels[status] ?? status;
}

/**
 * Returns a Tailwind color class string for badge/pill rendering.
 */
export function getStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    DRAFT: "bg-zinc-700 text-zinc-300",
    AWAITING_RESPONDENT: "bg-amber-900/50 text-amber-300",
    SUBMISSIONS_OPEN: "bg-blue-900/50 text-blue-300",
    RESPONSE_WINDOW: "bg-indigo-900/50 text-indigo-300",
    UNDER_REVIEW: "bg-violet-900/50 text-violet-300",
    RULING_ISSUED: "bg-emerald-900/50 text-emerald-300",
    ACCEPTED: "bg-green-900/50 text-green-300",
    APPEALED: "bg-orange-900/50 text-orange-300",
    SETTLED: "bg-teal-900/50 text-teal-300",
    CANCELLED: "bg-red-900/50 text-red-400",
  };
  return colors[status] ?? "bg-zinc-700 text-zinc-300";
}

/**
 * Returns true if no further transitions are possible.
 */
export function isTerminalStatus(status: CaseStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Returns the ordinal index of the status in the standard flow (for progress bars).
 * Returns -1 for out-of-flow statuses (APPEALED, SETTLED, CANCELLED).
 */
export function getStatusFlowIndex(status: CaseStatus): number {
  return STATUS_FLOW.indexOf(status);
}
