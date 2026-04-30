import { useState } from 'react';

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export function useTour(steps: TourStep[]) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = () => {
    setCurrentStep(0);
    setIsTourActive(true);
  };

  const closeTour = () => {
    setIsTourActive(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return {
    isTourActive,
    currentStep,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    totalSteps: steps.length,
  };
}
