import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useSidebarFeatures() {
  const pathname = usePathname();

  const handleFeatureAction = useCallback((action: string) => {
    switch (action) {
      case 'filters':
        // Dispatch evento global para abrir filtros
        window.dispatchEvent(new CustomEvent('sidebar-feature-action', { detail: { action: 'filters' } }));
        break;
      case 'tour':
        // Dispatch evento global para iniciar tour
        window.dispatchEvent(new CustomEvent('sidebar-feature-action', { detail: { action: 'tour' } }));
        break;
      case 'view-list':
        window.dispatchEvent(new CustomEvent('sidebar-feature-action', { detail: { action: 'view-list' } }));
        break;
      case 'view-cards':
        window.dispatchEvent(new CustomEvent('sidebar-feature-action', { detail: { action: 'view-cards' } }));
        break;
      case 'view-kanban':
        window.dispatchEvent(new CustomEvent('sidebar-feature-action', { detail: { action: 'view-kanban' } }));
        break;
      case 'export':
        window.dispatchEvent(new CustomEvent('sidebar-feature-action', { detail: { action: 'export' } }));
        break;
      default:
        console.log('[useSidebarFeatures] Unknown action:', action);
    }
  }, [pathname]);

  return { handleFeatureAction };
}
