"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex items-center justify-center h-full min-h-[100px]">
         <div className="animate-pulse bg-muted/20 h-20 w-48 rounded-xl" />
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-none shadow-none w-full h-full flex items-center justify-center">
      <CardContent className="p-2 flex flex-col items-center justify-center">
        <div className="text-7xl lg:text-9xl font-mono font-bold tracking-widest tabular-nums flex items-baseline gap-4 text-foreground/90">
          <span>{hours}:{minutes}</span>
          <span className="text-3xl lg:text-5xl text-muted-foreground/50">{seconds}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CurrentDate() {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  if (!date) return <div className="h-6 w-32 bg-muted/20 animate-pulse rounded" />;

  return (
    <div className="text-lg font-medium text-muted-foreground uppercase tracking-widest">
      {date}
    </div>
  );
}
