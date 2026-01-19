"use client";

import { useState } from "react";
import { Todo } from "@/db/schema";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { TodoSection } from "@/components/todo-section";
import { Card, CardContent } from "@/components/ui/card";
import { Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  todos: Todo[];
}

export function Dashboard({ todos }: DashboardProps) {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const activeTask = todos.find((t) => t.id === activeTaskId);

  return (
    <div className="flex flex-col h-full gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-start">
        <div className="flex flex-col gap-6 h-full col-span-1">
          <PomodoroTimer />
        </div>
        
        <div className={cn(
          "h-full transition-all duration-500 col-span-1 lg:col-span-2",
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
