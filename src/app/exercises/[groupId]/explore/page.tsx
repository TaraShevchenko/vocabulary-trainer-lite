import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseSession } from "@/modules/exercises";

interface ExplorePageProps {
  params: Promise<{
    groupId: string;
  }>;
  searchParams: Promise<{
    wordId?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExplorePageProps): Promise<Metadata> {
  await params;
  return {
    title: "Explore Words - Vocabulary Trainer",
    description: "Explore new words with introduction exercises",
  };
}

export default async function ExplorePage({
  params,
  searchParams,
}: ExplorePageProps) {
  const { groupId } = await params;
  const { wordId } = await searchParams;

  if (!groupId) {
    notFound();
  }

  return (
    <ExerciseSession
      groupId={groupId}
      initialWordId={wordId}
      exerciseOrder={["intro"]}
    />
  );
}
