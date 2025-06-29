export interface Drawing {
	id: string;
	ownerId: string;
	title: string;
	description?: string;
	isPinned: boolean;
	isPublic: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

export interface DrawingContent {
	drawingId: string;
	elements: unknown[];
	appState: Record<string, unknown>;
	files: Record<string, unknown>;
}

export type DrawingCategory =
	| "recent"
	| "pinned"
	| "public"
	| "archived"
	| "trash";

export type AccessResult =
	| "NOT_FOUND"
	| "DELETED"
	| "PUBLIC_ACCESS"
	| "LOGIN_REQUIRED"
	| "FORBIDDEN"
	| "ALLOWED";

export type ErrorType = "not-found" | "private" | "deleted" | "forbidden";
