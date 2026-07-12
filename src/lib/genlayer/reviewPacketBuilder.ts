import type {
  ArbitrationCase,
  ArbitrationFramework,
  EvidencePacket,
  ReviewPacket,
} from "@/lib/genlayer/types";

/**
 * Build a ReviewPacket to be submitted to the GenLayer AI arbitrator contract.
 *
 * The packet is a structured snapshot of the case at the point of requesting a ruling.
 * It includes the framework rules, both parties' statements, and all evidence.
 */
export function buildReviewPacket(
  caseData: ArbitrationCase,
  framework: ArbitrationFramework,
  claimantStatement: string,
  respondentStatement: string,
  evidence: EvidencePacket[],
  proceduralState: Record<string, unknown> = {}
): ReviewPacket {
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

  return {
    caseId: caseData.caseId,
    category: caseData.category,
    framework,
    claimantStatement: claimantStatement.trim(),
    respondentStatement: respondentStatement?.trim() ?? "",
    evidence: retainedEvidence,
    proceduralState: enrichedProceduralState,
  };
}

/**
 * Serialise a ReviewPacket to a JSON string for on-chain submission.
 */
export function serializeReviewPacket(packet: ReviewPacket): string {
  return JSON.stringify(packet, null, 0);
}
