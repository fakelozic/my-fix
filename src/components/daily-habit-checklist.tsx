"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListTodo, Plus, Trash2, Settings2, X, Check, Ban, AlertCircle } from "lucide-react";
import { addHabit, deleteHabit, saveHabitLog } from "@/app/actions";
import { toast } from "sonner";
import { Habit } from "@/db/schema";
import { cn } from "@/lib/utils";

interface DailyHabitChecklistProps {
  habits: Habit[];
  todayLog: Record<string, string>; // habitId -> value
  date: string; // YYYY-MM-DD
}

export function DailyHabitChecklist({ habits, todayLog, date }: DailyHabitChecklistProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [values, setValues] = useState(todayLog);

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    const formData = new FormData();
    formData.append("name", newHabitName);
    
    const result = await addHabit(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task added");
      setNewHabitName("");
    }
  };

  const handleDeleteHabit = async (id: number) => {
    if (confirm("Are you sure? This will hide history for this task.")) {
      const res = await deleteHabit(id);
      if (res.error) toast.error(res.error);
      else toast.success("Task deleted");
    }
  };

  const cycleValue = (current: string) => {
    switch (current) {
      case "Yes": return "No";
      case "No": return "Partial";
      case "Partial": return "";
      default: return "Yes";
    }
  };

  const handleToggle = async (habitId: number) => {
    const current = values[habitId] || "";
    const next = cycleValue(current);
    const newValues = { ...values, [habitId]: next };
    
    setValues(newValues);
    
    try {
      const res = await saveHabitLog(date, newValues);
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Failed to save");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Yes": return "bg-green-500/10 text-green-600 border-green-500/50 hover:bg-green-500/20";
      case "No": return "bg-red-500/10 text-red-600 border-red-500/50 hover:bg-red-500/20";
      case "Partial": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/50 hover:bg-yellow-500/20";
      default: return "bg-card hover:bg-muted/50 border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Yes": return <Check className="w-3.5 h-3.5" />;
      case "No": return <Ban className="w-3.5 h-3.5" />;
      case "Partial": return <AlertCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  if (isManaging) {
    return (
      <Card className="w-full h-full bg-background/50 backdrop-blur-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-4 shrink-0">
          <CardTitle className="text-sm font-medium">Manage Habits</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsManaging(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-1 p-4 pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="New task name..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            />
            <Button onClick={handleAddHabit} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {habits.map(h => (
              <div key={h.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/50">
                <span className="text-sm">{h.name}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteHabit(h.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {habits.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks defined.</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-background/50 backdrop-blur-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          Habits
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 overflow-hidden p-4 pt-0">
        
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status Checklist</span>
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsManaging(true)} title="Manage Tasks">
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-1 space-y-2 min-h-0">
          {habits.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">No tasks set up yet.</p>
              <Button size="sm" onClick={() => setIsManaging(true)}>Add your first task</Button>
            </div>
          ) : (
            habits.map(h => {
              const status = values[h.id] || "";
              return (
                <button
                  key={h.id}
                  onClick={() => handleToggle(h.id)}
                  className={cn(
                    "group flex w-full items-center justify-between p-3 rounded-lg border transition-all duration-300",
                    getStatusColor(status)
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className={cn(
                        "shrink-0 w-5 h-5 rounded-full border border-primary flex items-center justify-center transition-colors",
                        status === "Yes" ? "bg-primary text-primary-foreground" : 
                        status === "No" ? "bg-red-500 border-red-500 text-white" :
                        status === "Partial" ? "bg-yellow-500 border-yellow-500 text-white" :
                        "hover:bg-primary/10"
                    )}>
                      {getStatusIcon(status)}
                    </div>
                    <span className={cn(
                        "truncate transition-all flex-1 text-sm text-left",
                        status === "No" && "opacity-60",
                        status === "" && "font-normal"
                    )}>
                      {h.name}
                    </span>
                    <div className="flex items-center text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full mr-1 h-5">
                      {status || "Todo"}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}