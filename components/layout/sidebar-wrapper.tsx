'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { useSidebarFeatures } from '@/hooks/useSidebarFeatures';

export function SidebarWrapper() {
  const { handleFeatureAction } = useSidebarFeatures();
  
  return <Sidebar onFeatureAction={handleFeatureAction} />;
}
