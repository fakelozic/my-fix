import { getTodos } from "@/app/actions";
import { Dashboard } from "@/components/dashboard";
import { CalendarStats } from "@/components/calendar-stats";
import { HistoryChart } from "@/components/history-chart";
import { BrainDump } from "@/components/brain-dump";
import { ModeToggle } from "@/components/mode-toggle";
import { DigitalClock } from "@/components/digital-clock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

function calculateStreak(todos: any[]) {
  const completedDates = todos
    .filter((t) => t.completed && t.completedAt)
    .map((t) => new Date(t.completedAt).toDateString())
    .filter((value, index, self) => self.indexOf(value) === index) // Unique dates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

  // If the most recent is not today or yesterday, streak is broken
  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return 0;
  }

  // Count consecutive days
  let currentDate = new Date(completedDates[0]);
  
  for (let i = 0; i < completedDates.length; i++) {
    const dateToCheck = new Date(completedDates[i]);
    // Check if dateToCheck is same as currentDate (it should be for the first iteration)
    // or exactly 1 day before previous currentDate
    
    // Actually, simpler: Iterate and check gaps.
    if (i === 0) {
      streak++;
      continue;
    }
    
    const prevDate = new Date(completedDates[i-1]);
    const diffTime = Math.abs(prevDate.getTime() - dateToCheck.getTime());
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
            <div className="flex justify-center">
               <DigitalClock />
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Today's Focus */}
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Today&apos;s Focus</p>
                        <p className="text-xs text-muted-foreground">30m/60m blocks</p>
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold tracking-tighter">
                        {hours > 0 ? `${hours}h ` : ""}{minutes}m
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Counter */}
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-orange-500/10 rounded-full">
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Focus Streak</p>
                        <p className="text-xs text-muted-foreground">Consistent days</p>
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold tracking-tighter text-orange-500">
                        {streak}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">Days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               {/* Dashboard Main - Spans 2 cols */}
               <div className="lg:col-span-2">
                  <Dashboard todos={todos} />
               </div>
               
               {/* Sidebar - Spans 1 col */}
               <div className="lg:col-span-1 space-y-6">
                  <BrainDump />
                  {/* Future: Quick Tip or Motivation Card */}
               </div>
            </div>
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
