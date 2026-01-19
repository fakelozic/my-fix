import { getTodos } from "@/app/actions";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { TodoSection } from "@/components/todo-section";
import { CalendarStats } from "@/components/calendar-stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted p-4 md:p-8 flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
              FocusFlow
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay productive, one interval at a time.
            </p>
          </div>
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

        {/* Calendar Stats Section */}
        <div className="w-full">
           <CalendarStats todos={todos} />
        </div>
      </div>
    </main>
  );
}
