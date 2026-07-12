import assert from "node:assert/strict";
import test from "node:test";
import { buildReviewPacket, serializeReviewPacket } from "./reviewPacketBuilder.ts";

test("complete ruling packet carries statements, retained evidence, and commitments", () => {
  const caseData = { caseId: "CASE-1", category: "services", frameworkId: "services", status: "RESPONSE_WINDOW", claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: "0xevidence" } as never;
  const framework = { frameworkId: "services" } as never;
  const evidence = [{ caseId: "CASE-1", evidenceId: "EV-1", title: "Invoice", sourceUrl: "https://example.com/invoice" }] as never;
  const packet = buildReviewPacket(caseData, framework, "The claimant's complete statement", "The respondent's complete statement", evidence);
  const decoded = JSON.parse(serializeReviewPacket(packet));

  assert.equal(decoded.caseId, "CASE-1");
  assert.equal(decoded.claimantStatement, "The claimant's complete statement");
  assert.equal(decoded.respondentStatement, "The respondent's complete statement");
  assert.deepEqual(decoded.evidence, evidence);
  assert.equal(decoded.evidence[0].sourceUrl, "https://example.com/invoice");
  assert.deepEqual({ claimHash: decoded.proceduralState.claimHash, responseHash: decoded.proceduralState.responseHash, evidenceRoot: decoded.proceduralState.evidenceRoot }, { claimHash: "0xclaim", responseHash: "0xresponse", evidenceRoot: "0xevidence" });
});
