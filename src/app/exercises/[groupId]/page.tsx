import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseSession } from "@/modules/exercises";

interface ExercisePageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExercisePageProps): Promise<Metadata> {
  await params; // Consume the promise
  return {
    title: "Exercises - Vocabulary Trainer",
    description: "Learn English words with interactive exercises",
  };
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { groupId } = await params;

  if (!groupId) {
    notFound();
  }

  return <ExerciseSession groupId={groupId} />;
}
