"use client";

import { useRef } from "react";
import { addTodo, toggleTodo, deleteTodo } from "@/app/actions";
import { Todo } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TodoSection({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);

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
          }}
          ref={formRef}
          className="flex gap-2"
        >
          <Input
            name="text"
            placeholder="Add a new task..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
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
                  "group flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-all",
                  todo.completed && "opacity-60 bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <button
                    onClick={() => toggleTodo(todo.id, !todo.completed)}
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full border border-primary flex items-center justify-center transition-colors",
                      todo.completed
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10"
                    )}
                  >
                    {todo.completed && <Check className="w-3 h-3" />}
                  </button>
                  <span
                    className={cn(
                      "truncate transition-all flex-1",
                      todo.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {todo.text}
                  </span>
                  <div className="flex items-center text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border mr-2">
                    30m
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
