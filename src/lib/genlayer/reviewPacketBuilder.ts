import type {
  ArbitrationCase,
  ArbitrationFramework,
  EvidencePacket,
  ReviewPacket,
} from "@/lib/genlayer/types";
import { evidenceCommitment, rulingPacketCommitment } from "./packetCommitments.ts";

/**
 * Build a ReviewPacket to be submitted to the GenLayer AI arbitrator contract.
 *
 * The packet is a structured snapshot of the case at the point of requesting a ruling.
 * It includes the framework rules, both parties' statements, and all evidence.
 */
export async function buildReviewPacket(
  caseData: ArbitrationCase,
  framework: ArbitrationFramework,
  claimantStatement: string,
  respondentStatement: string,
  evidence: EvidencePacket[],
  proceduralState: Record<string, unknown> = {}
): Promise<ReviewPacket> {
  // Validate required fields
  if (!caseData.caseId) {
    throw new Error("buildReviewPacket: caseData must have a caseId");
  }
  if (!framework.frameworkId) {
    throw new Error("buildReviewPacket: framework must have a frameworkId");
  }
  if (!claimantStatement || claimantStatement.trim().length < 10) {
    throw new Error(
      "buildReviewPacket: claimantStatement must be at least 10 characters"
    );
  }

  // Build procedural context with defaults
  const enrichedProceduralState: Record<string, unknown> = {
    submittedAt: Math.floor(Date.now() / 1000),
    caseStatus: caseData.status,
    hasRespondentStatement: Boolean(respondentStatement?.trim()),
    evidenceCount: evidence.length,
    claimHash: caseData.claimHash,
    responseHash: caseData.responseHash ?? null,
    evidenceRoot: caseData.evidenceRoot ?? null,
    ...proceduralState,
  };

  const retainedEvidence = evidence.filter((e) => e.caseId === caseData.caseId);
  const committedEvidence = await evidenceCommitment(retainedEvidence);
  if (committedEvidence !== caseData.evidenceRoot) {
    throw new Error("buildReviewPacket: retained evidence does not match the on-chain evidence root");
  }
  const packetCommitment = await rulingPacketCommitment({ caseId: caseData.caseId,
    frameworkId: framework.frameworkId, claimantStatement: claimantStatement.trim(),
    respondentStatement: respondentStatement?.trim() ?? "", evidenceCommitment: committedEvidence,
    claimHash: caseData.claimHash, responseHash: caseData.responseHash, evidenceRoot: caseData.evidenceRoot });

  return {
    caseId: caseData.caseId,
    category: caseData.category,
    framework,
    claimantStatement: claimantStatement.trim(),
    respondentStatement: respondentStatement?.trim() ?? "",
    evidence: retainedEvidence,
    evidenceCommitment: committedEvidence,
    packetCommitment,
    proceduralState: enrichedProceduralState,
  };
}

/**
 * Serialise a ReviewPacket to a JSON string for on-chain submission.
 */
export function serializeReviewPacket(packet: ReviewPacket): string {
  return JSON.stringify(packet, null, 0);
}
