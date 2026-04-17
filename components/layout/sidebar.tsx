'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, BarChart3, ArrowRightLeft, ListFilter, Search, Edit, Cog } from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Analise',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
      { href: '/pipeline-manager', label: 'Manager', icon: ArrowRightLeft },
      { href: '/pipeline-details', label: 'Details', icon: ListFilter },
      { href: '/batch-query', label: 'Query', icon: Search },
    ],
  },
  {
    label: 'Operacoes',
    items: [
      { href: '/quote-details', label: 'Edit', icon: Edit },
      { href: '/batch-process', label: 'Process', icon: Cog },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } bg-gray-950 text-white transition-all duration-300 flex flex-col border-r border-gray-800/60 h-screen sticky top-0 shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-gray-800/60 h-14 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">U</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">Pipeline UPP</p>
              <p className="text-[10px] text-gray-500 leading-tight">TD SYNNEX</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {collapsed ? (
          // Collapsed: just icons, no group labels
          NAV_GROUPS.flatMap(g => g.items).map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })
        ) : (
          NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-sm ${
                        active
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800/60 p-3">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition"
            title="Expandir sidebar"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 shrink-0">
              TD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">TD SYNNEX</p>
              <p className="text-[10px] text-gray-600 truncate">Pipeline UPP v2.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
