import { useEffect, useRef, useState } from "react";

type FetchState<T> =
  | {
      loading: true;
      error: false;
      data: null;
    }
  | {
      loading: false;
      error: true;
      data: null;
    }
  | {
      loading: false;
      error: false;
      data: T;
    };

export const usePromiseFn = <T>(
  promiseFn: () => Promise<T>,
  predicate: boolean = true,
) => {
  const [fetchState, setFetchState] = useState<FetchState<T>>({
    loading: true,
    error: false,
    data: null,
  });

  const promiseFnRef = useRef(promiseFn);

  useEffect(() => {
    if (!predicate) return;

    (async () => {
      try {
        const result = await promiseFnRef.current();
        setFetchState({ loading: false, error: false, data: result });
        // eslint-disable-next-line
      } catch (_) {
        setFetchState({ loading: false, error: true, data: null });
      }
    })();
  }, [predicate]);

  return fetchState;
};
