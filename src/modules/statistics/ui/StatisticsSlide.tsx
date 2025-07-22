"use client";

import type { SlideData } from "../types/statistics";

interface StatisticsSlideProps {
  slide: SlideData;
  isActive: boolean;
}

export function StatisticsSlide({ slide, isActive }: StatisticsSlideProps) {
  const getGradientClass = (slideType: SlideData["type"]) => {
    switch (slideType) {
      case "global":
        return "from-blue-600 to-purple-700";
      case "streak":
        return "from-orange-500 to-red-600";
      case "today":
        return "from-green-500 to-emerald-600";
      default:
        return "from-blue-600 to-purple-700";
    }
  };

  return (
    <div
      className={`
        w-full h-full min-h-[144px] md:min-h-[192px] bg-gradient-to-br ${getGradientClass(slide.type)} 
        text-white border-none shadow-lg rounded-xl p-2 md:p-4
        transition-opacity duration-300
        ${isActive ? "opacity-100" : "opacity-70"}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="text-xs md:text-sm text-white/80">{slide.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 text-center flex-1">
          <div className="flex flex-col items-center justify-center">
            <div className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-1 md:mb-2">
              {slide.wordsAdded.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm lg:text-lg text-white/90">
              Words Added
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-1 md:mb-2">
              {slide.wordsLearned.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm lg:text-lg text-white/90">
              Words Learned
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-1 md:mb-2">
              {slide.wordsInReview.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm lg:text-lg text-white/90">
              Words Repeated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
