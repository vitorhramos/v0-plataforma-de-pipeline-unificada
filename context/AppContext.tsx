'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Quote, BatchFilter } from '@/types';
import { dataService } from '@/lib/data-service-v2';

interface ActionHistory {
  id: string;
  timestamp: Date;
  type: 'UPDATE' | 'DELETE' | 'CREATE' | 'BATCH_UPDATE';
  description: string;
  changes: number; // count of affected quotes
}

interface AppContextType {
  // Data
  quotes: Quote[];
  filteredQuotes: Quote[];
  filters: BatchFilter;
  
  // Filter actions
  setFilters: (filters: BatchFilter) => void;
  clearFilters: () => void;
  
  // Quote actions
  updateQuote: (id: number, updates: Partial<Quote>) => void;
  batchUpdateQuotes: (ids: number[], updates: Partial<Quote>) => void;
  
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  
  // Notifications
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }[];
  addNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
  
  // History
  history: ActionHistory[];
  
  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Data density
  dataCompactMode: boolean;
  toggleCompactMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState(() => dataService.getAllQuotes());
  const [filteredQuotes, setFilteredQuotes] = useState(quotes);
  const [filters, setFilters] = useState<BatchFilter>({});
  const [notifications, setNotifications] = useState<AppContextType['notifications']>([]);
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [dataCompactMode, setDataCompactMode] = useState(false);
  const [undoStack, setUndoStack] = useState<Quote[][]>([]);
  const [redoStack, setRedoStack] = useState<Quote[][]>([]);

  // Persist dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Persist compact mode preference
  useEffect(() => {
    const savedCompactMode = localStorage.getItem('compactMode') === 'true';
    setDataCompactMode(savedCompactMode);
  }, []);

  const handleSetFilters = (newFilters: BatchFilter) => {
    setFilters(newFilters);
    setFilteredQuotes(dataService.filterQuotes(newFilters));
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilteredQuotes(quotes);
  };

  const handleUpdateQuote = (id: number, updates: Partial<Quote>) => {
    // Save current state for undo
    setUndoStack(prev => [...prev, quotes]);
    setRedoStack([]);
    
    dataService.updateQuote(id, updates);
    const updatedQuotes = [...quotes];
    setQuotes(updatedQuotes);
    setFilteredQuotes(dataService.filterQuotes(filters));
    
    // Add to history
    setHistory(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'UPDATE',
      description: `Updated quote #${id}`,
      changes: 1,
    }, ...prev.slice(0, 49)]); // Keep last 50 actions
    
    addNotification('Quote updated successfully', 'success');
  };

  const handleBatchUpdateQuotes = (ids: number[], updates: Partial<Quote>) => {
    if (ids.length === 0) return;
    
    // Save current state for undo
    setUndoStack(prev => [...prev, quotes]);
    setRedoStack([]);
    
    ids.forEach(id => dataService.updateQuote(id, updates));
    setQuotes([...quotes]);
    setFilteredQuotes(dataService.filterQuotes(filters));
    
    // Add to history
    setHistory(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'BATCH_UPDATE',
      description: `Updated ${ids.length} quotes`,
      changes: ids.length,
    }, ...prev.slice(0, 49)]);
    
    addNotification(`Successfully updated ${ids.length} quotes`, 'success');
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, quotes]);
    setQuotes(previousState);
    setFilteredQuotes(dataService.filterQuotes(filters));
    setUndoStack(prev => prev.slice(0, -1));
    
    addNotification('Action undone', 'info');
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, quotes]);
    setQuotes(nextState);
    setFilteredQuotes(dataService.filterQuotes(filters));
    setRedoStack(prev => prev.slice(0, -1));
    
    addNotification('Action redone', 'info');
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleCompactMode = () => {
    const newCompactMode = !dataCompactMode;
    setDataCompactMode(newCompactMode);
    localStorage.setItem('compactMode', newCompactMode.toString());
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
        batchUpdateQuotes: handleBatchUpdateQuotes,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
        notifications,
        addNotification,
        removeNotification,
        history,
        darkMode,
        toggleDarkMode,
        dataCompactMode,
        toggleCompactMode,
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
