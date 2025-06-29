import type { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { drawings, drawingContents } from "@/db/drawing.schema";
import { auth } from "./auth";
import type {
	Drawing,
	AccessResult,
	DrawingCategory,
	DrawingResponse,
	DrawingContent,
	ExcalidrawElement,
	ExcalidrawAppState,
	ExcalidrawFiles,
} from "@/types/drawing";
import { isValidUUID, EMPTY_DRAWING_CONTENT } from "@/types/drawing";

// Get authenticated user from request
export async function getAuthenticatedUser(c: Context) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	return session?.user || null;
}

// Validate access to a drawing - smart permission checking
export function validateDrawingAccess(
	drawing: Drawing | null,
	user: { id: string } | null,
): AccessResult {
	// Drawing doesn't exist
	if (!drawing) return "NOT_FOUND";

	// Drawing is deleted - only owner can access in trash
	if (drawing.isDeleted) {
		return !user || drawing.ownerId !== user.id ? "DELETED" : "ALLOWED";
	}

	// Drawing is public - anyone can access
	if (drawing.isPublic) return "PUBLIC_ACCESS";

	// User not logged in and drawing is private
	if (!user) return "LOGIN_REQUIRED";

	// User doesn't have permission to access private drawing
	if (drawing.ownerId !== user.id) return "FORBIDDEN";

	return "ALLOWED";
}


// Filter drawings by category
export function buildDrawingCategoryFilter(
	category: DrawingCategory,
	userId: string,
) {
	const baseCondition = eq(drawings.ownerId, userId);

	switch (category) {
		case "recent":
			return and(
				baseCondition,
				eq(drawings.isDeleted, false),
				eq(drawings.isArchived, false),
			);
		case "pinned":
			return and(
				baseCondition,
				eq(drawings.isDeleted, false),
				eq(drawings.isPinned, true),
			);
		case "public":
			return and(
				baseCondition,
				eq(drawings.isDeleted, false),
				eq(drawings.isPublic, true),
			);
		case "archived":
			return and(
				baseCondition,
				eq(drawings.isDeleted, false),
				eq(drawings.isArchived, true),
			);
		case "trash":
			return and(baseCondition, eq(drawings.isDeleted, true));
		default:
			return and(
				baseCondition,
				eq(drawings.isDeleted, false),
				eq(drawings.isArchived, false),
			);
	}
}

// Convert database drawing to response format
export function formatDrawingResponse(drawing: Drawing): DrawingResponse {
	return {
		id: drawing.id,
		ownerId: drawing.ownerId,
		title: drawing.title,
		description: drawing.description,
		isPinned: drawing.isPinned,
		isPublic: drawing.isPublic,
		isArchived: drawing.isArchived,
		isDeleted: drawing.isDeleted,
		createdAt: drawing.createdAt.toISOString(),
		updatedAt: drawing.updatedAt.toISOString(),
		deletedAt: drawing.deletedAt ? drawing.deletedAt.toISOString() : null,
	};
}

// Get drawing by ID with smart permission check
export async function getDrawingWithPermission(
	drawingId: string,
	user: { id: string } | null,
) {
	const drawing = await db
		.select()
		.from(drawings)
		.where(eq(drawings.id, drawingId))
		.limit(1);

	if (!drawing.length) {
		return { drawing: null, access: "NOT_FOUND" as AccessResult };
	}

	const accessResult = validateDrawingAccess(drawing[0], user);

	if (accessResult === "ALLOWED" || accessResult === "PUBLIC_ACCESS") {
		return { drawing: drawing[0], access: accessResult };
	}

	return { drawing: null, access: accessResult };
}

// Get drawing content
export async function getDrawingContent(
	drawingId: string,
): Promise<DrawingContent | null> {
	const content = await db
		.select()
		.from(drawingContents)
		.where(eq(drawingContents.drawingId, drawingId))
		.limit(1);

	if (!content.length) {
		return null;
	}

	return {
		drawingId,
		elements: content[0].elements as ExcalidrawElement[],
		appState: content[0].appState as ExcalidrawAppState,
		files: content[0].files as ExcalidrawFiles,
	};
}

