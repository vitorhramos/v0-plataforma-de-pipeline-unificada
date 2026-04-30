import { useState, useEffect } from 'react';

export interface TourStep {
  id: string;
  selector: string; // CSS selector do elemento
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export function useTour(steps: TourStep[]) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  // Restaurar se ja viu o tour
  useEffect(() => {
    const seen = localStorage.getItem('tour-seen-pipeline');
    setHasSeenTour(!!seen);
  }, []);

  const startTour = () => {
    setIsTourActive(true);
    setCurrentStep(0);
    localStorage.setItem('tour-seen-pipeline', 'true');
  };

  const closeTour = () => {
    setIsTourActive(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      scrollToElement();
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollToElement();
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      scrollToElement();
    }
  };

  const scrollToElement = () => {
    setTimeout(() => {
      const selector = steps[currentStep]?.selector;
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  };

  const getCurrentStep = () => steps[currentStep];

  return {
    isTourActive,
    currentStep,
    hasSeenTour,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    getCurrentStep,
    totalSteps: steps.length,
  };
}
