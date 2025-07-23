"use client";

import { useState } from "react";
import { Search, X, Eye, EyeOff, BookCheck, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/shared/api/client";
import { useDebounce, useInfiniteScroll } from "@/shared/hooks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { AddGroupModal } from "./AddGroupModal";
import { GroupCard } from "./GroupCard";

enum SortOption {
  FAVORITES = "favorites",
  NEWEST = "newest",
}

const sortLabels = {
  [SortOption.FAVORITES]: "Favorites",
  [SortOption.NEWEST]: "Recently added",
};

export function GroupsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>(
    SortOption.FAVORITES,
  );
  const [hideLearned, setHideLearned] = useState(true);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = api.groups.getPaginated.useInfiniteQuery(
    {
      limit: 9,
      search: debouncedSearchQuery || undefined,
      sortBy: sortOption,
      hideLearned,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage: () => void fetchNextPage(),
  });

  const utils = api.useUtils();
  const toggleFavoriteMutation = api.groups.toggleFavorite.useMutation({
    onSuccess: () => {
      void utils.groups.getPaginated.invalidate();
      toast.success("Favorite status changed!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change favorite status");
    },
  });

  const handleToggleFavorite = (groupId: string) => {
    toggleFavoriteMutation.mutate({ groupId });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleHideLearned = () => {
    setHideLearned(!hideLearned);
  };

  const allGroups = data?.pages.flatMap((page) => page.groups) || [];
  const isInitialLoading = isLoading && !data && !debouncedSearchQuery;

  if (isInitialLoading) {
    return (
      <>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading groups: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search groups by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <Select
          value={sortOption}
          onValueChange={(value: SortOption) => setSortOption(value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={hideLearned ? "outline" : "default"}
          onClick={toggleHideLearned}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <BookCheck className="size-4" />
        </Button>

        <AddGroupModal>
          <Button
            variant="default"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="size-4" />
          </Button>
        </AddGroupModal>
      </div>

      {isLoading && !isInitialLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="md" className="text-primary" />
        </div>
      )}

      {allGroups.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {debouncedSearchQuery
              ? `No results found for "${debouncedSearchQuery}"`
              : "No groups found"}
          </p>
          {debouncedSearchQuery && (
            <Button variant="outline" onClick={clearSearch} className="mt-4">
              Clear search
            </Button>
          )}
        </div>
      )}

      {allGroups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGroups.map((group) => (
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
      )}

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <Spinner size="lg" className="text-primary" />
        </div>
      )}
    </>
  );
}
