"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { useSlider } from "../../hooks/useSlider";
import { useStatistics } from "../../hooks/useStatistics";
import { SliderNavigation } from "./SliderNavigation";
import { StatisticsSlide } from "./StatisticsSlide";

export function StatisticsSlider() {
  const { slides, hasActiveStreak, isLoading, error } = useStatistics();
  const { currentSlide, isTransitioning, nextSlide, prevSlide, goToSlide } =
    useSlider({
      totalSlides: slides.length,
      hasActiveStreak,
    });

  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX || 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX || 0;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const deltaX = touchStartX.current - touchEndX.current;

    if (Math.abs(deltaX) > swipeThreshold && !isTransitioning) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (isLoading) {
    return <Skeleton className="h-36 md:h-56 w-full rounded-xl" />;
  }

  if (error || slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-40 md:h-56 overflow-hidden"
      role="region"
      aria-label="Statistics slider"
    >
      <div
        ref={sliderRef}
        className={cn(
          "relative h-full w-full",
          isTransitioning && "pointer-events-none",
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.type}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
            )}
            aria-hidden={index !== currentSlide}
          >
            <StatisticsSlide slide={slide} isActive={index === currentSlide} />
          </div>
        ))}
      </div>

      <SliderNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onGoToSlide={goToSlide}
        isTransitioning={isTransitioning}
      />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {slides[currentSlide] &&
          `Slide ${currentSlide + 1} of ${slides.length}: ${slides[currentSlide]?.title}`}
      </div>
    </div>
  );
}
