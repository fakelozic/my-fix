"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  return await db.select().from(todos).orderBy(todos.createdAt);
}

export async function addTodo(formData: FormData) {
  const text = formData.get("text") as string;
  const duration = parseInt(formData.get("duration") as string) || 30;
  
  if (!text || text.trim().length === 0) return;

  await db.insert(todos).values({
    text,
    duration,
    status: "todo",
    completed: false,
    createdAt: new Date(),
  });

  revalidatePath("/");
}

export async function toggleTodo(id: number, completed: boolean) {
  await db
    .update(todos)
    .set({ 
      completed,
      status: completed ? "done" : "todo",
      completedAt: completed ? new Date() : null 
    })
    .where(eq(todos.id, id));
  revalidatePath("/");
}

export async function updateTodoStatus(id: number, status: string) {
  const completed = status === "done";
  await db
    .update(todos)
    .set({ 
      status, 
      completed,
      completedAt: completed ? new Date() : null
    })
    .where(eq(todos.id, id));
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  await db.delete(todos).where(eq(todos.id, id));
  revalidatePath("/");
}
