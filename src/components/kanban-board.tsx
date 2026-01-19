"use client";

import { useRef } from "react";
import { Todo } from "@/db/schema";
import { updateTodoStatus, addTodo } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Circle, Clock, CheckCircle2, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    if (status === "todo") {
        return todos.filter(t => t.status === "todo" || (!t.status && !t.completed));
    }
    if (status === "done") {
        return todos.filter(t => t.status === "done" || (!t.status && t.completed));
    }
    return todos.filter(t => t.status === status);
  };

  const moveTask = async (id: number, nextStatus: string) => {
     await updateTodoStatus(id, nextStatus);
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
                    <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
                        Empty
                    </div>
                 ) : (
                    colTodos.map(todo => (
                        <Card key={todo.id} className="bg-background shadow-sm hover:shadow-md transition-all duration-200">
                            <CardContent className="p-3 flex flex-col gap-2">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-base font-medium leading-relaxed break-words">{todo.text}</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" className="h-6 w-6 shrink-0 text-muted-foreground">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {COLUMNS.filter(c => c.id !== col.id).map(targetCol => (
                                                <DropdownMenuItem 
                                                    key={targetCol.id}
                                                    onClick={() => moveTask(todo.id, targetCol.id)}
                                                >
                                                    Move to {targetCol.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
