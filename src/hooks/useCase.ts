"use client";

import { useState, useEffect, useCallback } from "react";
import { useContract } from "@/hooks/useContract";
import type { ArbitrationCase, ArbitrationRuling } from "@/lib/genlayer/types";

/**
 * Hook that loads a single case and its ruling (if any) by caseId.
 */
export function useCase(caseId: string) {
  const { getCase, getRuling, canRequestRuling } = useContract();

  const [caseData, setCaseData] = useState<ArbitrationCase | null>(null);
  const [ruling, setRuling] = useState<ArbitrationRuling | null>(null);
  const [canRule, setCanRule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCase = useCallback(async () => {
    if (!caseId) return;

    setLoading(true);
    setError(null);

    try {
      const [fetchedCase, fetchedCanRule] = await Promise.all([
        getCase(caseId),
        canRequestRuling(caseId),
      ]);

      setCaseData(fetchedCase);
      setCanRule(fetchedCanRule);

      if (fetchedCase?.rulingId) {
        const fetchedRuling = await getRuling(fetchedCase.rulingId);
        setRuling(fetchedRuling);
      } else {
        setRuling(null);
      }
    } catch (err) {
      console.error("[useCase] Failed to load case:", err);
      setError("Failed to load case data from the contract.");
    } finally {
      setLoading(false);
    }
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  return { caseData, ruling, canRule, loading, error, refresh: loadCase };
}
