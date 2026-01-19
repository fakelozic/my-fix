import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  duration: integer("duration").notNull().default(30),
  status: text("status").notNull().default("todo"), // 'todo', 'in-progress', 'done'
  type: text("type").notNull().default("daily"), // 'daily', 'kanban'
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
