"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { BookOpen, CheckCircle } from "lucide-react";

interface GroupCardProps {
  id: string;
  name: string;
  description?: string | null;
  totalWords: number;
  completedWords: number;
  averageProgress: number;
}

export function GroupCard({
  id,
  name,
  description,
  totalWords,
  completedWords,
  averageProgress,
}: GroupCardProps) {
  const progressColor = averageProgress >= 80 
    ? "bg-green-500" 
    : averageProgress >= 50 
    ? "bg-yellow-500" 
    : "bg-red-500";

  return (
    <Link href={`/exercises/${id}`} className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {name}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </CardDescription>
              )}
            </div>
            <Badge variant="secondary" className="ml-2">
              {averageProgress}%
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Прогресс-бар */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Learning Progress</span>
              <span>{averageProgress}%</span>
            </div>
            <Progress 
              value={averageProgress} 
              className="h-2"
            />
          </div>

          {/* Статистика */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span>{totalWords} words</span>
            </div>
            
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>{completedWords} learned</span>
            </div>
          </div>

          {/* Индикатор готовности */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            {averageProgress === 100 ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Group completed!</span>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Remaining to learn: {totalWords - completedWords} words
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}