import { getTodos } from "@/app/actions";
import { Dashboard } from "@/components/dashboard";
import { CalendarStats } from "@/components/calendar-stats";
import { HistoryChart } from "@/components/history-chart";
import { ModeToggle } from "@/components/mode-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todos = await getTodos();

  // Calculate daily stats for Today's View
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedToday = todos.filter(
    (t) =>
      t.completed &&
      t.completedAt &&
      new Date(t.completedAt) >= today
  );

  const totalMinutes = completedToday.reduce((acc, t) => acc + (t.duration || 30), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted p-4 md:p-8 flex flex-col items-center gap-4">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header Section */}
        <div className="relative flex justify-end items-center">
          <ModeToggle />
        </div>

        <Tabs defaultValue="today" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="today">Today's View</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today" className="space-y-8">
            {/* Today's Stats */}
            <div className="flex justify-center">
              <Card className="min-w-[300px] bg-background/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Today&apos;s Focus</p>
                        <p className="text-xs text-muted-foreground">30m or 60m per task</p>
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold tracking-tighter">
                        {hours > 0 ? `${hours}h ` : ""}{minutes}m
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">Total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ADHD Dashboard with Focus Mode */}
            <Dashboard todos={todos} />
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
             <div className="grid grid-cols-1 gap-8">
                <div className="h-[400px]">
                  <HistoryChart todos={todos} />
                </div>
                <CalendarStats todos={todos} />
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
