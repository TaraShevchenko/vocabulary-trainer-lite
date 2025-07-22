"use client";

import { useMemo } from "react";
import { api } from "@/shared/api/client";
import type { StatisticsData, SlideData } from "../types/statistics";

export function useStatistics() {
  const {
    data: globalStats,
    isLoading: globalLoading,
    error: globalError,
  } = api.statistics.getOverall.useQuery();

  const {
    data: todayStats,
    isLoading: todayLoading,
    error: todayError,
  } = api.statistics.getToday.useQuery();

  const {
    data: streakStats,
    isLoading: streakLoading,
    error: streakError,
  } = api.statistics.getStreak.useQuery();

  const isLoading = globalLoading || todayLoading || streakLoading;
  const error = globalError || todayError || streakError;

  const statisticsData = useMemo<StatisticsData | null>(() => {
    if (!globalStats || !todayStats || !streakStats) return null;

    return {
      global: {
        wordsAdded: globalStats.wordsAdded,
        wordsLearned: globalStats.wordsLearned,
        wordsInReview: globalStats.wordsInReview,
      },
      streak: {
        wordsAdded: streakStats.wordsAdded,
        wordsLearned: streakStats.wordsLearned,
        wordsInReview: streakStats.wordsInReview,
        streakDays: streakStats.streakDays,
        hasActiveStreak: streakStats.hasActiveStreak,
      },
      today: {
        wordsAdded: todayStats.wordsAdded,
        wordsLearned: todayStats.wordsLearned,
        wordsInReview: todayStats.wordsInReview,
      },
    };
  }, [globalStats, todayStats, streakStats]);

  const slides = useMemo<SlideData[]>(() => {
    if (!statisticsData) return [];

    return [
      {
        type: "global",
        title: "Global Statistics",
        subtitle: "All time progress",
        wordsAdded: statisticsData.global.wordsAdded,
        wordsLearned: statisticsData.global.wordsLearned,
        wordsInReview: statisticsData.global.wordsInReview,
      },
      {
        type: "streak",
        title: "Streak Statistics",
        subtitle: statisticsData.streak.hasActiveStreak
          ? `${statisticsData.streak.streakDays} days streak`
          : "No active streak",
        wordsAdded: statisticsData.streak.hasActiveStreak
          ? statisticsData.streak.wordsAdded
          : 0,
        wordsLearned: statisticsData.streak.hasActiveStreak
          ? statisticsData.streak.wordsLearned
          : 0,
        wordsInReview: statisticsData.streak.hasActiveStreak
          ? statisticsData.streak.wordsInReview
          : 0,
      },
      {
        type: "today",
        title: "Today's Progress",
        subtitle: "Your daily achievements",
        wordsAdded: statisticsData.today.wordsAdded,
        wordsLearned: statisticsData.today.wordsLearned,
        wordsInReview: statisticsData.today.wordsInReview,
      },
    ];
  }, [statisticsData]);

  return {
    statisticsData,
    slides,
    hasActiveStreak: statisticsData?.streak.hasActiveStreak ?? false,
    isLoading,
    error,
  };
}
