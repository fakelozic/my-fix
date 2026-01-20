"use client";

import { useMemo } from "react";
import { Todo } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface HistoryTableProps {
  todos: Todo[];
}

interface WeekData {
  weekNo: number;
  startDate: Date;
  days: number[]; // Mon-Sun (0-6)
  totalMinutes: number;
}

export function HistoryTable({ todos }: HistoryTableProps) {
  const weeks = useMemo(() => {
    // 1. Map todos to dates and durations
    const dailyMap = new Map<string, number>(); // YYYY-MM-DD -> minutes

    todos.forEach((t) => {
      if (t.completed && t.completedAt) {
        const date = new Date(t.completedAt);
        // Use local time for the key to avoid timezone shifts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${day}`;

        const duration = t.duration || 30;
        dailyMap.set(key, (dailyMap.get(key) || 0) + duration);
      }
    });

    if (dailyMap.size === 0) return [];

    // 2. Find range
    const dates = Array.from(dailyMap.keys()).map((d) => new Date(d));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(); // Up to today

    // Align minDate to start of week (Monday)
    const startOfWeek = new Date(minDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const result: WeekData[] = [];
    const currentWeekStart = new Date(startOfWeek);
    let weekCounter = 1;

    // Iterate week by week until we cover maxDate
    while (currentWeekStart <= maxDate || result.length === 0) {
      const days: number[] = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
      let totalMinutes = 0;

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentWeekStart.getDate() + i);

        const year = currentDay.getFullYear();
        const month = String(currentDay.getMonth() + 1).padStart(2, "0");
        const day = String(currentDay.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${day}`;

        const minutes = dailyMap.get(key) || 0;
        days[i] = minutes;
        totalMinutes += minutes;
      }

      result.push({
        weekNo: weekCounter++,
        startDate: new Date(currentWeekStart),
        days,
        totalMinutes,
      });

      // Next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);

      // Break loop if we've gone past today (and processed the current week)
      if (currentWeekStart > maxDate && result.length > 0) break;
    }

    return result.reverse(); // Show newest first? User example has oldest first (1 to 47). Let's keep oldest first or match user example.
    // User example: 1 down to 47. Looks like chronological order (oldest at top).
    // I will return chronological order (oldest first).
    // Actually, let's stick to the generation order (oldest first).
  }, [todos]);

  // Formatting helpers
  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatAvg = (mins: number) => {
    // Avoid division by zero if needed, though usually valid
    return mins.toFixed(0);
  };

  const formatAvgTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full bg-background/50 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Weekly Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-auto h-[300px] border rounded-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 font-medium border-b border-r">
                  Week
                </th>
                <th className="px-4 py-3 font-medium border-b border-r">
                  Start
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Mon
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Tue
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Wed
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Thu
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Fri
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Sat
                </th>
                <th className="px-2 py-3 font-medium text-right border-b border-r">
                  Sun
                </th>
                <th className="px-4 py-3 font-medium text-right bg-muted/30 border-b border-r">
                  Mins
                </th>
                <th className="px-4 py-3 font-medium text-right bg-muted/30 border-b border-r">
                  Hrs
                </th>
                <th className="px-4 py-3 font-medium text-right border-b border-r">
                  Avg(m)
                </th>
                <th className="px-4 py-3 font-medium text-right border-b">
                  Avg(H)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {weeks.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No data available yet.
                  </td>
                </tr>
              ) : (
                weeks.map((week) => {
                  const avgMins = week.totalMinutes / 7;
                  return (
                    <tr
                      key={week.weekNo}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium border-r">
                        {week.weekNo}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground border-r whitespace-nowrap">
                        {week.startDate.toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      {week.days.map((mins, i) => (
                        <td
                          key={i}
                          className={`px-2 py-3 text-right border-r ${mins === 0 ? "text-muted-foreground/30" : ""}`}
                        >
                          {mins}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-medium bg-muted/30 border-r">
                        {week.totalMinutes}
                      </td>
                      <td className="px-4 py-3 text-right font-medium bg-muted/30 border-r">
                        {formatTime(week.totalMinutes)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground border-r">
                        {formatAvg(avgMins)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatAvgTime(avgMins)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
