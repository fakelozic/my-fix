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
  if (!text || text.trim().length === 0) return;

  await db.insert(todos).values({
    text,
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
      completedAt: completed ? new Date() : null 
    })
    .where(eq(todos.id, id));
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  await db.delete(todos).where(eq(todos.id, id));
  revalidatePath("/");
}
