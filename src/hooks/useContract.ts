"use client";

import { useWalletClient } from "wagmi";
import { readContract, writeContract, waitForRuling } from "@/lib/genlayer/client";
import { mapCaseFromChain, mapRulingFromChain } from "@/lib/genlayer/arbitrationMapper";
import type {
  ArbitrationCase,
  ArbitrationRuling,
  ArbitrationFramework,
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
      const parsed = parseJsonResult<boolean | { result: boolean }>(raw);
      if (typeof parsed === "boolean") return parsed;
      if (typeof parsed === "object" && parsed !== null && "result" in parsed)
        return Boolean((parsed as { result: boolean }).result);
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

  async function createCase(params: {
    title: string;
    category: string;
    respondent: string;
    frameworkId: string;
    claimSummary: string;
    requestedRemedy: string;
    responseDeadlineDays?: number;
  }): Promise<{ txHash: `0x${string}`; caseId?: string }> {
    const addr = requireAccount();
    // Contract signature: create_case(framework_id, case_manifest_hash, title, category, party_b, response_deadline_days, confidential)
    const manifestHash = `0x${Array.from(
      new TextEncoder().encode(params.title + params.claimSummary)
    ).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 64)}`;

    const txHash = await writeContract(addr, "create_case", [
      params.frameworkId,
      manifestHash,
      params.title,
      params.category,
      params.respondent,
      params.responseDeadlineDays ?? 7,
      false,
    ]);
    return { txHash };
  }

  async function submitClaim(params: {
    caseId: string;
    claimStatement: string;
    evidenceRoot?: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    // Contract: submit_claim(case_id, claim_hash, evidence_root, claim_summary_hash)
    const claimHash = `0x${Array.from(new TextEncoder().encode(params.claimStatement))
      .map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 64)}`;
    return writeContract(addr, "submit_claim", [
      params.caseId,
      claimHash,
      params.evidenceRoot ?? "",
      claimHash,
    ]);
  }

  async function submitResponse(params: {
    caseId: string;
    responseStatement: string;
    evidenceRoot?: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    // Contract: submit_response(case_id, response_hash, evidence_root)
    const responseHash = `0x${Array.from(new TextEncoder().encode(params.responseStatement))
      .map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 64)}`;
    return writeContract(addr, "submit_response", [
      params.caseId,
      responseHash,
      params.evidenceRoot ?? "",
    ]);
  }

  async function submitEvidence(params: {
    caseId: string;
    evidenceManifestHash: string;
    evidenceRoot: string;
  }): Promise<`0x${string}`> {
    const addr = requireAccount();
    // Contract: submit_evidence(case_id, evidence_manifest_hash, evidence_root)
    return writeContract(addr, "submit_evidence", [
      params.caseId,
      params.evidenceManifestHash,
      params.evidenceRoot,
    ]);
  }

  async function requestRuling(
    caseId: string,
    reviewPacket: string
  ): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "request_ruling", [caseId, reviewPacket]);
  }

  async function acceptRuling(
    caseId: string,
    rulingId: string
  ): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "accept_ruling", [caseId, rulingId]);
  }

  async function appealRuling(
    caseId: string,
    appealPacket: string
  ): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "appeal_ruling", [caseId, appealPacket]);
  }

  async function cancelCase(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "cancel_case", [caseId]);
  }

  async function markSettled(caseId: string): Promise<`0x${string}`> {
    const addr = requireAccount();
    return writeContract(addr, "mark_settled", [caseId]);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // write
    createCase,
    submitClaim,
    submitResponse,
    submitEvidence,
    requestRuling,
    acceptRuling,
    appealRuling,
    cancelCase,
    markSettled,
    // read
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
