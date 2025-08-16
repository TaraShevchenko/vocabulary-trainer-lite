export interface GlobalStatistics {
  wordsAdded: number;
  wordsLearned: number;
  wordsInReview: number;
}

export interface StreakStatistics {
  wordsAdded: number;
  wordsLearned: number;
  wordsInReview: number;
  streakDays: number;
  hasActiveStreak: boolean;
  completedToday?: boolean;
  lastActivityDate?: Date | string | null;
  week?: { date: Date | string; hasActivity: boolean; isToday: boolean }[];
}

export interface TodayStatistics {
  wordsAdded: number;
  wordsLearned: number;
  wordsInReview: number;
}

export interface StatisticsData {
  global: GlobalStatistics;
  streak: StreakStatistics;
  today: TodayStatistics;
}

export interface SliderState {
  currentSlide: number; // 0, 1, 2
  isTransitioning: boolean;
  direction: "left" | "right";
}

export type SlideType = "global" | "streak" | "today";

export interface SlideData {
  type: SlideType;
  title: string;
  subtitle?: string;
  wordsAdded: number;
  wordsLearned: number;
  wordsInReview: number;
}
