"use client";

import { useState } from "react";
import { Todo } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarStatsProps {
  todos: Todo[];
}

export function CalendarStats({ todos }: CalendarStatsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDailyStats = (day: number) => {
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const completed = todos.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= targetDate && d < nextDate;
    });

    const totalMinutes = completed.reduce((acc, t) => acc + (t.duration || 30), 0);
    return { count: completed.length, minutes: totalMinutes, tasks: completed };
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const selectedStats = selectedDate ? getDailyStats(selectedDate.getDate()) : null;

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <Card className="flex-1 bg-background/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Activity Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[100px] text-center">{monthName} {year}</span>
            <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-xs text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {padding.map(i => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const stats = getDailyStats(day);
              const isSelected = selectedDate?.getDate() === day && 
                               selectedDate?.getMonth() === month &&
                               selectedDate?.getFullYear() === year;
              const hasActivity = stats.minutes > 0;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={cn(
                    "h-10 w-full rounded-md flex flex-col items-center justify-center text-xs transition-all border",
                    isSelected ? "ring-2 ring-primary border-primary z-10" : "border-transparent",
                    hasActivity 
                      ? "bg-primary/20 hover:bg-primary/30 text-foreground font-bold" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span>{day}</span>
                  {hasActivity && (
                    <span className="text-[10px] leading-none text-primary opacity-80">
                      {stats.minutes}m
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 h-full min-h-[300px] bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>
            {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] overflow-y-auto">
          {selectedDate && selectedStats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Focus</p>
                  <p className="text-2xl font-bold">{selectedStats.minutes}m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-right">{selectedStats.count}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Task Log</h3>
                {selectedStats.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No tasks completed on this day.</p>
                ) : (
                  selectedStats.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded border bg-card/50">
                      <span className="text-sm truncate flex-1 mr-4">{task.text}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        {task.duration || 30}m
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a date to view details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
