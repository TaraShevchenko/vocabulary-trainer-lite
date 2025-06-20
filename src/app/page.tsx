import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дашборд",
};

export default async function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center gap-2">
      Дашборд в процессе разработки 🔧
    </div>
  );
}
