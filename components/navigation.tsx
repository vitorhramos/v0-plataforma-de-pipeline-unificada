'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TD</span>
              </div>
              <span className="font-bold text-gray-900">Pipeline UPP</span>
            </Link>

            <div className="hidden md:flex gap-1">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Button>
              </Link>
              <Link href="/pipeline-details">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Detalhes
                </Button>
              </Link>
              <Link href="/pipeline-manager">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Gerenciador
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>

          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/pipeline-details">
              <Button variant="ghost" className="w-full justify-start">
                Detalhes
              </Button>
            </Link>
            <Link href="/pipeline-manager">
              <Button variant="ghost" className="w-full justify-start">
                Gerenciador
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
