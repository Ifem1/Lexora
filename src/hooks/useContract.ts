"use client";

import { useWalletClient } from "wagmi";
import { readContract, writeContract, waitForRuling } from "@/lib/genlayer/client";
import type { GenLayerWalletProvider } from "@/lib/genlayer/client";
import { mapCaseFromChain, mapRulingFromChain } from "@/lib/genlayer/arbitrationMapper";
import type {
  ArbitrationCase,
  ArbitrationRuling,
  ArbitrationFramework,
  Agreement,
  EscrowAccount,
  SettlementRecord,
  EvidencePacket,
} from "@/lib/genlayer/types";

// ─── Protocol Stats Type ──────────────────────────────────────────────────────

export type ProtocolStats = {
  totalCases: number;
  activeCase: number;
  rulingsIssued: number;
  appealsFiled: number;
  settledCases: number;
};

// ─── Case Summary (from get_party_cases_full) ─────────────────────────────────

export type CaseSummary = ArbitrationCase;

// ─── useContract ──────────────────────────────────────────────────────────────

/**
 * React hook that wraps all GenLayer contract interactions for the Lexora
 * arbitration dApp. Write methods require a connected wallet.
 */
export function useContract() {
  const { data: walletClient } = useWalletClient();

  const account = walletClient?.account?.address;
  const provider = walletClient as unknown as GenLayerWalletProvider;

  // ── helpers ──────────────────────────────────────────────────────────────

  function requireAccount(): `0x${string}` {
    if (!account) throw new Error("Wallet not connected");
    return account;
  }

  function parseJsonResult<T>(raw: unknown): T {
    if (typeof raw === "string") return JSON.parse(raw) as T;
    return raw as T;
  }

  // ── Read methods ──────────────────────────────────────────────────────────

  async function getAgreement(agreementId: string): Promise<Agreement | null> {
    try {
      const raw = await readContract("get_agreement", [agreementId]);
      return raw ? parseJsonResult<Agreement>(raw) : null;
    } catch (err) {
      console.error("[useContract] getAgreement failed:", err);
      return null;
    }
  }

  async function getEscrow(agreementId: string): Promise<EscrowAccount | null> {
    try {
      const raw = await readContract("get_escrow", [agreementId]);
      return raw ? parseJsonResult<EscrowAccount>(raw) : null;
    } catch (err) {
      console.error("[useContract] getEscrow failed:", err);
      return null;
    }
  }

  async function getSettlement(caseId: string): Promise<SettlementRecord | null> {
    try {
      const raw = await readContract("get_settlement", [caseId]);
      return raw ? parseJsonResult<SettlementRecord>(raw) : null;
    } catch (err) {
      console.error("[useContract] getSettlement failed:", err);
      return null;
    }
  }

  async function getCaseEvidence(caseId: string, appeal = false): Promise<EvidencePacket[]> {
    try {
      const raw = await readContract("get_case_evidence", [caseId, appeal]);
      const parsed = raw ? parseJsonResult<EvidencePacket[]>(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("[useContract] getCaseEvidence failed:", err);
      return [];
    }
  }

  async function getCase(caseId: string): Promise<ArbitrationCase | null> {
    try {
      const raw = await readContract("get_case", [caseId]);
      if (!raw) return null;
      return mapCaseFromChain(parseJsonResult<Record<string, unknown>>(raw));
    } catch (err) {
      console.error("[useContract] getCase failed:", err);
      return null;
    }
  }

  async function getRuling(rulingId: string): Promise<ArbitrationRuling | null> {
    try {
      const raw = await readContract("get_ruling", [rulingId]);
      if (!raw) return null;
      return mapRulingFromChain(parseJsonResult<Record<string, unknown>>(raw));
    } catch (err) {
      console.error("[useContract] getRuling failed:", err);
      return null;
    }
  }

  async function getPartyCases(address: string): Promise<string[]> {
    try {
      const raw = await readContract("get_party_cases", [address]);
      if (!raw) return [];
      const parsed = parseJsonResult<string[]>(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("[useContract] getPartyCases failed:", err);
      return [];
    }
  }

  async function getPartyCasesFull(address: string): Promise<CaseSummary[]> {
    try {
      const raw = await readContract("get_party_cases_full", [address]);
      if (!raw) return [];
      const parsed = parseJsonResult<unknown[]>(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) =>
        mapCaseFromChain(item as Record<string, unknown>)
      );
    } catch (err) {
      console.error("[useContract] getPartyCasesFull failed:", err);
      return [];
    }
  }

  async function getProtocolStats(): Promise<ProtocolStats> {
    try {
      const raw = await readContract("get_protocol_stats", []);
      if (!raw) return defaultStats();
      const parsed = parseJsonResult<Record<string, unknown>>(raw);
      return {
        totalCases: Number(parsed.total_cases ?? parsed.totalCases ?? 0),
        activeCase: Number(parsed.active_cases ?? parsed.activeCases ?? 0),
        rulingsIssued: Number(parsed.rulings_issued ?? parsed.rulingsIssued ?? 0),
        appealsFiled: Number(parsed.appeals_filed ?? parsed.appealsFiled ?? 0),
        settledCases: Number(parsed.settled_cases ?? parsed.settledCases ?? 0),
      };
    } catch (err) {
      console.error("[useContract] getProtocolStats failed:", err);
      return defaultStats();
    }
  }

  async function canRequestRuling(caseId: string): Promise<boolean> {
    try {
      const raw = await readContract("can_request_ruling", [caseId]);
      if (raw === null || raw === undefined) return false;
      if (typeof raw === "boolean") return raw;
      const parsed = parseJsonResult<boolean | { canRequest?: boolean; result?: boolean }>(raw);
      if (typeof parsed === "boolean") return parsed;
      if (typeof parsed === "object" && parsed !== null) {
        if ("canRequest" in parsed) return parsed.canRequest === true;
        if ("result" in parsed) return parsed.result === true;
      }
      return false;
    } catch (err) {
      console.error("[useContract] canRequestRuling failed:", err);
      return false;
    }
  }

  async function getAllFrameworks(): Promise<ArbitrationFramework[]> {
    try {
      const raw = await readContract("get_all_frameworks", []);
      if (!raw) return [];
      const parsed = parseJsonResult<unknown[]>(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as ArbitrationFramework[];
    } catch (err) {
      console.error("[useContract] getAllFrameworks failed:", err);
      return [];
    }
  }

  // ── Write methods ─────────────────────────────────────────────────────────

  async function proposeAgreement(params: {
    agreementId: string;
    counterparty: string;
    funder: string;
    frameworkId: string;
    frameworkVersion: string;
    title: string;
    descriptionCommitment: string;
    obligationCommitment: string;
    acceptanceCriteriaCommitment: string;
    evidenceRulesCommitment: string;
    permittedRemedies: string[];
    maximumExposure: bigint;
    requiredFunding: bigint;
    acceptanceWindowDays: number;
    performanceWindowDays: number;
    disputeWindowDays: number;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "propose_agreement", [
      params.agreementId,
      params.counterparty,
      params.funder,
      params.frameworkId,
      params.frameworkVersion,
      params.title,
      params.descriptionCommitment,
      params.obligationCommitment,
      params.acceptanceCriteriaCommitment,
      params.evidenceRulesCommitment,
      JSON.stringify(params.permittedRemedies),
      params.maximumExposure,
      params.requiredFunding,
      params.acceptanceWindowDays,
      params.performanceWindowDays,
      params.disputeWindowDays,
    ], provider);
  }

  async function acceptAgreement(
    agreementId: string,
    version: number,
    commitment: string
  ): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "accept_agreement", [agreementId, version, commitment], provider);
  }

  async function cancelAgreement(agreementId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "cancel_agreement", [agreementId], provider);
  }

  async function depositEscrow(
    agreementId: string,
    valueWei: bigint
  ): Promise<`0x${string}`> {
    if (valueWei <= BigInt(0)) throw new Error("Escrow funding value must be positive.");
    const addr = requireAccount();
    return writeContract(addr, "deposit_escrow", [agreementId], provider, valueWei);
  }

  async function openDispute(params: {
    agreementId: string;
    caseManifestHash: string;
    title: string;
    category: string;
    responseDeadlineDays?: number;
    confidential?: boolean;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "open_dispute", [
      params.agreementId,
      params.caseManifestHash,
      params.title,
      params.category,
      params.responseDeadlineDays ?? 7,
      params.confidential ?? false,
    ], provider);
  }

  async function createCase(): Promise<{ txHash: `0x${string}`; caseId?: string }> {
    throw new Error("Legacy case creation is disabled. Create and fund an agreement, then open a dispute.");
  }

  async function submitClaim(params: {
    caseId: string;
    claimStatement: string;
    evidenceRoot?: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    // Contract: submit_claim(case_id, claim_hash, evidence_root, claim_summary_hash)
    const claimHash = `0x${await crypto.subtle.digest("SHA-256", new TextEncoder().encode(params.claimStatement)).then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""))}`;
    return writeContract(addr, "submit_claim", [
      params.caseId,
      claimHash,
      params.evidenceRoot ?? "",
      claimHash,
    ], provider);
  }

  async function submitResponse(params: {
    caseId: string;
    responseStatement: string;
    evidenceRoot?: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    // Contract: submit_response(case_id, response_hash, evidence_root)
    const responseHash = `0x${await crypto.subtle.digest("SHA-256", new TextEncoder().encode(params.responseStatement)).then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""))}`;
    return writeContract(addr, "submit_response", [
      params.caseId,
      responseHash,
      params.evidenceRoot ?? "",
    ], provider);
  }

  async function submitEvidenceRecord(params: {
    caseId: string;
    evidenceClass: "CLAIMANT_EVIDENCE" | "RESPONDENT_EVIDENCE" | "COUNTER_EVIDENCE" | "AGREEMENT_NATIVE" | "PUBLIC_WEB";
    evidenceType: string;
    sourceUrl?: string;
    description: string;
    commitment: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "submit_evidence_record", [
      params.caseId,
      params.evidenceClass,
      params.evidenceType,
      params.sourceUrl ?? "",
      params.description,
      params.commitment,
    ], provider);
  }

  async function lockEvidence(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "lock_evidence", [caseId], provider);
  }

  async function submitEvidence(): Promise<`0x${string}`> {
    throw new Error("Replaceable evidence roots are disabled. Use submitEvidenceRecord.");
  }

  async function requestRuling(
    caseId: string,
    reviewPacket: string
  ): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "request_ruling", [caseId, reviewPacket], provider);
  }

  async function acceptRuling(
    _caseId?: string,
    _rulingId?: string
  ): Promise<`0x${string}`> {
    throw new Error("Direct ruling acceptance is disabled. Use appeal or wait for finalization.");
  }

  async function appealRuling(
    caseId: string,
    appealPacket: string
  ): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "appeal_ruling", [caseId, appealPacket], provider);
  }

  async function submitAppealEvidence(params: {
    caseId: string;
    evidenceType: string;
    sourceUrl?: string;
    description: string;
    commitment: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "submit_appeal_evidence", [
      params.caseId,
      params.evidenceType,
      params.sourceUrl ?? "",
      params.description,
      params.commitment,
    ], provider);
  }

  async function finalizeNoAppeal(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "finalize_no_appeal", [caseId], provider);
  }

  async function finalizeZeroAwardSettlement(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "finalize_zero_award_settlement", [caseId], provider);
  }

  async function executeClaimablePayout(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "execute_claimable_payout", [caseId], provider);
  }

  async function prepareFunderRefund(agreementId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "prepare_funder_refund", [agreementId], provider);
  }

  async function executeFunderRefund(agreementId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "execute_funder_refund", [agreementId], provider);
  }

  async function cancelCase(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "cancel_case", [caseId], provider);
  }

  async function markSettled(): Promise<`0x${string}`> {
    throw new Error("Manual settlement marking is disabled. Settlement follows final ruling accounting.");
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // write
    proposeAgreement,
    acceptAgreement,
    cancelAgreement,
    depositEscrow,
    openDispute,
    createCase,
    submitClaim,
    submitResponse,
    submitEvidence,
    submitEvidenceRecord,
    lockEvidence,
    requestRuling,
    acceptRuling,
    appealRuling,
    submitAppealEvidence,
    finalizeNoAppeal,
    finalizeZeroAwardSettlement,
    executeClaimablePayout,
    prepareFunderRefund,
    executeFunderRefund,
    cancelCase,
    markSettled,
    // read
    getAgreement,
    getEscrow,
    getSettlement,
    getCaseEvidence,
    getCase,
    getRuling,
    getPartyCases,
    getPartyCasesFull,
    getProtocolStats,
    canRequestRuling,
    getAllFrameworks,
    // util
    waitForRuling,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultStats(): ProtocolStats {
  return {
    totalCases: 0,
    activeCase: 0,
    rulingsIssued: 0,
    appealsFiled: 0,
    settledCases: 0,
  };
}
