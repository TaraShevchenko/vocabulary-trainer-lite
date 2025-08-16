import type { StreakVariant } from "../types/streak-week.types";

export function useStreakVariant(params: {
  streakDays: number;
  completedToday?: boolean;
  hours?: number;
}): StreakVariant {
  const { streakDays, completedToday, hours = new Date().getHours() } = params;
  const milestones = new Set([5, 10, 15, 20, 30, 50, 100]);

  if (milestones.has(streakDays)) {
    return {
      title: `Milestone reached: ${streakDays}-day streak!`,
      subtitle: "Fantastic run. Keep the momentum going today!",
      tone: "celebration",
    };
  }

  if (!completedToday) {
    if (hours < 11) {
      return {
        title: "Early bird wins the streak",
        subtitle: "Do a quick lesson now and stay ahead.",
        tone: "info",
      };
    }
    if (hours < 17) {
      return {
        title: "Let's do some exercises",
        subtitle: "Take a short session to keep your streak alive.",
        tone: "success",
      };
    }
    return {
      title: "Oh no! You are so close to losing the streak",
      subtitle:
        "Are you sure that you want to start from scratch? One small lesson is enough to secure today.",
      tone: "warning",
    };
  }

  return {
    title: `On fire: ${streakDays}-day streak`,
    subtitle: "Great job today. Keep it up!",
    tone: "success",
  };
}
