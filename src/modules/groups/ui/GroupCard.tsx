"use client";

import Link from "next/link";
import { BookOpen, CheckCircle, Star } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

interface GroupCardProps {
  id: string;
  name: string;
  description?: string | null;
  totalWords: number;
  completedWords: number;
  averageProgress: number;
  isFavorite?: boolean;
  onToggleFavorite?: (groupId: string) => void;
}

export function GroupCard({
  id,
  name,
  description,
  totalWords,
  completedWords,
  averageProgress,
  isFavorite = false,
  onToggleFavorite,
}: GroupCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(id);
  };
  const progressColor =
    averageProgress >= 80
      ? "bg-green-500"
      : averageProgress >= 50
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <Link
      href={`/groups/${id}`}
      className="block transition-transform hover:scale-105"
    >
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
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="secondary">{averageProgress}%</Badge>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleFavoriteClick}
                >
                  <Star
                    className={`h-4 w-4 transition-colors ${
                      isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Learning Progress</span>
              <span>{averageProgress}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />
          </div>

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
