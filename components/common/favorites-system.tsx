'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function FavoritesSystem() {
  const { quotes, addNotification } = useAppContext();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('favorite-quotes');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (quoteId: number) => {
    setFavorites(prev => {
      const updated = prev.includes(quoteId)
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId];
      localStorage.setItem('favorite-quotes', JSON.stringify(updated));
      addNotification(prev.includes(quoteId) ? 'Removido de favoritos' : 'Adicionado a favoritos', 'success');
      return updated;
    });
  };

  const favoriteQuotes = quotes.filter(q => favorites.includes(q.id));

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-100 transition-all"
      >
        ⭐ Favoritos ({favorites.length})
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minhas Cotações Favoritas</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {favoriteQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum favorito salvo</p>
            ) : (
              favoriteQuotes.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{q.quote_name}</p>
                    <p className="text-sm text-gray-600">${(q.cif_value_usd / 1000).toFixed(0)}K</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(q.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    ⭐
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
