import { Todo } from "@/db/schema";
import { getTodos, getKanbanTasks, getHabitLogs, getHabits } from "@/app/actions";
import { logoutAction } from "@/app/auth-actions";
import { Dashboard } from "@/components/dashboard";
import { CalendarStats } from "@/components/calendar-stats";
import { HistoryChart } from "@/components/history-chart";
import { HistoryTable } from "@/components/history-table";
import { HabitHistory } from "@/components/habit-history";
import { HabitWeekTable } from "@/components/habit-week-table";
import { DailyHabitChecklist } from "@/components/daily-habit-checklist";
import { StickyNotes } from "@/components/sticky-notes";
import { KanbanBoard } from "@/components/kanban-board";
import { ModeToggle } from "@/components/mode-toggle";
import { DigitalClock, CurrentDate } from "@/components/digital-clock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

function calculateStreak(todos: Todo[]) {
  const completedDates = todos
    .filter((t) => t.completed && t.completedAt)
    .map((t) => new Date(t.completedAt!).toDateString())
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(
    new Date().setDate(new Date().getDate() - 1),
  ).toDateString();

  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) {
      streak++;
      continue;
    }

    const prevDate = new Date(completedDates[i - 1]);
    const diffTime = Math.abs(
      prevDate.getTime() - new Date(completedDates[i]).getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default async function Home() {
  const todos = await getTodos();
  const kanbanTasks = await getKanbanTasks();
  const habitLogs = await getHabitLogs();
  const habits = await getHabits();
  const dailyTodos = todos.filter((t) => t.type === "daily");

  const streak = calculateStreak(dailyTodos);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const todayLogEntry = habitLogs.find(l => l.date === todayStr);
  const todayHabitValues = todayLogEntry ? todayLogEntry.habits : {};

  today.setHours(0, 0, 0, 0);

  const completedToday = dailyTodos.filter(
    (t) => t.completed && t.completedAt && new Date(t.completedAt) >= today,
  );

  const visibleTodos = dailyTodos.filter(
    (t) => !t.completed || (t.completedAt && new Date(t.completedAt) >= today),
  );

  const totalMinutes = completedToday.reduce(
    (acc, t) => acc + (t.duration || 30),
    0,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <main className="min-h-screen w-full lg:h-screen lg:overflow-hidden bg-background text-foreground flex flex-col p-4 overflow-y-auto">
      <Tabs defaultValue="today" className="flex-1 flex flex-col gap-4 lg:overflow-hidden">
        {/* Header Section */}
        <div className="shrink-0 flex flex-row items-center justify-between">
          <CurrentDate />
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <form action={logoutAction}>
              <Button variant="ghost" size="icon" title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* TODAY TAB */}
        <TabsContent
          value="today"
          className="flex-1 flex flex-col gap-4 lg:min-h-0 data-[state=inactive]:hidden"
        >
          {/* Top Row: Stats (Compact) + Clock */}
          <div className="shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[120px]">
            <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4 h-[100px] lg:h-full">
              <Card className="bg-background/50 backdrop-blur-sm h-full flex flex-col justify-center">
                <CardContent className="p-4 flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today&apos;s Focus</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tighter">
                      {hours > 0 ? `${hours}h ` : ""}{minutes}m
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 backdrop-blur-sm h-full flex flex-col justify-center">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Flame className="w-5 h-5" />
                    <p className="text-sm font-medium uppercase tracking-wider">Streak</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tighter text-orange-500">
                      {streak}
                    </span>
                    <span className="text-sm text-muted-foreground uppercase">Days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-8 h-[100px] lg:h-full">
              <div className="h-full flex items-center justify-center bg-background/30 rounded-xl border backdrop-blur-sm px-4">
                <DigitalClock />
              </div>
            </div>
          </div>

          {/* Main Content Grid - REORDERED: Notes | Habits | Dashboard (Pomodoro+Tasks) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-0 pb-8 lg:pb-0">
            {/* 1. Sticky Notes Column (3 cols) */}
            <div className="lg:col-span-3 min-h-[300px] lg:h-full flex flex-col">
              <div className="flex-1 overflow-hidden min-h-0">
                <StickyNotes />
              </div>
            </div>

            {/* 2. Habits Column (3 cols) */}
            <div className="lg:col-span-3 min-h-[400px] lg:h-full flex flex-col">
               <div className="flex-1 min-h-0 overflow-hidden">
                 <DailyHabitChecklist 
                   habits={habits} 
                   todayLog={todayHabitValues} 
                   date={todayStr} 
                 />
               </div>
            </div>

            {/* 3. Dashboard Column (6 cols) */}
            <div className="lg:col-span-6 min-h-[600px] lg:h-full flex flex-col gap-4">
               <div className="flex-1 overflow-hidden">
                  <Dashboard todos={visibleTodos} />
               </div>
            </div>
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="flex-1 flex flex-col min-h-0 lg:overflow-hidden data-[state=inactive]:hidden p-2">
          <Tabs defaultValue="week" className="w-full h-full flex flex-col">
            <div className="shrink-0 flex justify-start mb-4">
              <TabsList>
                <TabsTrigger value="week">Week View</TabsTrigger>
                <TabsTrigger value="month">Month View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="week" className="flex-1 overflow-y-auto min-h-0 space-y-8 data-[state=inactive]:hidden pr-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <HistoryTable todos={dailyTodos} />
                <HistoryChart todos={dailyTodos} />
              </div>
              <div className="grid grid-cols-1 gap-8 pb-4">
                <HabitWeekTable logs={habitLogs} habits={habits} />
              </div>
            </TabsContent>

            <TabsContent value="month" className="flex-1 overflow-y-auto min-h-0 space-y-8 data-[state=inactive]:hidden pr-2">
              <CalendarStats todos={dailyTodos} />
              <div className="grid grid-cols-1 gap-8 pb-4">
                <HabitHistory logs={habitLogs} habits={habits} />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* KANBAN TAB */}
        <TabsContent value="kanban" className="flex-1 flex flex-col min-h-0 lg:overflow-hidden data-[state=inactive]:hidden p-1">
          <div className="flex-1 overflow-y-auto pb-4">
            <KanbanBoard tasks={kanbanTasks} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}