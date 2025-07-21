import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.unobserve(loadMoreElement);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { loadMoreRef };
}
