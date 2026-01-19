"use client";

import { useRef, useState } from "react";
import { addTodo, toggleTodo, deleteTodo } from "@/app/actions";
import { Todo } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TodoSection({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [duration, setDuration] = useState<number>(30);

  return (
    <Card className="w-full max-w-md mx-auto h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        <form
          action={async (formData) => {
            await addTodo(formData);
            formRef.current?.reset();
            setDuration(30); // Reset to default
          }}
          ref={formRef}
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
            <Input
              name="text"
              placeholder="Add a new task..."
              className="flex-1"
              autoComplete="off"
            />
            <input type="hidden" name="duration" value={duration} />
            <Button type="submit" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
             <Button
                type="button"
                variant={duration === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setDuration(30)}
                className="flex-1 text-xs h-7"
             >
                30 Min
             </Button>
             <Button
                type="button"
                variant={duration === 60 ? "default" : "outline"}
                size="sm"
                onClick={() => setDuration(60)}
                className="flex-1 text-xs h-7"
             >
                60 Min
             </Button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[200px]">
          {todos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No tasks yet. Add one to get started!
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-md border bg-card hover:shadow-sm transition-all",
                  todo.completed && "opacity-60 bg-muted/50"
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
                      todo.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {todo.text}
                  </span>
                  <div className="flex items-center text-[9px] font-bold text-muted-foreground bg-muted/50 px-1 rounded mr-1">
                    {todo.duration || 30}m
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}