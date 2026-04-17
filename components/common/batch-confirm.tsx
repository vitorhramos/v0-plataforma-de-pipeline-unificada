'use client';

import { useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';

interface BatchConfirmProps {
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BatchOperationConfirm({ itemCount, onConfirm, onCancel }: BatchConfirmProps) {
  const shouldShowWarning = itemCount >= 15;

  if (!shouldShowWarning) {
    onConfirm();
    return null;
  }

  return (
    <ConfirmDialog
      open={shouldShowWarning}
      title="Confirm Batch Operation"
      description={`You are about to modify ${itemCount} records. This action cannot be easily undone. Are you sure you want to proceed?`}
      confirmText={`Proceed with ${itemCount} updates`}
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isDestructive={true}
    />
  );
}
