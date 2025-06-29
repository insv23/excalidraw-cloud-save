import { z } from "zod";

// Drawing categories for filtering
export type DrawingCategory = "recent" | "pinned" | "public" | "archived" | "trash";

// Database Drawing type - matches the database schema exactly
export type Drawing = {
	id: string;
	ownerId: string;
	title: string;
	description: string | null;
	isPinned: boolean;
	isPublic: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
};

// Access control results
export type AccessResult = 
	| "ALLOWED" 
	| "PUBLIC_ACCESS" 
	| "NOT_FOUND" 
	| "LOGIN_REQUIRED" 
	| "FORBIDDEN" 
	| "DELETED";

// Excalidraw data types
export type ExcalidrawElement = Record<string, unknown>;
export type ExcalidrawAppState = Record<string, unknown>;
export type ExcalidrawFiles = Record<string, unknown>;

// Drawing content structure
export interface DrawingContent {
	drawingId: string;
	elements: ExcalidrawElement[];
	appState: ExcalidrawAppState;
	files: ExcalidrawFiles;
}

// Default empty drawing content
export const EMPTY_DRAWING_CONTENT = {
	elements: [],
	appState: {
		theme: "light",
		viewBackgroundColor: "#ffffff",
		currentItemStrokeColor: "#000000",
		currentItemBackgroundColor: "transparent",
		currentItemFillStyle: "solid",
		currentItemStrokeWidth: 1,
		currentItemStrokeStyle: "solid",
		currentItemRoughness: 1,
		currentItemOpacity: 100,
		currentItemFontFamily: 1,
		currentItemFontSize: 20,
		currentItemTextAlign: "left",
		gridSize: null,
		colorPalette: {},
	},
	files: {},
} as const;

// Request/Response schemas
export const CreateDrawingSchema = z.object({
	title: z.string().min(1).max(255).optional().default("Untitled Drawing"),
	description: z.string().max(1000).optional(),
	content: z.object({
		elements: z.array(z.record(z.unknown())).optional().default([]),
		appState: z.record(z.unknown()).optional().default(EMPTY_DRAWING_CONTENT.appState),
		files: z.record(z.unknown()).optional().default({}),
	}).optional(),
});

export const UpdateDrawingMetadataSchema = z.object({
	title: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	isPinned: z.boolean().optional(),
	isPublic: z.boolean().optional(),
	isArchived: z.boolean().optional(),
	isDeleted: z.boolean().optional(), // 支持软删除
});

export const SaveContentSchema = z.object({
	elements: z.array(z.record(z.unknown())),
	appState: z.record(z.unknown()),
	files: z.record(z.unknown()),
	lastModified: z.string().optional(), // ISO timestamp for optimistic locking
});

export const QueryDrawingsSchema = z.object({
	category: z.enum(["recent", "pinned", "public", "archived", "trash"]).optional().default("recent"),
	page: z.coerce.number().min(1).optional().default(1),
	pageSize: z.coerce.number().min(1).max(100).optional().default(50),
	search: z.string().optional(),
});

// Response types
export interface DrawingResponse {
	id: string;
	ownerId: string;
	title: string;
	description: string | null;
	isPinned: boolean;
	isPublic: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface DrawingContentResponse {
	drawingId: string;
	elements: ExcalidrawElement[];
	appState: ExcalidrawAppState;
	files: ExcalidrawFiles;
}

export interface DrawingsListResponse {
	drawings: DrawingResponse[];
	total: number;
	page: number;
	pageSize: number;
}

// Error types
export interface APIError {
	error: string;
	code?: string;
	details?: unknown;
}

// Type guards and utility functions
export function isValidDrawingCategory(category: string): category is DrawingCategory {
	return ["recent", "pinned", "public", "archived", "trash"].includes(category);
}

export function isValidUUID(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}

// Inferred types
export type CreateDrawingInput = z.infer<typeof CreateDrawingSchema>;
export type UpdateDrawingMetadataInput = z.infer<typeof UpdateDrawingMetadataSchema>;
export type SaveContentInput = z.infer<typeof SaveContentSchema>;
export type QueryDrawingsInput = z.infer<typeof QueryDrawingsSchema>;