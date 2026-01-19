import { getTodos } from "@/app/actions";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { TodoSection } from "@/components/todo-section";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todos = await getTodos();

  // Calculate daily stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedToday = todos.filter(
    (t) =>
      t.completed &&
      t.completedAt &&
      new Date(t.completedAt) >= today
  );

  const totalMinutes = completedToday.length * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted p-4 md:p-8 flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header & Stats Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
              FocusFlow
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay productive, one interval at a time.
            </p>
          </div>

          <Card className="min-w-[300px] bg-background/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Today&apos;s Focus</p>
                    <p className="text-xs text-muted-foreground">30m per task</p>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
             <PomodoroTimer />
          </div>
          <div className="h-full min-h-[500px]">
            <TodoSection todos={todos} />
          </div>
        </div>
      </div>
    </main>
  );
}
