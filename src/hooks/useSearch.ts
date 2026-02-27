import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useProductStore } from '@/store';
import type { DrugProduct } from '@/types';

const DEBOUNCE_MS = 300;

export function useSearch() {
  const products = useProductStore((s) => s.products);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query === '') {
      setDebouncedQuery('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  const results: DrugProduct[] = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const needle = debouncedQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.ndc.toLowerCase().includes(needle) ||
        p.manufacturer.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle),
    );
  }, [products, debouncedQuery]);

  const handleSetQuery = useCallback((value: string) => {
    setQuery(value);
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    results,
    isSearching,
  };
}
