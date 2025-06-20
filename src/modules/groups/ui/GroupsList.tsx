"use client";

import { Loader2, BookOpen } from "lucide-react";
import { api } from "@/shared/api/client";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { GroupCard } from "./GroupCard";

export function GroupsList() {
  const { data: groups, isLoading, error } = api.groups.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading word groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-destructive mb-4">
            Error loading groups:{" "}
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No available groups</p>
          <p className="text-sm text-muted-foreground">
            There are no word groups to study yet. Contact the administrator to
            add content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Word Groups
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Choose a group to learn new words
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Groups: {groups.length}
        </div>
      </div>

      {/* Statistics */}
      <Card
        className="bg-gradient-to-br from-[#5020A0] to-[#8040E0] text-white border-none shadow-lg rounded-xl p-6" // Увеличил padding
      >
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center p-0">
          {" "}
          {/* Убрал padding из CardContent */}
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold text-white">
              {groups.reduce((sum, group) => sum + group.totalWords, 0)}
            </div>{" "}
            {/* Увеличил размер */}
            <div className="text-lg text-gray-200 mt-2">Total Words</div>{" "}
            {/* Увеличил размер и добавил отступ */}
          </div>
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold text-white">
              {groups.reduce((sum, group) => sum + group.completedWords, 0)}
            </div>{" "}
            {/* Увеличил размер, белый цвет */}
            <div className="text-lg text-gray-200 mt-2">Learned Words</div>{" "}
            {/* Увеличил размер и добавил отступ */}
          </div>
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold text-white">
              {Math.round(
                groups.reduce((sum, group) => sum + group.averageProgress, 0) /
                  groups.length,
              )}
              %
            </div>{" "}
            {/* Увеличил размер, белый цвет */}
            <div className="text-lg text-gray-200 mt-2">
              Average Progress
            </div>{" "}
            {/* Увеличил размер и добавил отступ */}
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            id={group.id}
            name={group.name}
            description={group.description}
            totalWords={group.totalWords}
            completedWords={group.completedWords}
            averageProgress={group.averageProgress}
          />
        ))}
      </div>
    </div>
  );
}
