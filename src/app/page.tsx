import { Todo } from "@/db/schema";
import { getTodos } from "@/app/actions";
import { logoutAction } from "@/app/auth-actions";
import { Dashboard } from "@/components/dashboard";
import { CalendarStats } from "@/components/calendar-stats";
import { HistoryChart } from "@/components/history-chart";
import { StickyNotes } from "@/components/sticky-notes";
import { QuotesWidget } from "@/components/quotes-widget";
import { KanbanBoard } from "@/components/kanban-board";
import { ModeToggle } from "@/components/mode-toggle";
import { DigitalClock, CurrentDate } from "@/components/digital-clock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

function calculateStreak(todos: Todo[]) {
  // ... existing logic ...
  const completedDates = todos
    .filter((t) => t.completed && t.completedAt)
    .map((t) => new Date(t.completedAt!).toDateString())
    .filter((value, index, self) => self.indexOf(value) === index) // Unique dates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return 0;
  }
  
  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) {
      streak++;
      continue;
    }
    
    const prevDate = new Date(completedDates[i-1]);
    const diffTime = Math.abs(prevDate.getTime() - new Date(completedDates[i]).getTime());
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
  const dailyTodos = todos.filter(t => t.type === 'daily');
  const kanbanTodos = todos.filter(t => t.type === 'kanban');

  const streak = calculateStreak(dailyTodos);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedToday = dailyTodos.filter(
    (t) =>
      t.completed &&
      t.completedAt &&
      new Date(t.completedAt) >= today
  );

  const totalMinutes = completedToday.reduce((acc, t) => acc + (t.duration || 30), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted p-6 flex flex-col gap-6">
      <div className="w-full h-full space-y-6">
        {/* Global Header with Mode Toggle */}
        <div className="absolute right-6 top-6 z-50 flex items-center gap-2">
            <ModeToggle />
            <form action={logoutAction}>
                <Button variant="ghost" size="icon" title="Logout">
                    <LogOut className="w-4 h-4" />
                </Button>
            </form>
        </div>

        <Tabs defaultValue="today" className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0 px-2">
            <CurrentDate />
            <TabsList>
              <TabsTrigger value="today">Today&apos;s Dashboard</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="history">History & Trends</TabsTrigger>
            </TabsList>
            <div className="w-[200px] hidden lg:block" /> {/* Spacer */}
          </div>

          <TabsContent value="today" className="space-y-6 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Bar: Stats & Clock */}
            <div className="grid grid-cols-12 gap-6 shrink-0">
                <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Today&apos;s Focus</p>
                            <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold tracking-tighter">
                                {hours > 0 ? `${hours}h ` : ""}{minutes}m
                            </span>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-orange-500">
                            <Flame className="w-5 h-5" />
                            <p className="text-sm font-medium">Focus Streak</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold tracking-tighter text-orange-500">
                                {streak}
                            </span>
                            <span className="text-sm text-muted-foreground uppercase">Days</span>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="col-span-12 lg:col-span-8">
                    <div className="h-full flex items-center justify-center bg-background/30 rounded-xl border backdrop-blur-sm p-4">
                        <DigitalClock />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
               {/* Left Sidebar: Sticky Notes (4 cols) */}
               <div className="col-span-12 lg:col-span-4 h-full min-h-[300px]">
                  <StickyNotes />
               </div>

               {/* Main Dashboard (8 cols) */}
               <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  <div className="flex-1 min-h-[500px]">
                     <Dashboard todos={dailyTodos} />
                  </div>
                  <div className="shrink-0 h-auto">
                     <QuotesWidget />
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
             <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                <div className="h-[350px]">
                  <HistoryChart todos={dailyTodos} />
                </div>
                <CalendarStats todos={dailyTodos} />
             </div>
          </TabsContent>

          <TabsContent value="kanban" className="space-y-8 h-full">
              <KanbanBoard todos={kanbanTodos} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
