"use client";

import { useParams, useRouter } from "next/navigation";
import { BookOpen, Play, Eye } from "lucide-react";
import { api } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Spinner } from "@/shared/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export default function GroupViewPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const {
    data: group,
    isLoading,
    error,
  } = api.groups.getById.useQuery({ id: groupId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Group not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Maybe the group was deleted or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push("/")}>Return to home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/exercises/${groupId}/explore`)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Explore
            </Button>
            <Button
              onClick={() => router.push(`/exercises/${groupId}/learn`)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Learn
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Words count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {group.stats.totalWords}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Learned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {group.stats.completedWords}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {group.stats.studiedWords}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {group.stats.averageProgress}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Слова в группе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Английский</TableHead>
                  <TableHead>Русский</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Прогресс</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.words.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">
                      {word.english}
                    </TableCell>
                    <TableCell>{word.russian}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {word.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={word.progress[0]?.score}
                          className="h-2 w-20"
                        />
                        <span className="text-xs text-gray-500">
                          {word.progress[0]?.score ?? 0}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
