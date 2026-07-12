import type { EvidencePacket, EvidenceType } from "@/lib/genlayer/types";

type CaseDossier = { claimantStatement: string; respondentStatement: string; evidence: EvidencePacket[] };
const key = (caseId: string) => `lexora:case-dossier:${caseId}`;
const empty = (): CaseDossier => ({ claimantStatement: "", respondentStatement: "", evidence: [] });

export function loadCaseDossier(caseId: string): CaseDossier {
  if (typeof window === "undefined") return empty();
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(key(caseId)) ?? "{}") }; }
  catch { return empty(); }
}

function save(caseId: string, dossier: CaseDossier) {
  localStorage.setItem(key(caseId), JSON.stringify(dossier));
}

export function retainStatement(caseId: string, party: "claimant" | "respondent", statement: string) {
  save(caseId, { ...loadCaseDossier(caseId), [`${party}Statement`]: statement });
}

export function retainEvidence(caseId: string, submittedBy: string, data: { evidenceType: string; title: string; summary: string; fileHash?: string; storageUri?: string; sourceUrl?: string; relevanceTag?: string }) {
  const dossier = loadCaseDossier(caseId);
  const item: EvidencePacket = { evidenceId: crypto.randomUUID(), caseId, submittedBy, evidenceType: data.evidenceType as EvidenceType, title: data.title, summary: data.summary, fileHash: data.fileHash, storageUri: data.storageUri, sourceUrl: data.sourceUrl, relevanceTag: data.relevanceTag, createdAt: Math.floor(Date.now() / 1000) };
  save(caseId, { ...dossier, evidence: [...dossier.evidence, item] });
}
