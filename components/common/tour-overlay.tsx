'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, BarChart3, Sliders, Table2, Settings, Zap, Lightbulb } from 'lucide-react';
import type { TourStep } from '@/hooks/useTour';

interface TourOverlayProps {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSkip: () => void;
  onNeverShow: () => void;
  totalSteps: number;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 10;
const GAP = 16;
const TOOLTIP_W = 340;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'BarChart3': BarChart3,
  'Sliders': Sliders,
  'Table2': Table2,
  'Settings': Settings,
  'Zap': Zap,
  'Lightbulb': Lightbulb,
};

export function TourOverlay({
  isActive,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose,
  onSkip,
  onNeverShow,
  totalSteps,
}: TourOverlayProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [ready, setReady] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the current step so the async callbacks read the latest value
  const stepRef = useRef<TourStep | null>(null);

  const step = steps[currentStep] ?? null;

  function placeTooltip(r: DOMRect, position: TourStep['position']) {
    const tooltipH = tooltipRef.current?.offsetHeight ?? 160;
    let top = 0;
    let left = 0;

    switch (position) {
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

    left = Math.max(16, Math.min(left, window.innerWidth - TOOLTIP_W - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipH - 16));
    setTooltipPos({ top, left });
  }

  function measureAndPosition(s: TourStep) {
    const el = document.querySelector(s.selector);
    if (!el) {
      // Element not in DOM — show centered tooltip anyway
      const tooltipH = tooltipRef.current?.offsetHeight ?? 160;
      setTargetRect(null);
      setTooltipPos({
        top: Math.max(16, (window.innerHeight - tooltipH) / 2),
        left: Math.max(16, (window.innerWidth - TOOLTIP_W) / 2),
      });
      setReady(true);
      return;
    }

    // Scroll element into view synchronously (instant bypasses the global smooth-scroll CSS)
    el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center', inline: 'nearest' });

    // Two rAF passes: first ensures scroll position applied, second ensures paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Check we're still on the same step (user might have clicked Next quickly)
        if (stepRef.current?.id !== s.id) return;

        const r = el.getBoundingClientRect();
        const isVisible =
          r.bottom > 0 &&
          r.top < window.innerHeight &&
          r.right > 0 &&
          r.left < window.innerWidth &&
          r.width > 0 &&
          r.height > 0;

        if (isVisible) {
          setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          placeTooltip(r, s.position);
          setReady(true);
        } else {
          // Not visible yet — retry once more after 200ms
          if (retryRef.current) clearTimeout(retryRef.current);
          retryRef.current = setTimeout(() => {
            if (stepRef.current?.id !== s.id) return;
            const r2 = el.getBoundingClientRect();
            setTargetRect({ top: r2.top, left: r2.left, width: r2.width, height: r2.height });
            placeTooltip(r2, s.position);
            setReady(true);
          }, 250);
        }
      });
    });
  }

  // Trigger measurement when step changes or tour activates
  useEffect(() => {
    if (!isActive || !step) {
      setTargetRect(null);
      setReady(false);
      return;
    }

    stepRef.current = step;
    setReady(false);
    setTargetRect(null);

    // Small leading delay so React has finished painting the new step state
    const leadTimer = setTimeout(() => {
      if (stepRef.current?.id === step.id) measureAndPosition(step);
    }, 50);

    return () => {
      clearTimeout(leadTimer);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep]);

  // Recalculate on window resize
  useEffect(() => {
    if (!isActive || !step) return;
    const onResize = () => {
      if (step) measureAndPosition(step);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep]);

  // Esc closes the tour (only here — page.tsx also handles Esc, but keep both for resilience)
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isActive, onClose]);

  if (!isActive || !step) return null;

  return (
    <>
      {/* ── Dark overlay: 4 rects leaving a spotlight on the target ── */}
      {ready && targetRect ? (
        <>
          {/* Top stripe */}
          <div
            className="fixed inset-x-0 top-0 z-40 pointer-events-auto"
            style={{ height: Math.max(0, targetRect.top - PAD), background: 'rgba(0,0,0,0.75)' }}
            onClick={onClose}
          />
          {/* Bottom stripe */}
          <div
            className="fixed inset-x-0 bottom-0 z-40 pointer-events-auto"
            style={{ top: targetRect.top + targetRect.height + PAD, background: 'rgba(0,0,0,0.75)' }}
            onClick={onClose}
          />
          {/* Left stripe */}
          <div
            className="fixed left-0 z-40 pointer-events-auto"
            style={{
              top: targetRect.top - PAD,
              width: Math.max(0, targetRect.left - PAD),
              height: targetRect.height + PAD * 2,
              background: 'rgba(0,0,0,0.75)',
            }}
            onClick={onClose}
          />
          {/* Right stripe */}
          <div
            className="fixed right-0 z-40 pointer-events-auto"
            style={{
              top: targetRect.top - PAD,
              left: targetRect.left + targetRect.width + PAD,
              height: targetRect.height + PAD * 2,
              background: 'rgba(0,0,0,0.75)',
            }}
            onClick={onClose}
          />
          {/* Blue spotlight ring with pulsing animation */}
          <div
            className="fixed pointer-events-none rounded-lg z-[41]"
            style={{
              top: targetRect.top - PAD,
              left: targetRect.left - PAD,
              width: targetRect.width + PAD * 2,
              height: targetRect.height + PAD * 2,
              outline: '2px solid #3b82f6',
              outlineOffset: '2px',
              boxShadow: '0 0 0 4px rgba(59,130,246,0.25)',
              animation: 'pulse-spotlight 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          {/* Animated step badge */}
          <div
            className="fixed pointer-events-none z-[42] flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold shadow-lg"
            style={{
              top: targetRect.top - 28,
              right: targetRect.left + targetRect.width - 40,
              animation: 'bounce-badge 2s ease-in-out infinite',
            }}
          >
            {currentStep + 1}
          </div>
          <style>{`
            @keyframes pulse-spotlight {
              0%, 100% { box-shadow: 0 0 0 4px rgba(59,130,246,0.25); }
              50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.15); }
            }
            @keyframes bounce-badge {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
        </>
      ) : ready ? (
        /* No targetRect — full-screen overlay (element off-screen or not found) */
        <div
          className="fixed inset-0 z-40 pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={onClose}
        />
      ) : null}

      {/* ── Tooltip card ── */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: ready ? tooltipPos.top : -9999,
          left: ready ? tooltipPos.left : -9999,
          width: TOOLTIP_W,
        }}
        className="z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 pointer-events-auto"
      >
        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i < currentStep ? 'bg-emerald-500' : i === currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Header with icon */}
        <div className="flex items-start gap-3 mb-3">
          {step.icon && ICON_MAP[step.icon] && (
            React.createElement(ICON_MAP[step.icon], {
              className: 'w-5 h-5 text-blue-600 shrink-0 mt-0.5',
            })
          )}
          <div className="flex-1 pr-2">
            <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Passo {currentStep + 1} de {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{step.description}</p>

        {/* Call to action */}
        {step.callToAction && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-blue-700 font-medium">{step.callToAction}</p>
          </div>
        )}

        {/* Pro tip */}
        {step.proTip && (
          <div className="flex gap-2 mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">{step.proTip}</p>
          </div>
        )}

        {/* Next step hint */}
        {step.nextStep && (
          <div className="text-xs text-gray-500 italic mb-4 pl-3 border-l-2 border-gray-300">
            {step.nextStep}
          </div>
        )}

        {/* Nav footer */}
        <div className="flex flex-col gap-3">
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
              className="flex-1 flex items-center justify-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              {currentStep === totalSteps - 1 ? 'Concluir' : 'Seguir'}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onSkip}
              className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Pular tour"
            >
              Pular
            </button>
          </div>
          <button
            onClick={onNeverShow}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 border-t border-gray-100 pt-3 transition"
          >
            Nunca mostrar novamente
          </button>
        </div>
      </div>
    </>
  );
}
