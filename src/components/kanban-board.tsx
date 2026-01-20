"use client";

import { useRef, useOptimistic, useTransition, useState } from "react";
import { Todo } from "@/db/schema";
import { updateTodoStatus, addTodo, deleteTodo } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Circle, Clock, CheckCircle2, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface KanbanBoardProps {
  todos: Todo[];
}

type OptimisticAction = 
  | { type: "add"; payload: Partial<Todo> }
  | { type: "move"; payload: { id: number; status: string } }
  | { type: "delete"; payload: { id: number } };

const COLUMNS = [
  { id: "todo", label: "To Do", icon: Circle, color: "text-slate-500" },
  { id: "in-progress", label: "In Progress", icon: Clock, color: "text-blue-500" },
  { id: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

export function KanbanBoard({ todos }: KanbanBoardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state: Todo[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [
            ...state,
            {
              ...action.payload,
              id: Math.random(),
              status: "todo",
              completed: false,
              createdAt: new Date(),
            } as Todo,
          ];
        case "move":
          return state.map((t) =>
            t.id === action.payload.id ? { ...t, status: action.payload.status, completed: action.payload.status === "done" } : t
          );
        case "delete":
          return state.filter((t) => t.id !== action.payload.id);
        default:
          return state;
      }
    }
  );

  const getColumnTodos = (status: string) => {
    if (status === "todo") {
        return optimisticTodos.filter(t => t.status === "todo" || (!t.status && !t.completed));
    }
    if (status === "done") {
        return optimisticTodos.filter(t => t.status === "done" || (!t.status && t.completed));
    }
    return optimisticTodos.filter(t => t.status === status);
  };

  const handleAddTodo = async (formData: FormData) => {
    const text = formData.get("text") as string;
    if (!text?.trim()) return;

    formRef.current?.reset();
    
    startTransition(async () => {
        addOptimisticTodo({ type: "add", payload: { text, type: "kanban" } });
        const result = await addTodo(formData);
        if (result?.error) {
            toast.error(result.error);
        }
    });
  };

  const moveTask = async (id: number, nextStatus: string) => {
    startTransition(async () => {
        addOptimisticTodo({ type: "move", payload: { id, status: nextStatus } });
        const result = await updateTodoStatus(id, nextStatus);
        if (result?.error) {
            toast.error(result.error);
        }
    });
  };

  const handleDeleteTodo = async (id: number) => {
    startTransition(async () => {
        addOptimisticTodo({ type: "delete", payload: { id } });
        const result = await deleteTodo(id);
        if (result?.error) {
            toast.error(result.error);
        }
    });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Project Board</h2>
          <form
            action={handleAddTodo}
            ref={formRef}
            className="flex gap-2 w-full max-w-sm"
          >
            <Input name="text" placeholder="Add a project task..." className="bg-background" autoComplete="off" />
            <input type="hidden" name="type" value="kanban" />
            <Button type="submit" disabled={isPending}>
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
                                    <DropdownMenu 
                                        open={openMenuId === todo.id} 
                                        onOpenChange={(open) => !open && setOpenMenuId(null)}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon-sm" 
                                                className="h-6 w-6 shrink-0 text-muted-foreground relative before:absolute before:-inset-3 before:content-['']"
                                                onMouseEnter={() => setOpenMenuId(todo.id)}
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            align="end" 
                                            onMouseLeave={() => setOpenMenuId(null)}
                                        >
                                            {COLUMNS.filter(c => c.id !== col.id).map(targetCol => (
                                                <DropdownMenuItem 
                                                    key={targetCol.id}
                                                    onClick={() => moveTask(todo.id, targetCol.id)}
                                                >
                                                    Move to {targetCol.label}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                onClick={() => handleDeleteTodo(todo.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
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
