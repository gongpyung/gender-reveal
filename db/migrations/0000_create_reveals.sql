CREATE TABLE "reveals" (
	"token" text PRIMARY KEY NOT NULL,
	"baby_nickname" text NOT NULL,
	"due_date" text NOT NULL,
	"recipient_name" text NOT NULL,
	"baby_gender" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "baby_gender_check" CHECK ("reveals"."baby_gender" IN ('son', 'daughter'))
);
