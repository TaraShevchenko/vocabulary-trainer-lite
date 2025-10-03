"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface SessionCompleteProps {
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  bestStreak: number;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export function SessionComplete({
  correctAnswers,
  incorrectAnswers,
  accuracyPercentage,
  bestStreak,
  onRestart,
  onBackToDashboard,
}: SessionCompleteProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {correctAnswers}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Correct Answers
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {incorrectAnswers}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Incorrect Answers
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {accuracyPercentage}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>

          {bestStreak > 0 && (
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {bestStreak} in a row
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Best streak
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onRestart} variant="outline" className="flex-1">
              Restart
            </Button>
            <Button onClick={onBackToDashboard} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              To Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
