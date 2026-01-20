"use server";

import { db } from "@/db";
import { todos, quotes, kanbanTasks } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function getTodos() {
  const session = await getSession();
  if (!session?.user?.id) return [];
  
  return await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(todos.createdAt);
}

export async function getKanbanTasks() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(kanbanTasks)
    .where(eq(kanbanTasks.userId, session.user.id))
    .orderBy(kanbanTasks.createdAt);
}

export async function addTodo(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const text = formData.get("text") as string;
  const duration = parseInt(formData.get("duration") as string) || 30;
  const type = (formData.get("type") as string) || "daily";
  
  if (!text || text.trim().length === 0) return { error: "Text is required" };

  try {
    const [newTodo] = await db.insert(todos).values({
      text,
      duration,
      status: "todo",
      type,
      completed: false,
      createdAt: new Date(),
      userId: session.user.id,
    }).returning();

    revalidatePath("/");
    return { data: newTodo };
  } catch {
    return { error: "Failed to add task" };
  }
}

export async function addKanbanTask(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const text = formData.get("text") as string;
  
  if (!text || text.trim().length === 0) return { error: "Text is required" };

  try {
    const [newTask] = await db.insert(kanbanTasks).values({
      text,
      status: "todo",
      createdAt: new Date(),
      userId: session.user.id,
    }).returning();

    revalidatePath("/");
    return { data: newTask };
  } catch {
    return { error: "Failed to add kanban task" };
  }
}

export async function toggleTodo(id: number, completed: boolean) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db
      .update(todos)
      .set({ 
        completed,
        status: completed ? "done" : "todo",
        completedAt: completed ? new Date() : null 
      })
      .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to update task" };
  }
}

export async function updateTodoStatus(id: number, status: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const completed = status === "done";
  try {
    await db
      .update(todos)
      .set({ 
        status, 
        completed,
        completedAt: completed ? new Date() : null
      })
      .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to update status" };
  }
}

export async function updateKanbanTaskStatus(id: number, status: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db
      .update(kanbanTasks)
      .set({ 
        status, 
      })
      .where(and(eq(kanbanTasks.id, id), eq(kanbanTasks.userId, session.user.id)));
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to update status" };
  }
}

export async function deleteTodo(id: number) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete task" };
  }
}

export async function deleteKanbanTask(id: number) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.delete(kanbanTasks).where(and(eq(kanbanTasks.id, id), eq(kanbanTasks.userId, session.user.id)));
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete kanban task" };
  }
}

// Quote Actions

export async function getDailyQuotes() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  // Get 2 random quotes for this user
  return await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, session.user.id))
    .orderBy(sql`RANDOM()`)
    .limit(2);
}

export async function getQuotes() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, session.user.id))
    .orderBy(quotes.createdAt);
}

export async function addQuote(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const text = formData.get("text") as string;
  if (!text || text.trim().length === 0) return { error: "Text is required" };

  try {
    const [newQuote] = await db.insert(quotes).values({
      text,
      createdAt: new Date(),
      userId: session.user.id,
    }).returning();

    revalidatePath("/");
    return { data: newQuote };
  } catch {
    return { error: "Failed to add quote" };
  }
}

export async function deleteQuote(id: number) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.delete(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, session.user.id)));
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete quote" };
  }
}
