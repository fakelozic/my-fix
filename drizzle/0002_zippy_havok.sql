CREATE TABLE "habit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"habits" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" integer
);
--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;