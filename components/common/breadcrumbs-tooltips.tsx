'use client';

import { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <a href="/" className="hover:text-blue-600 transition">Home</a>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-gray-400">/</span>
          {item.href ? (
            <a href={item.href} className="hover:text-blue-600 transition">{item.label}</a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${positionClasses[position]} bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50`}>
        {content}
      </div>
    </div>
  );
}
