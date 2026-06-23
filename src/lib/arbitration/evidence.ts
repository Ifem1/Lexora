import type {
  EvidencePacket,
  EvidenceManifest,
  EvidenceType,
} from "@/lib/genlayer/types";
import { generateCaseId, hashString } from "@/lib/utils/hashes";

// ─── Evidence Packet Factory ──────────────────────────────────────────────────

export interface CreateEvidencePacketArgs {
  caseId: string;
  submittedBy: string;
  evidenceType: EvidenceType;
  title: string;
  summary: string;
  fileHash?: string;
  storageUri?: string;
  sourceUrl?: string;
  relevanceTag?: string;
}

/**
 * Create a new evidence packet with a generated ID and timestamp.
 */
export function createEvidencePacket(
  args: CreateEvidencePacketArgs
): EvidencePacket {
  return {
    evidenceId: generateCaseId(),
    caseId: args.caseId,
    submittedBy: args.submittedBy,
    evidenceType: args.evidenceType,
    title: args.title,
    summary: args.summary,
    fileHash: args.fileHash,
    storageUri: args.storageUri,
    sourceUrl: args.sourceUrl,
    relevanceTag: args.relevanceTag,
    createdAt: Math.floor(Date.now() / 1000),
  };
}

// ─── Evidence Manifest Builder ────────────────────────────────────────────────

/**
 * Build an evidence manifest from a list of evidence packets.
 * The manifest hash is computed from the serialized evidence IDs.
 */
export async function buildEvidenceManifest(
  items: EvidencePacket[]
): Promise<EvidenceManifest> {
  if (items.length === 0) {
    throw new Error("Cannot build evidence manifest from empty evidence list");
  }

  const caseId = items[0].caseId;
  const allSameCaseId = items.every((item) => item.caseId === caseId);
  if (!allSameCaseId) {
    throw new Error("All evidence items must belong to the same case");
  }

  const manifestInput = items
    .map((e) => `${e.evidenceId}:${e.evidenceType}:${e.createdAt}`)
    .join("|");

  const manifestHash = await hashString(manifestInput);

  return {
    caseId,
    evidenceItems: items,
    manifestHash,
    createdAt: Math.floor(Date.now() / 1000),
  };
}

// ─── Evidence Type Labels ─────────────────────────────────────────────────────

const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  CONTRACT: "Contract / Agreement",
  MESSAGE: "Message / Communication",
  SCREENSHOT: "Screenshot",
  INVOICE: "Invoice / Receipt",
  DELIVERY_FILE: "Delivery File",
  PAYMENT_PROOF: "Payment Proof",
  TIMELINE: "Timeline",
  WITNESS_STATEMENT: "Witness Statement",
  OTHER: "Other",
};

/**
 * Returns a human-readable label for an evidence type.
 */
export function getEvidenceTypeLabel(type: EvidenceType): string {
  return EVIDENCE_TYPE_LABELS[type] ?? "Unknown";
}

// ─── Evidence Type Icons ──────────────────────────────────────────────────────

const EVIDENCE_TYPE_ICONS: Record<EvidenceType, string> = {
  CONTRACT: "📄",
  MESSAGE: "💬",
  SCREENSHOT: "🖼️",
  INVOICE: "🧾",
  DELIVERY_FILE: "📦",
  PAYMENT_PROOF: "💳",
  TIMELINE: "📅",
  WITNESS_STATEMENT: "🗣️",
  OTHER: "📎",
};

/**
 * Returns an emoji icon for an evidence type.
 */
export function getEvidenceTypeIcon(type: EvidenceType): string {
  return EVIDENCE_TYPE_ICONS[type] ?? "📎";
}
