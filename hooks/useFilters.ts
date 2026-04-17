import { BatchFilter } from '@/types';
import { dataService } from '@/lib/data-service-v2';
import { useCallback } from 'react';

export function useFilters(initialFilters?: BatchFilter) {
  const applyFilters = useCallback((filters: BatchFilter) => {
    return dataService.filterQuotes(filters);
  }, []);

  return { applyFilters };
}
