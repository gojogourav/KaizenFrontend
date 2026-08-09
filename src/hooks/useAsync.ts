import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
}

/**
 * Wraps an async fetcher with loading/error/data state, request cancellation
 * on unmount, and a stable refetch() for manual reloads.
 */
export function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {},
) {
  const { immediate = true } = options;
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetcher(controller.signal);
      if (!controller.signal.aborted) {
        setState({ data, loading: false, error: null });
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setState({ data: null, loading: false, error: err?.message || 'Something went wrong.' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  return { ...state, refetch: run, setData };
}
