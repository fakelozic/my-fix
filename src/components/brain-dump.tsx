"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrainDump() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("focusflow-braindump");
    if (saved) setNotes(saved);
  }, []);

  const handleSave = (value: string) => {
    setNotes(value);
    localStorage.setItem("focusflow-braindump", value);
  };

  return (
    <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-amber-700 dark:text-amber-500">
          <Lightbulb className="w-4 h-4" />
          Brain Dump
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Distracting thought? Type it here and get back to work. Capture it to clear your mind.
        </p>
        <Textarea
          value={notes}
          onChange={(e) => handleSave(e.target.value)}
          placeholder="Buy milk, look up that movie, email Bob..."
          className="min-h-[120px] resize-none bg-background/50 focus:bg-background transition-colors border-amber-200/30 dark:border-amber-800/30 focus-visible:ring-amber-500/50"
        />
      </CardContent>
    </Card>
  );
}
