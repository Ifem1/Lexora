import type { RemedyAction } from "@/lib/genlayer/types";

// ─── Remedy Action Registry ───────────────────────────────────────────────────

export const REMEDY_ACTIONS: RemedyAction[] = [
  "PAY",
  "REFUND",
  "RELEASE_ESCROW",
  "REWORK",
  "CANCEL",
  "NO_ACTION",
  "NEGOTIATE",
];

// ─── Remedy Labels ────────────────────────────────────────────────────────────

const REMEDY_LABELS: Record<RemedyAction, string> = {
  PAY: "Make Payment",
  REFUND: "Issue Refund",
  RELEASE_ESCROW: "Release Escrow Funds",
  REWORK: "Complete Rework",
  CANCEL: "Cancel Agreement",
  NO_ACTION: "No Action Required",
  NEGOTIATE: "Negotiate Settlement",
};

/**
 * Returns a concise human-readable label for a remedy action.
 */
export function getRemedyLabel(action: RemedyAction): string {
  return REMEDY_LABELS[action] ?? action;
}

// ─── Remedy Descriptions ──────────────────────────────────────────────────────

const REMEDY_DESCRIPTIONS: Record<RemedyAction, string> = {
  PAY:
    "The responsible party must make an outstanding payment for services rendered or goods delivered. The amount and timeline will be specified in the ruling.",
  REFUND:
    "The respondent must return funds already paid by the claimant. The refund may be full or partial based on the ruling findings.",
  RELEASE_ESCROW:
    "Funds held in escrow by a third party or smart contract should be released to the designated party as directed by the ruling.",
  REWORK:
    "The respondent must redo or correct the delivered work to meet the agreed specifications. A reasonable deadline for completion will be set.",
  CANCEL:
    "The agreement between the parties is terminated. Any obligations not yet performed are extinguished, and a final accounting may apply.",
  NO_ACTION:
    "Neither party is required to take any further action. The dispute is resolved in favour of the status quo.",
  NEGOTIATE:
    "The parties are directed to re-enter negotiation to reach a mutually acceptable resolution, potentially with a mediator if required.",
};

/**
 * Returns a full description of what a remedy action entails.
 */
export function getRemedyDescription(action: RemedyAction): string {
  return REMEDY_DESCRIPTIONS[action] ?? "No description available.";
}

// ─── Remedy Icon ──────────────────────────────────────────────────────────────

const REMEDY_ICONS: Record<RemedyAction, string> = {
  PAY: "💸",
  REFUND: "↩️",
  RELEASE_ESCROW: "🔓",
  REWORK: "🔨",
  CANCEL: "❌",
  NO_ACTION: "✅",
  NEGOTIATE: "🤝",
};

/**
 * Returns an emoji icon for a remedy action.
 */
export function getRemedyIcon(action: RemedyAction): string {
  return REMEDY_ICONS[action] ?? "⚖️";
}
