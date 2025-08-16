"use client";

import { cn } from "@/shared/utils/cn";
import type { StreakVariant } from "../../types/streak-week.types";

export function StreakWeekWidgetTitle(props: {
  streakDays: number;
  variant: StreakVariant;
  className?: string;
}) {
  const { className, streakDays, variant } = props;

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="flex-1">
        <div className="text-lg md:text-xl font-bold">{variant.title}</div>
        <div className="text-sm md:text-base text-white/85">
          {variant.subtitle}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-2xl md:text-3xl font-extrabold">{streakDays}</div>
        <div className="text-xs md:text-sm opacity-90">day streak</div>
      </div>
    </div>
  );
}
