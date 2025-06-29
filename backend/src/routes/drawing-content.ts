import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { drawings } from "@/db/drawing.schema";
import {
	requireAuth,
	requireDrawingOwnership,
	requireDrawingAccess,
	getDrawingContent,
	updateDrawingContent,
} from "@/lib/drawings";
import {
	SaveContentSchema,
	type Drawing,
} from "@/types/drawing";

const app = new Hono();

// GET /api/drawings/:id/content - Get drawing content with smart access control
app.get("/:id/content", requireDrawingAccess, async (c) => {
	try {
		const drawingId = c.req.param("id");
		const drawing = c.get("drawing");
		
		// Additional check for deleted drawings (only owner can access)
		if (drawing.isDeleted) {
			const user = c.get("user");
			if (!user || drawing.ownerId !== user.id) {
				return c.json({ error: "Drawing has been deleted" }, 410);
			}
		}

		const content = await getDrawingContent(drawingId);

		if (!content) {
			return c.json({ error: "Drawing content not found" }, 404);
		}

		return c.json({ 
			content: {
				drawingId: content.drawingId,
				elements: content.elements,
				appState: content.appState,
				files: content.files,
			}
		});
	} catch (error) {
		console.error("Error fetching drawing content:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// PUT /api/drawings/:id/content - Save/update drawing content (requires ownership)
app.put("/:id/content", requireAuth, requireDrawingOwnership, async (c) => {
	try {
		const drawingId = c.req.param("id");
		const body = await c.req.json();
		const drawing = c.get("drawing");

		// Validate request body
		const parseResult = SaveContentSchema.safeParse(body);
		if (!parseResult.success) {
			return c.json({ 
				error: "Invalid request body",
				details: parseResult.error.errors 
			}, 400);
		}

		const { elements, appState, files, lastModified } = parseResult.data;

		// Check if drawing is deleted
		if (drawing.isDeleted) {
			return c.json({ error: "Cannot save content to deleted drawing" }, 400);
		}

		// Optimistic locking check if lastModified is provided
		if (lastModified) {
			const currentModified = drawing.updatedAt.getTime();
			const requestModified = new Date(lastModified).getTime();
			
			if (currentModified > requestModified) {
				return c.json({ 
					error: "Conflict: Drawing has been modified by another session",
					currentUpdatedAt: drawing.updatedAt.toISOString(),
					lastModified: lastModified
				}, 409);
			}
		}

		// Update content and timestamp
		await updateDrawingContent(drawingId, elements, appState, files);

		// Get updated timestamp
		const [updatedDrawing] = await db
			.select({ updatedAt: drawings.updatedAt })
			.from(drawings)
			.where(eq(drawings.id, drawingId))
			.limit(1);

		return c.json({ 
			success: true,
			updatedAt: updatedDrawing[0].updatedAt.toISOString(),
			message: "Drawing content saved successfully"
		});
	} catch (error) {
		console.error("Error saving drawing content:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default app;