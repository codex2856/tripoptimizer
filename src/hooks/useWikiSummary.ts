import { useEffect, useState } from 'react';
import { fetchWikiSummary, type WikiSummary } from '../lib/wiki';

export function useWikiSummary(title: string): WikiSummary & { loading: boolean } {
  const [summary, setSummary] = useState<WikiSummary>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWikiSummary(title).then((res) => {
      if (!cancelled) {
        setSummary(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [title]);

  return { ...summary, loading };
}
