export type StreakTone = "success" | "warning" | "info" | "celebration";

export interface StreakVariant {
  title: string;
  subtitle: string;
  tone: StreakTone;
}

export interface WeekDayItem {
  hasActivity: boolean;
  isToday?: boolean;
}
