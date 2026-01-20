"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, ChevronLeft, ChevronRight, Check, Ban, AlertCircle, Minus } from "lucide-react";
import { Habit } from "@/db/schema";
import { cn } from "@/lib/utils";

interface HabitLog {
  id: number;
  date: string;
  habits: Record<string, string>;
}

interface HabitWeekTableProps {
  logs: HabitLog[];
  habits: Habit[];
}

export function HabitWeekTable({ logs, habits }: HabitWeekTableProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Align to Monday of the current week
  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d);
    monday.setDate(diff);
    return monday;
  };

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  
  const weekLabel = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${
    new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }`;

  const prevWeek = () => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // Generate matrix for the week
  const matrix = useMemo(() => {
    const data = [];
    const logMap = new Map<string, Record<string, string>>();
    
    logs.forEach(l => {
        if (l.date) logMap.set(l.date, l.habits);
    });

    for (let i = 0; i < 7; i++) {
        const dateObj = new Date(startOfWeek);
        dateObj.setDate(startOfWeek.getDate() + i);
        
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        
        const dayHabits = logMap.get(dateStr) || {};
        
        data.push({
            day: dateObj.getDate(),
            dateStr,
            weekday,
            habits: dayHabits
        });
    }
    return data;
  }, [logs, startOfWeek]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Yes": return { icon: Check, color: "text-green-500 bg-green-500/10", label: "Done" };
      case "No": return { icon: Ban, color: "text-red-500 bg-red-500/10", label: "Missed" };
      case "Partial": return { icon: AlertCircle, color: "text-yellow-500 bg-yellow-500/10", label: "Partial" };
      default: return { icon: Minus, color: "text-muted-foreground/20", label: "-" };
    }
  };

  // Calculate Habit Summaries for this week
  const habitSummaries = useMemo(() => {
    return habits.map(h => {
        let yes = 0;
        let partial = 0;
        const total = habits.length;
        
        matrix.forEach(row => {
            const status = row.habits[h.id];
            if (status === "Yes") yes++;
            if (status === "Partial") partial++;
        });
        
        return {
            id: h.id,
            percentage: Math.round(((yes + (partial * 0.5)) / total) * 100)
        };
    });
  }, [matrix, habits]);

  return (
    <Card className="w-full bg-background/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          Weekly Detail
        </CardTitle>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevWeek}>
                <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono font-medium min-w-[140px] text-center text-sm">{weekLabel}</span>
            <Button variant="ghost" size="icon" onClick={nextWeek}>
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-auto border rounded-md">
          <table className="w-full text-sm text-left border-collapse min-w-[600px]">
            <thead className="text-xs uppercase bg-muted/80 text-muted-foreground">
              <tr>
                <th className="px-2 py-3 font-medium border-b border-r w-[100px] bg-muted/80 sticky left-0 z-30">Date</th>
                {habits.map(h => (
                  <th key={h.id} className="px-2 py-3 font-medium text-center border-b border-r min-w-[40px] max-w-[100px] truncate" title={h.name}>
                    {h.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrix.map((row) => (
                <tr key={row.dateStr} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-2 py-3 font-medium border-r bg-background/50 sticky left-0 z-10 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold opacity-70 w-8">{row.weekday.substring(0,3)}</span>
                    <span className="text-muted-foreground text-xs">{row.day}</span>
                  </td>
                  {habits.map(h => {
                    const status = row.habits[h.id];
                    const config = getStatusConfig(status);
                    const Icon = config.icon;
                    return (
                      <td key={h.id} className="px-1 py-1 border-r text-center p-0">
                        <div className="flex items-center justify-center h-8">
                            <div className={cn("w-6 h-6 rounded flex items-center justify-center transition-colors", config.color)}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Summary Footer */}
              <tr className="bg-muted/30 font-medium border-t-2">
                <td className="px-2 py-3 border-r sticky left-0 bg-muted/30 z-10 text-right text-xs">Completion</td>
                {habitSummaries.map(s => (
                    <td key={s.id} className="px-1 py-3 text-center border-r text-xs">
                        {s.percentage}%
                    </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
