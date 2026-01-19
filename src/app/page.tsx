import { getTodos } from "@/app/actions";
import { Dashboard } from "@/components/dashboard";
import { CalendarStats } from "@/components/calendar-stats";
import { HistoryChart } from "@/components/history-chart";
import { StickyNotes } from "@/components/sticky-notes";
import { KanbanBoard } from "@/components/kanban-board";
import { ModeToggle } from "@/components/mode-toggle";
import { DigitalClock } from "@/components/digital-clock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

function calculateStreak(todos: any[]) {
  // ... existing logic ...
  const completedDates = todos
    .filter((t) => t.completed && t.completedAt)
    .map((t) => new Date(t.completedAt).toDateString())
    .filter((value, index, self) => self.indexOf(value) === index) // Unique dates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return 0;
  }

  let currentDate = new Date(completedDates[0]);
  
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
  const streak = calculateStreak(todos);

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
    <main className="min-h-screen bg-linear-to-br from-background to-muted p-6 flex flex-col gap-6">
      <div className="w-full h-full space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1 flex justify-center">
             <DigitalClock />
          </div>
          <div className="absolute right-6 top-6">
            <ModeToggle />
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full h-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="today">Today's Dashboard</TabsTrigger>
              <TabsTrigger value="history">History & Trends</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-12 gap-8 h-full">
               {/* Left Column: Stats & Sticky Notes (3 cols) */}
               <div className="col-span-12 lg:col-span-3 space-y-6 flex flex-col">
                  {/* Stats Stacked */}
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Today's Focus</p>
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

                  <div className="h-[400px] lg:flex-1 min-h-[300px]">
                    <StickyNotes />
                  </div>
               </div>

               {/* Center Column: Main Dashboard (Timer + Todo) (9 cols) */}
               <div className="col-span-12 lg:col-span-9 h-full">
                  <Dashboard todos={todos} />
               </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
             <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                <div className="h-[350px]">
                  <HistoryChart todos={todos} />
                </div>
                <CalendarStats todos={todos} />
             </div>
          </TabsContent>

          <TabsContent value="kanban" className="space-y-8 h-full">
              <KanbanBoard todos={todos} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
