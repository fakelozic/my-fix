"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-none shadow-none">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[100px]">
           <div className="animate-pulse bg-muted h-10 w-32 rounded" />
        </CardContent>
      </Card>
    );
  }

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateString = time.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-none shadow-none">
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <div className="text-5xl font-mono font-bold tracking-widest tabular-nums flex items-baseline gap-2">
          <span>{hours}:{minutes}</span>
          <span className="text-2xl text-muted-foreground">{seconds}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-2 font-medium">
          {dateString}
        </div>
      </CardContent>
    </Card>
  );
}
