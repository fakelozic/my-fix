"use client";

import { useRef } from "react";
import { Todo } from "@/db/schema";
import { updateTodoStatus, addTodo } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Circle, Clock, CheckCircle2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  todos: Todo[];
}

const COLUMNS = [
  { id: "todo", label: "To Do", icon: Circle, color: "text-slate-500" },
  { id: "in-progress", label: "In Progress", icon: Clock, color: "text-blue-500" },
  { id: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

export function KanbanBoard({ todos }: KanbanBoardProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const getColumnTodos = (status: string) => {
    // Handle legacy data or default
    if (status === "todo") {
        return todos.filter(t => t.status === "todo" || (!t.status && !t.completed));
    }
    if (status === "done") {
        return todos.filter(t => t.status === "done" || (!t.status && t.completed));
    }
    return todos.filter(t => t.status === status);
  };

  const moveTask = async (id: number, currentStatus: string, direction: 'next' | 'prev') => {
    const currentIndex = COLUMNS.findIndex(c => c.id === currentStatus);
    if (currentIndex === -1) return;

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    // Clamp
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= COLUMNS.length) newIndex = COLUMNS.length - 1;

    const newStatus = COLUMNS[newIndex].id;
    if (newStatus !== currentStatus) {
       await updateTodoStatus(id, newStatus);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Project Board</h2>
          <form
            action={async (formData) => {
                await addTodo(formData);
                formRef.current?.reset();
            }}
            ref={formRef}
            className="flex gap-2 w-full max-w-sm"
          >
            <Input name="text" placeholder="Add a project task..." className="bg-background" autoComplete="off" />
            <input type="hidden" name="type" value="kanban" />
            <Button type="submit">
                <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTodos = getColumnTodos(col.id);
          const Icon = col.icon;
          
          return (
            <div key={col.id} className="flex flex-col h-full bg-muted/30 rounded-xl border p-4 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                   <Icon className={cn("w-5 h-5", col.color)} />
                   {col.label}
                   <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                     {colTodos.length}
                   </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                 {colTodos.length === 0 ? (
                    <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        Empty
                    </div>
                 ) : (
                    colTodos.map(todo => (
                        <Card key={todo.id} className="bg-background shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-3 flex flex-col gap-2">
                                <p className="text-sm font-medium leading-snug">{todo.text}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {todo.duration || 30}m
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="h-6 w-6"
                                            disabled={col.id === 'todo'}
                                            onClick={() => moveTask(todo.id, col.id, 'prev')}
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="h-6 w-6"
                                            disabled={col.id === 'done'}
                                            onClick={() => moveTask(todo.id, col.id, 'next')}
                                        >
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
