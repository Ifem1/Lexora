"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useContract } from "@/hooks/useContract";
import type { CaseSummary } from "@/hooks/useContract";

/**
 * Hook that loads all cases for the connected wallet address.
 * Automatically refreshes when the wallet address changes.
 */
export function useCases() {
  const { address } = useAccount();
  const { getPartyCasesFull } = useContract();

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    if (!address) {
      setCases([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getPartyCasesFull(address);
      setCases(result);
    } catch (err) {
      console.error("[useCases] Failed to load cases:", err);
      setError("Failed to load cases from the contract.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void Promise.resolve().then(loadCases);
  }, [loadCases]);

  return { cases, loading, error, refresh: loadCases };
}
