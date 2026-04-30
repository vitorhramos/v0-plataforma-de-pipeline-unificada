import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { TourStep } from '@/hooks/useTour';

interface TourOverlayProps {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  totalSteps: number;
}

export function TourOverlay({
  isActive,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose,
  totalSteps,
}: TourOverlayProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step) return;

    const updatePosition = () => {
      const element = document.querySelector(step.selector);
      if (!element) {
        console.warn(`Elemento para step "${step.id}" nao encontrado`);
        return;
      }

      const rect = element.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      const gap = 16;
      let top = 0;
      let left = 0;

      const tooltipRect = tooltip.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width || 320;
      const tooltipHeight = tooltipRect.height || 120;

      switch (step.position) {
        case 'top':
          top = rect.top + window.scrollY - tooltipHeight - gap;
          left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + window.scrollY + gap;
          left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          left = rect.left + window.scrollX - tooltipWidth - gap;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + window.scrollX + gap;
          break;
      }

      // Ensure tooltip stays in viewport
      if (left < 16) left = 16;
      if (left + tooltipWidth > window.innerWidth - 16)
        left = window.innerWidth - tooltipWidth - 16;

      setPosition({ top, left });
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, step, currentStep]);

  if (!isActive || !step) return null;

  const targetElement = document.querySelector(step.selector);
  const rect = targetElement?.getBoundingClientRect();

  return (
    <>
      {/* Overlay escuro com recorte transparente */}
      <div className="fixed inset-0 z-40 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
        boxShadow: rect ? `inset 0 0 0 9999px rgba(0, 0, 0, 0.6)` : 'none',
      }}>
        {rect && (
          <div
            style={{
              position: 'fixed',
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
            }}
            className="pointer-events-auto cursor-auto"
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        className="z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
          <button
            onClick={onClose}
            className="p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">{step.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-400">
            {currentStep + 1} de {totalSteps}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              {currentStep === totalSteps - 1 ? 'Concluir' : 'Seguir'}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
