'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, BarChart3, ArrowRightLeft, ListFilter, Moon, Sun, List, Grid3x3, Kanban, Download, HelpCircle } from 'lucide-react';

const PAGES = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/pipeline-manager', label: 'Manager', icon: ArrowRightLeft },
  { href: '/pipeline-details', label: 'Details', icon: ListFilter },
];

// Funcionalidades disponíveis por página
const FEATURES_BY_PAGE: Record<string, { label: string; icon: React.ComponentType<any>; action: string }[]> = {
  '/dashboard': [
    { label: 'Tour', icon: HelpCircle, action: 'tour' },
  ],
  '/pipeline-manager': [
    { label: 'Gráficos', icon: BarChart3, action: 'view-charts' },
    { label: 'Tabela', icon: List, action: 'view-list' },
    { label: 'Exportar', icon: Download, action: 'export' },
    { label: 'Tour', icon: HelpCircle, action: 'tour' },
  ],
  '/pipeline-details': [
    { label: 'Lista', icon: List, action: 'view-list' },
    { label: 'Cards', icon: Grid3x3, action: 'view-cards' },
    { label: 'Kanban', icon: Kanban, action: 'view-kanban' },
    { label: 'Exportar', icon: Download, action: 'export' },
    { label: 'Tour', icon: HelpCircle, action: 'tour' },
  ],
};

// Quais features são desabilitadas por página
const DISABLED_FEATURES: Record<string, string[]> = {
  '/dashboard': ['view-list', 'view-cards', 'view-kanban', 'export'],
  '/pipeline-manager': ['view-cards', 'view-kanban'],
  '/pipeline-details': [],
};

export function Sidebar({ onFeatureAction }: { onFeatureAction?: (action: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'true' : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('darkMode', String(newVal));
    document.documentElement.classList.toggle('dark', newVal);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);
  const currentFeatures = FEATURES_BY_PAGE[pathname] || [];
  const disabledFeatures = DISABLED_FEATURES[pathname] || [];

  const handleFeatureClick = (action: string, disabled: boolean) => {
    if (!disabled && onFeatureAction) {
      onFeatureAction(action);
    }
  };

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
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {/* NAVEGAÇÃO - Páginas */}
        <div>
          {!collapsed && (
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">
              Navegação
            </p>
          )}
          <div className="space-y-0.5">
            {PAGES.map(page => {
              const Icon = page.icon;
              const active = isActive(page.href);
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  title={page.label}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg transition text-sm ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{page.label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* FUNCIONALIDADES - Contextuais */}
        {currentFeatures.length > 0 && (
          <div>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">
                Funcionalidades
              </p>
            )}
            <div className="space-y-0.5">
              {currentFeatures.map(feature => {
                const Icon = feature.icon;
                const isDisabled = disabledFeatures.includes(feature.action);
                return (
                  <button
                    key={feature.action}
                    onClick={() => handleFeatureClick(feature.action, isDisabled)}
                    disabled={isDisabled}
                    title={feature.label + (isDisabled ? ' (desabilitado nesta página)' : '')}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} w-full px-3 py-2.5 rounded-lg transition text-sm ${
                      isDisabled
                        ? 'text-gray-600 cursor-not-allowed opacity-40'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate text-left">{feature.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800/60 p-3 space-y-2">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition ${
            collapsed ? 'justify-center' : ''
          } text-gray-400 hover:bg-gray-800 hover:text-gray-200`}
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>

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
