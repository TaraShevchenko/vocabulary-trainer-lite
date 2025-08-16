"use client";

import { useState, useCallback } from "react";
import type { SliderState } from "../types/statistics-silder.types";

interface UseSliderProps {
  totalSlides: number;
  hasActiveStreak: boolean;
}

export function useSlider({ totalSlides, hasActiveStreak }: UseSliderProps) {
  const getInitialSlide = (hasStreak: boolean) => {
    return hasStreak ? 1 : 2; // 1=streak, 2=today
  };

  const [sliderState, setSliderState] = useState<SliderState>({
    currentSlide: getInitialSlide(hasActiveStreak),
    isTransitioning: false,
    direction: "right",
  });

  const nextSlide = useCallback(() => {
    if (sliderState.isTransitioning) return;

    setSliderState((prev) => ({
      ...prev,
      isTransitioning: true,
      direction: "right",
    }));

    setTimeout(() => {
      setSliderState((prev) => ({
        currentSlide: (prev.currentSlide + 1) % totalSlides,
        isTransitioning: false,
        direction: "right",
      }));
    }, 150);
  }, [sliderState.isTransitioning, totalSlides]);

  const prevSlide = useCallback(() => {
    if (sliderState.isTransitioning) return;

    setSliderState((prev) => ({
      ...prev,
      isTransitioning: true,
      direction: "left",
    }));

    setTimeout(() => {
      setSliderState((prev) => ({
        currentSlide: (prev.currentSlide - 1 + totalSlides) % totalSlides,
        isTransitioning: false,
        direction: "left",
      }));
    }, 150);
  }, [sliderState.isTransitioning, totalSlides]);

  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (
        sliderState.isTransitioning ||
        slideIndex === sliderState.currentSlide
      )
        return;

      const direction =
        slideIndex > sliderState.currentSlide ? "right" : "left";

      setSliderState((prev) => ({
        ...prev,
        isTransitioning: true,
        direction,
      }));

      setTimeout(() => {
        setSliderState({
          currentSlide: slideIndex,
          isTransitioning: false,
          direction,
        });
      }, 150);
    },
    [sliderState.isTransitioning, sliderState.currentSlide],
  );

  return {
    currentSlide: sliderState.currentSlide,
    isTransitioning: sliderState.isTransitioning,
    direction: sliderState.direction,
    nextSlide,
    prevSlide,
    goToSlide,
  };
}
