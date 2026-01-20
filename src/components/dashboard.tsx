"use client";

import { PomodoroTimer, PomodoroTimerRef } from "@/components/pomodoro-timer";
import { TodoSection } from "@/components/todo-section";
import { QuotesWidget } from "@/components/quotes-widget";
import { Card, CardContent } from "@/components/ui/card";
import { Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Todo } from "@/db/schema";

interface DashboardProps {
  todos: Todo[];
}

export function Dashboard({ todos }: DashboardProps) {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const timerRef = useRef<PomodoroTimerRef>(null);

  const activeTask = todos.find((t) => t.id === activeTaskId);

  useEffect(() => {
    if (activeTask) {
      const mode = activeTask.duration === 60 ? "focus60" : "focus30";
      timerRef.current?.startSession(mode);
    } else {
      timerRef.current?.stopSession();
    }
  }, [activeTask]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Active Task Hero Section */}
      {activeTask && (
        <div className="animate-in slide-in-from-top-4 duration-300 shrink-0">
          <Card className="border-primary/50 bg-primary/5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse" />
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  Current Focus
                </div>
                <h2 className="text-2xl font-bold truncate">{activeTask.text}</h2>
                <p className="text-muted-foreground text-sm">
                  {activeTask.duration || 30}m session target
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTaskId(null)}
                className="shrink-0 hover:bg-background/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Grid: Pomodoro & Todos */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        <div className="h-full lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="flex-[6] min-h-0">
            <PomodoroTimer ref={timerRef} />
          </div>
          <div className="flex-[4] min-h-0">
            <QuotesWidget />
          </div>
        </div>
        
        <div className={cn(
          "h-full transition-all duration-500 lg:col-span-8 min-h-[300px]",
          activeTaskId ? "opacity-90" : "opacity-100"
        )}>
          <TodoSection  
            todos={todos} 
            activeTaskId={activeTaskId} 
            onFocusTask={setActiveTaskId} 
          />
        </div>
      </div>
    </div>
  );
}