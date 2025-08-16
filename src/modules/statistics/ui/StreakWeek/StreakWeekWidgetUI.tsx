"use client";

import { cn } from "@/shared/utils/cn";
import type {
  WeekDayItem,
  StreakTone,
  StreakVariant,
} from "../../types/streak-week.types";
import { StreakWeekDays } from "./StreakWeekDays";
import { StreakWeekWidgetTitle } from "./StreakWeekWidgetTitle";

export function StreakWeekWidgetUI(props: {
  streakDays: number;
  week: WeekDayItem[];
  variant: StreakVariant;
}) {
  const { streakDays, week, variant } = props;

  const toneToGradient: Record<StreakTone, string> = {
    success: "from-emerald-500 to-green-600",
    warning: "from-amber-500 to-orange-600",
    info: "from-blue-600 to-indigo-600",
    celebration: "from-fuchsia-500 to-purple-700",
  } as const;

  return (
    <div
      className={cn(
        "w-full rounded-xl text-white p-4 shadow-lg bg-gradient-to-br",
        toneToGradient[variant.tone],
      )}
    >
      <StreakWeekWidgetTitle streakDays={streakDays} variant={variant} />
      <StreakWeekDays week={week} />
    </div>
  );
}
