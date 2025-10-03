import { type Metadata } from "next";
import { GroupsList } from "@/modules/groups";
import { StreakWeekWidget } from "@/modules/statistics";

export const metadata: Metadata = {
  title: "Dashboard - Vocabulary Trainer",
  description: "Main page for learning English words",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="space-y-6">
        <StreakWeekWidget />
        <GroupsList />
      </div>
    </div>
  );
}
