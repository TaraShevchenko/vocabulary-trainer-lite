import { type Metadata } from "next";
import { GroupsList } from "@/modules/groups";
import { StreakWeekWidget } from "@/modules/statistics";

export const metadata: Metadata = {
  title: "Dashboard - Vocabulary Trainer",
  description: "Main page for learning English words",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Vocabulary Trainer Lite
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn English words effectively with interactive exercises
          </p>
        </div>

        <div className="space-y-6">
          <StreakWeekWidget />
          <GroupsList />
        </div>
      </div>
    </div>
  );
}
