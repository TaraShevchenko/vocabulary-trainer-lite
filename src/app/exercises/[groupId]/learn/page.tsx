import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseSession } from "@/modules/exercises";

interface LearnPageProps {
  params: Promise<{
    groupId: string;
  }>;
  searchParams: Promise<{
    wordId?: string;
  }>;
}

export async function generateMetadata({
  params,
}: LearnPageProps): Promise<Metadata> {
  await params;
  return {
    title: "Learn Words - Vocabulary Trainer",
    description: "Learn words with interactive exercises",
  };
}

export default async function LearnPage({
  params,
  searchParams,
}: LearnPageProps) {
  const { groupId } = await params;
  const { wordId } = await searchParams;

  if (!groupId) {
    notFound();
  }

  return (
    <ExerciseSession
      groupId={groupId}
      initialWordId={wordId}
      exerciseOrder={["matching", "multiple-choice", "speech", "typing"]}
    />
  );
}
