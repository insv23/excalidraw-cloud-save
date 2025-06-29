import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth.schema";

export const drawings = sqliteTable("drawings", {
	id: text("id").primaryKey(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
	isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
	isArchived: integer("is_archived", { mode: "boolean" })
		.notNull()
		.default(false),
	isDeleted: integer("is_deleted", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const drawingContents = sqliteTable("drawing_contents", {
	drawingId: text("drawing_id")
		.primaryKey()
		.references(() => drawings.id, { onDelete: "cascade" }),
	elements: text("elements", { mode: "json" })
		.notNull()
		.$defaultFn(() => []),
	appState: text("app_state", { mode: "json" })
		.notNull()
		.$defaultFn(() => ({})),
	files: text("files", { mode: "json" })
		.notNull()
		.$defaultFn(() => ({})),
});
