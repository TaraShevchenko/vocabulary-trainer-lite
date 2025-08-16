"use client";

import { api } from "@/shared/api/client";
import { Skeleton } from "@/shared/ui/skeleton";
import { useStreakVariant } from "../../hooks/useStreakVariant";
import { StreakWeekWidgetUI } from "./StreakWeekWidgetUI";

export function StreakWeekWidget() {
  const { data, isLoading, error } = api.statistics.getStreak.useQuery();

  if (isLoading) return <Skeleton className="h-40 md:h-48 w-full rounded-xl" />;
  if (error || !data) return null;

  const variant = useStreakVariant({
    streakDays: data.streakDays,
    completedToday: data.completedToday,
  });

  return (
    <StreakWeekWidgetUI
      streakDays={data.streakDays}
      week={data.week}
      variant={variant}
    />
  );
}
