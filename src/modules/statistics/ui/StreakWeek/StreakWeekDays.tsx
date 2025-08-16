"use client";

import { cn } from "@/shared/utils/cn";
import type { WeekDayItem } from "../../types/streak-week.types";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function StreakWeekDays(props: { week: WeekDayItem[] }) {
  const { week } = props;

  return (
    <div className="mt-4 grid grid-cols-7 gap-2">
      {dayLabels.map((label, i) => {
        const d = week[i];
        const isDone = Boolean(d?.hasActivity);
        const isToday = Boolean(d?.isToday);
        return (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border border-white/20",
                isDone ? "bg-white text-black" : "bg-white/20 text-white",
                isToday && "ring-2 ring-white/90",
              )}
              aria-label={`${label} ${isDone ? "completed" : "missed"}`}
            >
              {isDone ? "✓" : "•"}
            </div>
            <div className="text-[10px] uppercase tracking-wide opacity-90">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
