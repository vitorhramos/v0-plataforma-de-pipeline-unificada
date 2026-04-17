'use client';

import React from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = React.useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const updateState = (newState: T) => {
    setState(prev => ({
      past: [...prev.past, prev.present],
      present: newState,
      future: [],
    }));
  };

  const undo = () => {
    setState(prev => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const redo = () => {
    setState(prev => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  };

  return {
    state: state.present,
    setState: updateState,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
