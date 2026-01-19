"use client";

import { useRef } from "react";
import { addTodo, toggleTodo, deleteTodo } from "@/app/actions";
import { Todo } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Trash2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoSectionProps {
  todos: Todo[];
  activeTaskId?: number | null;
  onFocusTask?: (id: number | null) => void;
}

export function TodoSection({ todos, activeTaskId, onFocusTask }: TodoSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="w-full h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          Daily Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4 pt-3">
        
        <form
          action={async (formData) => {
            await addTodo(formData);
            formRef.current?.reset();
          }}
          ref={formRef}
          className="flex gap-2 relative z-10"
        >
          <Input
            name="text"
            placeholder="Add a daily task..."
            className="flex-1 bg-background focus-visible:ring-2 focus-visible:ring-primary"
            autoComplete="off"
          />
          <input type="hidden" name="type" value="daily" />
          <Button 
            type="submit" 
            name="duration" 
            value="30" 
            size="sm" 
            variant="secondary"
            className="h-9"
          >
            30m
          </Button>
          <Button 
            type="submit" 
            name="duration" 
            value="60" 
            size="sm" 
            variant="default"
            className="h-9"
          >
            60m
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 min-h-[200px] -mx-2">
          {todos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No tasks yet. Add one to get started!
            </div>
          ) : (
            todos.map((todo) => {
              const isActive = activeTaskId === todo.id;
              const isDimmed = activeTaskId && !isActive;

              return (
                <div
                  key={todo.id}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-md border bg-card transition-all duration-300",
                    todo.completed && "opacity-60 bg-muted/50",
                    isActive && "ring-2 ring-primary border-primary shadow-md scale-[1.02] z-10",
                    isDimmed && "opacity-40 blur-[1px] grayscale"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <button
                      onClick={() => toggleTodo(todo.id, !todo.completed)}
                      className={cn(
                        "flex-shrink-0 w-4 h-4 rounded-full border border-primary flex items-center justify-center transition-colors",
                        todo.completed
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary/10"
                      )}
                    >
                      {todo.completed && <Check className="w-2.5 h-2.5" />}
                    </button>
                    <span
                      className={cn(
                        "truncate transition-all flex-1 text-sm",
                        todo.completed && "line-through text-muted-foreground",
                        isActive && "font-medium"
                      )}
                    >
                      {todo.text}
                    </span>
                    <div className="flex items-center text-[9px] font-bold text-muted-foreground bg-muted/50 px-1 rounded mr-1">
                      {todo.duration || 30}m
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     {!todo.completed && onFocusTask && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onFocusTask(isActive ? null : todo.id)}
                          className={cn(
                            "h-7 w-7", 
                            isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                          )}
                          title={isActive ? "Stop Focusing" : "Focus on this task"}
                        >
                          <Target className="w-3.5 h-3.5" />
                        </Button>
                     )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}