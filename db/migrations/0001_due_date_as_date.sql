ALTER TABLE "reveals"
ALTER COLUMN "due_date" TYPE date
USING "due_date"::date;
