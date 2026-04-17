'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();

  const pathNames: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/pipeline-details': 'Pipeline Details',
    '/pipeline-manager': 'Pipeline Manager',
    '/batch-query': 'Batch Query',
    '/batch-details': 'Quote Details',
    '/batch-process': 'Batch Process',
  };

  const label = pathNames[pathname] || 'Home';

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <Link href="/" className="hover:text-gray-900">
        Home
      </Link>
      <span className="text-gray-400">/</span>
      <span className="text-gray-900 font-medium">{label}</span>
    </div>
  );
}
