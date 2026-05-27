import { useEffect, useState } from 'react';

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;                    // Lucide icon name (e.g. 'BarChart3', 'Sliders')
  nextStep?: string;               // "Próximo passo: ..." text
  proTip?: string;                 // "Pro tip: ..." hint
  callToAction?: string;           // "Clique em ... para ..." example
  theme?: 'light' | 'dark';        // Tour theme preference
  interactive?: boolean;           // If true, user must interact with element
  onInteractionComplete?: () => void; // Called when user interacts on interactive steps
}

export function useTour(steps: TourStep[], tourKey: string = 'default-tour') {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  // Load completion state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`tour-completed-${tourKey}`);
    const neverShow = localStorage.getItem(`tour-never-${tourKey}`);
    if (saved) {
      try {
        setCompletedTours(JSON.parse(saved));
      } catch {}
    }
    if (neverShow === 'true') {
      setNeverShowAgain(true);
    }
  }, [tourKey]);

  const startTour = () => {
    if (neverShowAgain) return;
    setCurrentStep(0);
    setIsTourActive(true);
  };

  const autoStartTour = () => {
    // Auto-start only if user hasn't completed this tour yet and hasn't set "never show again"
    const hasCompleted = localStorage.getItem(`tour-completed-${tourKey}`) === 'true';
    const neverShow = localStorage.getItem(`tour-never-${tourKey}`) === 'true';
    if (!hasCompleted && !neverShow) {
      startTour();
    }
  };

  const closeTour = () => {
    setIsTourActive(false);
  };

  const skipTour = () => {
    closeTour();
    setCurrentStep(0);
  };

  const completeTour = () => {
    localStorage.setItem(`tour-completed-${tourKey}`, 'true');
    closeTour();
    setCurrentStep(0);
  };

  const neverShowThisTourAgain = () => {
    localStorage.setItem(`tour-never-${tourKey}`, 'true');
    setNeverShowAgain(true);
    skipTour();
  };

  const nextStep = () => {
    const step = steps[currentStep];
    if (step?.onInteractionComplete) {
      step.onInteractionComplete();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resumeTour = () => {
    // Resume from last step (stored in memory)
    setIsTourActive(true);
  };

  return {
    isTourActive,
    currentStep,
    startTour,
    autoStartTour,
    closeTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    neverShowThisTourAgain,
    resumeTour,
    totalSteps: steps.length,
    neverShowAgain,
    completedTours,
  };
}
