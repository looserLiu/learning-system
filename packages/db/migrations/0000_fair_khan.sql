CREATE TYPE "public"."achievement_type" AS ENUM('progress', 'knowledge', 'streak', 'custom');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."knowledge_type" AS ENUM('article', 'video', 'code', 'podcast');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('achievement', 'reminder', 'system', 'due_review');--> statement-breakpoint
CREATE TYPE "public"."study_session_type" AS ENUM('learn', 'review', 'practice');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('learner', 'admin');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"type" "achievement_type" NOT NULL,
	"condition" jsonb NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"progress" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"knowledge_id" uuid,
	"model" text NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_html" text,
	"type" "knowledge_type" DEFAULT 'article' NOT NULL,
	"category" text,
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"estimated_minutes" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_tags" (
	"knowledge_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "knowledge_tags_knowledge_id_tag_id_pk" PRIMARY KEY("knowledge_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"knowledge_id" uuid NOT NULL,
	"content" text NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"knowledge_id" uuid NOT NULL,
	"type" "study_session_type" DEFAULT 'learn' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer,
	"focus_score" integer,
	"progress_percent" double precision,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"ease_factor" double precision DEFAULT 2.5 NOT NULL,
	"reps_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'learner' NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_tags" ADD CONSTRAINT "knowledge_tags_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_tags" ADD CONSTRAINT "knowledge_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_user_knowledge_idx" ON "notes" USING btree ("user_id","knowledge_id");--> statement-breakpoint
CREATE INDEX "notif_user_unread_idx" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "study_user_started_idx" ON "study_sessions" USING btree ("user_id","started_at");