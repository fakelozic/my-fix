"use client";

import { useRef, useState } from "react";
import { Todo } from "@/db/schema";
import { updateTodoStatus, addTodo } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Circle, Clock, CheckCircle2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";

interface KanbanBoardProps {
  todos: Todo[];
}

const COLUMNS = [
  { id: "todo", label: "To Do", icon: Circle, color: "text-slate-500" },
  { id: "in-progress", label: "In Progress", icon: Clock, color: "text-blue-500" },
  { id: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

function TaskCard({ todo, moveTask, colId, isOverlay, isDragging }: { todo: Todo, moveTask?: any, colId?: string, isOverlay?: boolean, isDragging?: boolean }) {
  return (
    <Card className={cn("bg-background shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing", isDragging && "opacity-50", isOverlay && "shadow-xl ring-2 ring-primary/20 opacity-100 cursor-grabbing")}>
        <CardContent className="p-3 flex flex-col gap-2">
            <p className="text-sm font-medium leading-snug">{todo.text}</p>
            <div className="flex items-center justify-end mt-2 h-6">
                {!isOverlay && moveTask && colId && (
                    <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}> 
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6"
                            disabled={colId === 'todo'}
                            onClick={() => moveTask(todo.id, colId, 'prev')}
                        >
                            <ArrowLeft className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6"
                            disabled={colId === 'done'}
                            onClick={() => moveTask(todo.id, colId, 'next')}
                        >
                            <ArrowRight className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

function DraggableCard({ todo, moveTask, colId }: { todo: Todo, moveTask: any, colId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id.toString(),
    data: { colId, todo },
  });
  
  // We don't apply transform here to the main element to avoid layout shift when using DragOverlay usually,
  // but standard dnd-kit practice without Sortable is to keep it or hide it.
  // If we want the item to "disappear" from list and appear in overlay, we hide it or set opacity 0.
  // But usually we want it dimmed.
  // Actually, if we use DragOverlay, we normally hide the original item or make it very faint.
  
  const style = transform ? {
    // transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, // Use DragOverlay instead
    opacity: isDragging ? 0 : 1, // Hide original completely
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
        <TaskCard todo={todo} moveTask={moveTask} colId={colId} isDragging={isDragging} />
    </div>
  );
}

function DroppableColumn({ col, todos, moveTask }: { col: typeof COLUMNS[0], todos: Todo[], moveTask: any }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  const Icon = col.icon;

  return (
    <div 
        ref={setNodeRef} 
        className={cn(
            "flex flex-col h-full bg-muted/30 rounded-xl border p-4 gap-4 transition-all duration-200",
            isOver && "bg-muted/60 border-primary/50 ring-2 ring-primary/10"
        )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
           <Icon className={cn("w-5 h-5", col.color)} />
           {col.label}
           <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
             {todos.length}
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
         {todos.length === 0 ? (
            <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
                Empty
            </div>
         ) : (
            todos.map(todo => (
                <DraggableCard key={todo.id} todo={todo} moveTask={moveTask} colId={col.id} />
            ))
         )}
      </div>
    </div>
  );
}

export function KanbanBoard({ todos }: KanbanBoardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const getColumnTodos = (status: string) => {
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
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= COLUMNS.length) newIndex = COLUMNS.length - 1;

    const newStatus = COLUMNS[newIndex].id;
    if (newStatus !== currentStatus) {
       await updateTodoStatus(id, newStatus);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveTodo(event.active.data.current?.todo);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTodo(null);

    if (!over) return;

    const todoId = parseInt(active.id as string);
    const newStatus = over.id as string;
    const currentStatus = active.data.current?.colId;

    if (newStatus && currentStatus && newStatus !== currentStatus) {
         await updateTodoStatus(todoId, newStatus);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            {COLUMNS.map((col) => (
                <DroppableColumn 
                    key={col.id} 
                    col={col} 
                    todos={getColumnTodos(col.id)} 
                    moveTask={moveTask} 
                />
            ))}
        </div>
        </div>
        <DragOverlay>
            {activeTodo ? <TaskCard todo={activeTodo} isOverlay /> : null}
        </DragOverlay>
    </DndContext>
  );
}