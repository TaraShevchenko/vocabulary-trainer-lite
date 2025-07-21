"use client";

import { api } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function GroupStatisticsSlider() {
  const { data: groups, isLoading } = api.groups.getAll.useQuery();

  if (isLoading) {
    return <Skeleton className="h-36 w-full" />;
  }

  return (
    <Card className="bg-gradient-to-br from-[#5020A0] to-[#8040E0] text-white border-none shadow-lg rounded-xl p-6">
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center p-0">
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-white">
            {groups?.reduce((sum, group) => sum + group.totalWords, 0)}
          </div>
          <div className="text-lg text-gray-200 mt-2">Total Words</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-white">
            {groups?.reduce((sum, group) => sum + group.completedWords, 0)}
          </div>
          <div className="text-lg text-gray-200 mt-2">Learned Words</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-white">
            {Math.round(
              (groups?.reduce((sum, group) => sum + group.averageProgress, 0) ||
                0) / (groups?.length || 1),
            )}
            %
          </div>
          <div className="text-lg text-gray-200 mt-2">Average Progress</div>
        </div>
      </CardContent>
    </Card>
  );
}
