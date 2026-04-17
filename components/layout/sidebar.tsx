'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, BarChart3, ArrowRightLeft, ListFilter, Search, Edit, Cog, Moon, Sun } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useAppContext();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/pipeline-manager', label: 'Manager', icon: ArrowRightLeft },
    { href: '/pipeline-details', label: 'Details', icon: ListFilter },
    { href: '/batch-query', label: 'Query', icon: Search },
    { href: '/quote-details', label: 'Edit', icon: Edit },
    { href: '/batch-process', label: 'Process', icon: Cog },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800 h-screen sticky top-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">U</div>
          {!collapsed && <span className="font-bold text-lg">Pipeline UPP</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-800 rounded transition"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition border-l-4 ${
                active
                  ? 'bg-gray-800 border-l-blue-500 text-blue-400'
                  : 'border-l-transparent text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">{darkMode ? 'Light' : 'Dark'}</span>}
        </button>
      </div>
    </aside>
  );
}
