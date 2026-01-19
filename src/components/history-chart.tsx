"use client";

import { useMemo } from "react";
import { Todo } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartLine } from "lucide-react";

interface HistoryChartProps {
  todos: Todo[];
}

export function HistoryChart({ todos }: HistoryChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Show last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const minutes = todos
        .filter(t => {
          if (!t.completed || !t.completedAt) return false;
          const completedDate = new Date(t.completedAt);
          return completedDate >= d && completedDate < nextD;
        })
        .reduce((acc, t) => acc + (t.duration || 30), 0);

      data.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        minutes,
        fullDate: d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      });
    }
    return data;
  }, [todos]);

  return (
    <Card className="w-full h-full bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="w-5 h-5 text-primary" />
          Focus History (Last 14 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              className="text-muted-foreground" 
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              className="text-muted-foreground"
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {payload[0].payload.fullDate}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].value} mins
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="minutes" 
              stroke="currentColor" 
              strokeWidth={2} 
              dot={false}
              className="text-primary"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
