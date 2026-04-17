'use client';

interface OperationRecord {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  user?: string;
  status: 'success' | 'error' | 'pending';
}

class OperationHistory {
  private records: OperationRecord[] = [];
  private maxRecords = 100;
  private listeners: ((records: OperationRecord[]) => void)[] = [];

  addRecord(action: string, description: string, status: 'success' | 'error' | 'pending' = 'success') {
    const record: OperationRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      description,
      status,
    };

    this.records.unshift(record);
    if (this.records.length > this.maxRecords) {
      this.records.pop();
    }

    this.notifyListeners();
  }

  getRecords() {
    return [...this.records];
  }

  subscribe(listener: (records: OperationRecord[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.getRecords()));
  }

  clear() {
    this.records = [];
    this.notifyListeners();
  }
}

export const operationHistory = new OperationHistory();

export function useOperationHistory() {
  return {
    add: (action: string, description: string, status?: 'success' | 'error' | 'pending') => {
      operationHistory.addRecord(action, description, status);
    },
    getRecords: () => operationHistory.getRecords(),
    subscribe: (listener: (records: OperationRecord[]) => void) => operationHistory.subscribe(listener),
  };
}
