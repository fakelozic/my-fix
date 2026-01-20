CREATE TABLE "kanban_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" integer
);
--> statement-breakpoint
ALTER TABLE "kanban_tasks" ADD CONSTRAINT "kanban_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;