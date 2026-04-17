'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export function SearchCmdK() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { filteredQuotes } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.length === 0) {
      setResults([]);
      return;
    }

    const filtered = filteredQuotes
      .filter(q => 
        q.cpo_id.toLowerCase().includes(value.toLowerCase()) ||
        q.master_customer_name.toLowerCase().includes(value.toLowerCase()) ||
        q.end_user_company.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);

    setResults(filtered);
  }, [filteredQuotes]);

  const handleSelect = (quote: any) => {
    router.push(`/quote-details?id=${quote.id}`);
    setOpen(false);
    setQuery('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs px-2 py-1 bg-gray-200 rounded">Cmd+K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            placeholder="Search quotes by CPO ID, customer..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {query && (
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">No quotes found</div>
            ) : (
              <div>
                {results.map(quote => (
                  <button
                    key={quote.id}
                    onClick={() => handleSelect(quote)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b transition"
                  >
                    <div className="font-medium text-sm">{quote.cpo_id}</div>
                    <div className="text-xs text-gray-500">{quote.master_customer_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
