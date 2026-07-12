import type { EvidencePacket } from "./types.ts";
import { hashString } from "../utils/hashes.ts";

const framed = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `${new TextEncoder().encode(text).length}:${text}`;
};

const EVIDENCE_FIELDS: Array<keyof EvidencePacket> = [
  "evidenceId", "caseId", "submittedBy", "evidenceType", "title", "summary",
  "fileHash", "storageUri", "sourceUrl", "relevanceTag", "createdAt",
];

export function canonicalEvidence(evidence: EvidencePacket[]): string {
  return [...evidence]
    .sort((a, b) => a.evidenceId.localeCompare(b.evidenceId))
    .map((item) => EVIDENCE_FIELDS.map((field) => framed(item[field])).join(""))
    .map(framed)
    .join("");
}

export async function evidenceCommitment(evidence: EvidencePacket[]): Promise<`0x${string}`> {
  return `0x${await hashString(canonicalEvidence(evidence))}`;
}

export async function rulingPacketCommitment(values: {
  caseId: string; frameworkId: string; claimantStatement: string;
  respondentStatement: string; evidenceCommitment: string; claimHash: string;
  responseHash?: string | null; evidenceRoot?: string | null;
}): Promise<`0x${string}`> {
  const input = [values.caseId, values.frameworkId, values.claimantStatement,
    values.respondentStatement, values.evidenceCommitment, values.claimHash,
    values.responseHash, values.evidenceRoot].map(framed).join("");
  return `0x${await hashString(input)}`;
}
