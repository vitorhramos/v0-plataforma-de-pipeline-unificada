'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Quote, BatchFilter } from '@/types';
import { dataService } from '@/lib/data-service-v2';

interface AppContextType {
  quotes: Quote[];
  filteredQuotes: Quote[];
  filters: BatchFilter;
  setFilters: (filters: BatchFilter) => void;
  clearFilters: () => void;
  updateQuote: (id: number, updates: Partial<Quote>) => void;
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [quotes] = useState(() => dataService.getAllQuotes());
  const [filters, setFilters] = useState<BatchFilter>({});
  const [notifications, setNotifications] = useState<AppContextType['notifications']>([]);
  const [filteredQuotes, setFilteredQuotes] = useState(quotes);

  const handleSetFilters = (newFilters: BatchFilter) => {
    setFilters(newFilters);
    setFilteredQuotes(dataService.filterQuotes(newFilters));
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilteredQuotes(quotes);
  };

  const handleUpdateQuote = (id: number, updates: Partial<Quote>) => {
    dataService.updateQuote(id, updates);
    setFilteredQuotes([...filteredQuotes]);
    addNotification('Quote updated successfully', 'success');
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        quotes,
        filteredQuotes,
        filters,
        setFilters: handleSetFilters,
        clearFilters: handleClearFilters,
        updateQuote: handleUpdateQuote,
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