// Create drawing with content in a transaction
export async function createDrawingWithContent(params: {
	id: string;
	ownerId: string;
	title?: string;
	description?: string | null;
	content?: {
		elements?: ExcalidrawElement[];
		appState?: ExcalidrawAppState;
		files?: ExcalidrawFiles;
	};
}): Promise<Drawing> {
	return db.transaction(async (tx) => {
		// Create drawing metadata
		const [drawing] = await tx
			.insert(drawings)
			.values({
				id: params.id,
				ownerId: params.ownerId,
				title: params.title || "Untitled Drawing",
				description: params.description || null,
			})
			.returning();

		// Prepare content data with defaults
		const contentData = {
			elements: params.content?.elements || EMPTY_DRAWING_CONTENT.elements,
			appState: params.content?.appState || EMPTY_DRAWING_CONTENT.appState,
			files: params.content?.files || EMPTY_DRAWING_CONTENT.files,
		};

		// Create drawing content
		await tx.insert(drawingContents).values({
			drawingId: params.id,
			elements: contentData.elements,
			appState: contentData.appState,
			files: contentData.files,
		});

		return drawing;
	});
}

// Create initial drawing content (kept for backward compatibility if needed elsewhere)
export async function createInitialDrawingContent(
	drawingId: string,
	content?: {
		elements?: ExcalidrawElement[];
		appState?: ExcalidrawAppState;
		files?: ExcalidrawFiles;
	},
	tx: typeof db = db,
) {
	const contentData = {
		elements: content?.elements || EMPTY_DRAWING_CONTENT.elements,
		appState: content?.appState || EMPTY_DRAWING_CONTENT.appState,
		files: content?.files || EMPTY_DRAWING_CONTENT.files,
	};

	await tx.insert(drawingContents).values({
		drawingId,
		elements: contentData.elements,
		appState: contentData.appState,
		files: contentData.files,
	});
}

// Update drawing content
export async function updateDrawingContent(
	drawingId: string,
	elements: ExcalidrawElement[],
	appState: ExcalidrawAppState,
	files: ExcalidrawFiles,
) {
	await db
		.update(drawingContents)
		.set({ elements, appState, files })
		.where(eq(drawingContents.drawingId, drawingId));

	// Update drawing's updatedAt timestamp
	await db
		.update(drawings)
		.set({ updatedAt: new Date() })
		.where(eq(drawings.id, drawingId));
}

// Middleware: Require authentication
export async function requireAuth(c: Context, next: () => Promise<void>) {
	const user = await getAuthenticatedUser(c);
	if (!user) {
		return c.json({ error: "Authentication required" }, 401);
	}

	c.set("user", user);
	await next();
}

// Middleware: Require drawing ownership (for write operations)
export async function requireDrawingOwnership(
	c: Context,
	next: () => Promise<void>,
) {
	const user = c.get("user");
	const drawingId = c.req.param("id");

	if (!user || !drawingId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	// Validate UUID format
	if (!isValidUUID(drawingId)) {
		return c.json({ error: "Invalid drawing ID format" }, 400);
	}

	const drawing = await db
		.select()
		.from(drawings)
		.where(and(eq(drawings.id, drawingId), eq(drawings.ownerId, user.id)))
		.limit(1);

	if (!drawing.length) {
		return c.json({ error: "Drawing not found" }, 404);
	}

	c.set("drawing", drawing[0]);
	await next();
}

// Middleware: Smart drawing access (for read operations) - supports public access
export async function requireDrawingAccess(
	c: Context,
	next: () => Promise<void>,
) {
	const user = await getAuthenticatedUser(c);
	const drawingId = c.req.param("id");

	if (!drawingId) {
		return c.json({ error: "Drawing ID required" }, 400);
	}

	// Validate UUID format
	if (!isValidUUID(drawingId)) {
		return c.json({ error: "Invalid drawing ID format" }, 400);
	}

	const { drawing, access } = await getDrawingWithPermission(drawingId, user);

	if (!drawing) {
		switch (access) {
			case "NOT_FOUND":
				return c.json({ error: "Drawing not found" }, 404);
			case "LOGIN_REQUIRED":
				return c.json(
					{ error: "Authentication required to access this drawing" },
					401,
				);
			case "FORBIDDEN":
				return c.json({ error: "Access denied" }, 403);
			case "DELETED":
				return c.json({ error: "Drawing has been deleted" }, 410);
			default:
				return c.json({ error: "Access denied" }, 403);
		}
	}

	c.set("drawing", drawing);
	c.set("access", access);
	c.set("user", user);
	await next();
}

// Utility: Check if drawing exists (for POST to avoid duplicates)
export async function checkDrawingExists(drawingId: string): Promise<boolean> {
	const existing = await db
		.select({ id: drawings.id })
		.from(drawings)
		.where(eq(drawings.id, drawingId))
		.limit(1);

	return existing.length > 0;
}
