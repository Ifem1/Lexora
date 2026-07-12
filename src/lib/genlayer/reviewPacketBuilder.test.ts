import assert from "node:assert/strict";
import test from "node:test";
import { buildReviewPacket, serializeReviewPacket } from "./reviewPacketBuilder.ts";
import { evidenceCommitment, rulingPacketCommitment } from "./packetCommitments.ts";

test("complete ruling packet carries and cryptographically binds statements, evidence, and commitments", async () => {
  const framework = { frameworkId: "services" } as never;
  const evidence = [{ caseId: "CASE-1", evidenceId: "EV-1", submittedBy: "0xclaimant", evidenceType: "INVOICE", title: "Invoice", summary: "Paid invoice", sourceUrl: "https://example.com/invoice", createdAt: 1 }] as never;
  const root = await evidenceCommitment(evidence);
  const caseData = { caseId: "CASE-1", category: "services", frameworkId: "services", status: "RESPONSE_WINDOW", claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: root } as never;
  const packet = await buildReviewPacket(caseData, framework, "The claimant's complete statement", "The respondent's complete statement", evidence);
  const decoded = JSON.parse(serializeReviewPacket(packet));

  assert.equal(decoded.caseId, "CASE-1");
  assert.equal(decoded.claimantStatement, "The claimant's complete statement");
  assert.equal(decoded.respondentStatement, "The respondent's complete statement");
  assert.deepEqual(decoded.evidence, evidence);
  assert.equal(decoded.evidence[0].sourceUrl, "https://example.com/invoice");
  assert.equal(decoded.evidenceCommitment, root);
  assert.deepEqual({ claimHash: decoded.proceduralState.claimHash, responseHash: decoded.proceduralState.responseHash, evidenceRoot: decoded.proceduralState.evidenceRoot }, { claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: root });
  assert.equal(decoded.packetCommitment, await rulingPacketCommitment({ caseId: "CASE-1", frameworkId: "services", claimantStatement: decoded.claimantStatement, respondentStatement: decoded.respondentStatement, evidenceCommitment: root, claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: root }));
});

test("tampering with retained evidence changes both evidence and packet commitments", async () => {
  const original = [{ caseId: "CASE-1", evidenceId: "EV-1", submittedBy: "0xclaimant", evidenceType: "OTHER", title: "Receipt", summary: "Original", createdAt: 1 }] as never;
  const tampered = [{ ...(original[0] as object), summary: "Tampered" }] as never;
  const originalRoot = await evidenceCommitment(original);
  const tamperedRoot = await evidenceCommitment(tampered);
  assert.notEqual(tamperedRoot, originalRoot);
  assert.notEqual(
    await rulingPacketCommitment({ caseId: "CASE-1", frameworkId: "services", claimantStatement: "claim", respondentStatement: "response", evidenceCommitment: originalRoot, claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: originalRoot }),
    await rulingPacketCommitment({ caseId: "CASE-1", frameworkId: "services", claimantStatement: "claim", respondentStatement: "response", evidenceCommitment: tamperedRoot, claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: originalRoot }),
  );
});
