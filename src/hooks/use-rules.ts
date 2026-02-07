"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { EmailRoutingRule } from "@/types/cloudflare";

// Module-level cache
let cachedRules: EmailRoutingRule[] | null = null;
let cachePromise: Promise<EmailRoutingRule[]> | null = null;

async function fetchRulesFromServer(): Promise<EmailRoutingRule[]> {
  if (cachedRules !== null) return cachedRules;
  if (cachePromise) return cachePromise;

  cachePromise = fetch("/api/cloudflare/rules")
    .then((res) => res.json())
    .then((data) => {
      cachedRules = data.result || [];
      cachePromise = null;
      return cachedRules!;
    })
    .catch(() => {
      cachePromise = null;
      return cachedRules ?? [];
    });

  return cachePromise;
}

export function invalidateRulesCache() {
  cachedRules = null;
  cachePromise = null;
}

export function useRules() {
  const [rules, setRulesState] = useState<EmailRoutingRule[]>(
    cachedRules ?? []
  );
  const [loading, setLoading] = useState(cachedRules === null);

  // Keep module cache in sync with local state
  const setRules = useCallback(
    (updater: EmailRoutingRule[] | ((prev: EmailRoutingRule[]) => EmailRoutingRule[])) => {
      setRulesState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        cachedRules = next;
        return next;
      });
    },
    []
  );

  const refresh = useCallback(async () => {
    invalidateRulesCache();
    setLoading(true);
    const result = await fetchRulesFromServer();
    setRulesState(result);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    fetchRulesFromServer()
      .then((result) => {
        setRulesState(result);
      })
      .finally(() => setLoading(false));
  }, []);

  const existingEmails = useMemo(
    () =>
      new Set(
        rules
          .map((r) => r.matchers[0]?.value)
          .filter((v): v is string => !!v)
      ),
    [rules]
  );

  return { rules, setRules, loading, refresh, existingEmails };
}
