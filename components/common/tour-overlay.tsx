'use client';

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

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
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
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const step = steps[currentStep];
  const PAD = 8;
  const GAP = 16;
  const TOOLTIP_W = 320;

  useEffect(() => {
    if (!isActive || !step) return;

    const update = () => {
      const el = document.querySelector(step.selector);
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll to settle before measuring
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });

        const tooltipH = tooltipRef.current?.offsetHeight ?? 150;
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = r.bottom + GAP;
            left = r.left + r.width / 2 - TOOLTIP_W / 2;
            break;
          case 'top':
            top = r.top - tooltipH - GAP;
            left = r.left + r.width / 2 - TOOLTIP_W / 2;
            break;
          case 'left':
            top = r.top + r.height / 2 - tooltipH / 2;
            left = r.left - TOOLTIP_W - GAP;
            break;
          case 'right':
            top = r.top + r.height / 2 - tooltipH / 2;
            left = r.right + GAP;
            break;
        }

        // Clamp to viewport
        left = Math.max(16, Math.min(left, window.innerWidth - TOOLTIP_W - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipH - 16));

        setTooltipPos({ top, left });
      }, 300);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isActive, step, currentStep]);

  if (!isActive || !step) return null;

  return (
    <>
      {/* Dark overlay using 4 rects around the highlighted element — no clip-path needed */}
      {targetRect ? (
        <>
          {/* Top */}
          <div
            className="fixed z-40 bg-black/70 pointer-events-auto"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, targetRect.top - PAD) }}
            onClick={onClose}
          />
          {/* Bottom */}
          <div
            className="fixed z-40 bg-black/70 pointer-events-auto"
            style={{ top: targetRect.top + targetRect.height + PAD, left: 0, right: 0, bottom: 0 }}
            onClick={onClose}
          />
          {/* Left */}
          <div
            className="fixed z-40 bg-black/70 pointer-events-auto"
            style={{
              top: targetRect.top - PAD,
              left: 0,
              width: Math.max(0, targetRect.left - PAD),
              height: targetRect.height + PAD * 2,
            }}
            onClick={onClose}
          />
          {/* Right */}
          <div
            className="fixed z-40 bg-black/70 pointer-events-auto"
            style={{
              top: targetRect.top - PAD,
              left: targetRect.left + targetRect.width + PAD,
              right: 0,
              height: targetRect.height + PAD * 2,
            }}
            onClick={onClose}
          />
          {/* Highlight ring around element */}
          <div
            className="fixed z-40 rounded-xl pointer-events-none"
            style={{
              top: targetRect.top - PAD,
              left: targetRect.left - PAD,
              width: targetRect.width + PAD * 2,
              height: targetRect.height + PAD * 2,
              boxShadow: '0 0 0 3px #3b82f6, 0 0 0 6px rgba(59,130,246,0.3)',
              transition: 'all 0.3s ease',
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-40 bg-black/70 pointer-events-auto" onClick={onClose} />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_W,
          transition: 'top 0.3s ease, left 0.3s ease',
        }}
        className="z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 pointer-events-auto"
      >
        {/* Step indicator dots */}
        <div className="flex items-center gap-1 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 pr-4">{step.title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4">{step.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-400">
            {currentStep + 1} de {totalSteps}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
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
