"use server";

import { db } from "@/db";
import { todos, quotes, kanbanTasks } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";

export async function getTodos() {
  const session = await getSession();
  if (!session?.user?.id) return [];
  
  const results = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(todos.createdAt);

  return results.map(item => ({ ...item, text: decrypt(item.text) }));
}

export async function getKanbanTasks() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const results = await db
    .select()
    .from(kanbanTasks)
    .where(eq(kanbanTasks.userId, session.user.id))
    .orderBy(kanbanTasks.createdAt);

  return results.map(item => ({ ...item, text: decrypt(item.text) }));
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
      text: encrypt(text),
      duration,
      status: "todo",
      type,
      completed: false,
      createdAt: new Date(),
      userId: session.user.id,
    }).returning();

    revalidatePath("/");
    return { data: { ...newTodo, text: decrypt(newTodo.text) } };
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
      text: encrypt(text),
      status: "todo",
      createdAt: new Date(),
      userId: session.user.id,
    }).returning();

    revalidatePath("/");
    return { data: { ...newTask, text: decrypt(newTask.text) } };
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

  // Get all quotes for the user to pick deterministically based on the hour
  const allUserQuotes = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, session.user.id))
    .orderBy(quotes.id);

  if (allUserQuotes.length === 0) return [];
  
  // Decrypt all quotes first
  const decryptedQuotes = allUserQuotes.map(q => ({ ...q, text: decrypt(q.text) }));
  
  if (decryptedQuotes.length <= 2) return decryptedQuotes;

  // Use the current hour since epoch to pick indices
  const hourIndex = Math.floor(Date.now() / (1000 * 60 * 60));
  
  const firstIndex = hourIndex % decryptedQuotes.length;
  const secondIndex = (hourIndex + 1) % decryptedQuotes.length;

  return [decryptedQuotes[firstIndex], decryptedQuotes[secondIndex]];
}

export async function getQuotes() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const results = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, session.user.id))
    .orderBy(quotes.createdAt);

  return results.map(item => ({ ...item, text: decrypt(item.text) }));
}

export async function addQuote(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const text = formData.get("text") as string;
  if (!text || text.trim().length === 0) return { error: "Text is required" };

  try {
    const [newQuote] = await db.insert(quotes).values({
      text: encrypt(text),
      createdAt: new Date(),
      userId: session.user.id,
    }).returning();

    revalidatePath("/");
    return { data: { ...newQuote, text: decrypt(newQuote.text) } };
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
