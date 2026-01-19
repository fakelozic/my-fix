"use server";

import { db } from "@/db";
import { todos, quotes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  return await db.select().from(todos).orderBy(todos.createdAt);
}

export async function addTodo(formData: FormData) {
  const text = formData.get("text") as string;
  const duration = parseInt(formData.get("duration") as string) || 30;
  const type = (formData.get("type") as string) || "daily";
  
  if (!text || text.trim().length === 0) return;

  await db.insert(todos).values({
    text,
    duration,
    status: "todo",
    type,
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

// Quote Actions

export async function getDailyQuotes() {
  // Get 2 random quotes
  return await db.select().from(quotes).orderBy(sql`RANDOM()`).limit(2);
}

export async function getQuotes() {
  return await db.select().from(quotes).orderBy(quotes.createdAt);
}

export async function addQuote(formData: FormData) {
  const text = formData.get("text") as string;
  if (!text || text.trim().length === 0) return;

  await db.insert(quotes).values({
    text,
    createdAt: new Date(),
  });

  revalidatePath("/");
}

export async function deleteQuote(id: number) {
  await db.delete(quotes).where(eq(quotes.id, id));
  revalidatePath("/");
}
