import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gameProgress = sqliteTable('game_progress', {
  studentId: text('student_id').primaryKey(),
  resetVersion: integer('reset_version').notNull().default(0),
  revision: integer('revision').notNull().default(0),
  progressJson: text('progress_json').notNull().default('{}'),
  updatedAt: text('updated_at'),
  resetAt: text('reset_at'),
});

export const gameSessions = sqliteTable('game_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  studentId: text('student_id').notNull().references(() => gameProgress.studentId),
  resetVersion: integer('reset_version').notNull(),
  expiresAt: text('expires_at').notNull(),
});
