'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/pipeline-manager', label: 'Manager', icon: '⚡' },
    { href: '/pipeline-details', label: 'Details', icon: '📋' },
    { href: '/batch-query', label: 'Query', icon: '🔍' },
    { href: '/batch-details', label: 'Batch', icon: '📦' },
    { href: '/batch-process', label: 'Process', icon: '⚙️' },
    { href: '/classification', label: 'Classify', icon: '✓' },
    { href: '/overview-download', label: 'Export', icon: '💾' },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
            <span className="hidden sm:inline text-gray-900">Pipeline UPP</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.icon}</span>
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 font-medium">
              Admin
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
