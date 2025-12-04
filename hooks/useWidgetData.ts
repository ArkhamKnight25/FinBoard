import { useEffect, useState, useRef } from "react";
import { FinanceRequestPayload } from "@/lib/finance/types";

interface WidgetDataState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseWidgetDataConfig extends FinanceRequestPayload {
  refreshIntervalMs?: number;
  enabled?: boolean;
}

export function useWidgetData<T = any>(config: UseWidgetDataConfig) {
  const [state, setState] = useState<WidgetDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { refreshIntervalMs = 60000, enabled = true, ...payload } = config;

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        if (!payload.provider || !payload.endpoint) {
          return;
        }

        if (isMounted) {
          setState((s) => ({ ...s, loading: true, error: null }));
        }

        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          const msg =
            json?.message ||
            `Request failed with status ${res.status} (${res.statusText})`;
          throw new Error(msg);
        }

        const json = await res.json();
        if (!isMounted) return;

        setState({
          data: json.data as T,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (!isMounted) return;
        setState({
          data: null,
          loading: false,
          error: err?.message || "Unknown error",
        });
      }
    }

    // Initial load
    fetchData();

    // Set up polling
    const interval = Math.max(refreshIntervalMs, 5000); // Minimum 5 seconds
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    enabled,
    payload.provider,
    payload.endpoint,
    payload.symbol,
    payload.symbols?.join(","),
    payload.interval,
    payload.customUrl,
    refreshIntervalMs,
  ]);

  return state;
}
