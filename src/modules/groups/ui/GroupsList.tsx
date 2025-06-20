"use client";

import toast from "react-hot-toast";
import { api } from "@/shared/api/client";
import { Skeleton } from "@/shared/ui/skeleton";
import { GroupCard } from "./GroupCard";

export function GroupsList() {
  const { data: groups, isLoading } = api.groups.getAll.useQuery();
  const utils = api.useUtils();
  const toggleFavoriteMutation = api.groups.toggleFavorite.useMutation({
    onSuccess: () => {
      // Обновляем данные после успешного изменения
      void utils.groups.getAll.invalidate();
      toast.success("Статус избранного изменен!");
    },
    onError: (error) => {
      toast.error(error.message || "Не удалось изменить статус избранного");
    },
  });

  const handleToggleFavorite = (groupId: string) => {
    toggleFavoriteMutation.mutate({ groupId });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Группы слов не найдены</p>
      </div>
    );
  }

  return (
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
          isFavorite={group.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(group.id)}
        />
      ))}
    </div>
  );
}
