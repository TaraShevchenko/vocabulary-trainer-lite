"use client";

import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

interface SessionStatsProps {
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
}

export function SessionStats({
  correctAnswers,
  incorrectAnswers,
  currentStreak,
}: SessionStatsProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        {correctAnswers}
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1">
        <XCircle className="h-3 w-3 text-red-600" />
        {incorrectAnswers}
      </Badge>
      {currentStreak > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-yellow-600" />
          {currentStreak} streak
        </Badge>
      )}
    </div>
  );
}
