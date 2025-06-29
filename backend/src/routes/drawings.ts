import { Hono } from "hono";
import { eq, and, desc, count, like } from "drizzle-orm";
import { db } from "@/db";
import { drawings } from "@/db/drawing.schema";
import {
	requireAuth,
	requireDrawingOwnership,
	requireDrawingAccess,
	buildDrawingCategoryFilter,
	formatDrawingResponse,
	checkDrawingExists,
	createInitialDrawingContent,
} from "@/lib/drawings";
import {
	CreateDrawingSchema,
	UpdateDrawingMetadataSchema,
	QueryDrawingsSchema,
	isValidUUID,
	type Drawing,
	type AccessResult,
} from "@/types/drawing";

const app = new Hono();

// GET /api/drawings - Get user's drawings list
app.get("/", requireAuth, async (c) => {
	try {
		const user = c.get("user");
		const query = c.req.query();

		// Validate and parse query parameters
		const parseResult = QueryDrawingsSchema.safeParse(query);
		if (!parseResult.success) {
			return c.json(
				{
					error: "Invalid query parameters",
					details: parseResult.error.errors,
				},
				400,
			);
		}

		const { category, page, pageSize, search } = parseResult.data;

		// Build where condition based on category
		let whereCondition = buildDrawingCategoryFilter(category, user.id);

		// Add search condition if provided
		if (search && search.trim()) {
			whereCondition = and(
				whereCondition,
				like(drawings.title, `%${search.trim()}%`),
			);
		}

		// Get total count for pagination
		const [totalResult] = await db
			.select({ count: count() })
			.from(drawings)
			.where(whereCondition);

		// Get drawings with pagination
		const offset = (page - 1) * pageSize;
		const userDrawings = await db
			.select()
			.from(drawings)
			.where(whereCondition)
			.orderBy(desc(drawings.updatedAt))
			.limit(pageSize)
			.offset(offset);

		return c.json({
			drawings: userDrawings.map(formatDrawingResponse),
			total: totalResult.count,
			page,
			pageSize,
			category,
		});
	} catch (error) {
		console.error("Error fetching drawings:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// POST /api/drawings/:id - Create new drawing with frontend-generated ID
app.post("/:id", requireAuth, async (c) => {
	try {
		const user = c.get("user");
		const drawingId = c.req.param("id");
		const body = await c.req.json();

		// Validate UUID format
		if (!isValidUUID(drawingId)) {
			return c.json({ error: "Invalid drawing ID format" }, 400);
		}

		// Check if drawing already exists
		const exists = await checkDrawingExists(drawingId);
		if (exists) {
			return c.json({ error: "Drawing already exists" }, 409);
		}

		// Validate request body
		const parseResult = CreateDrawingSchema.safeParse(body);
		if (!parseResult.success) {
			return c.json(
				{
					error: "Invalid request body",
					details: parseResult.error.errors,
				},
				400,
			);
		}

		const { title, description, content } = parseResult.data;

		// Create drawing and initial content in transaction
		const result = await db.transaction(async (tx) => {
			// Create drawing metadata
			const [drawing] = await tx
				.insert(drawings)
				.values({
					id: drawingId,
					ownerId: user.id,
					title,
					description: description || null,
				})
				.returning();

			// Create initial content
			await createInitialDrawingContent(drawingId, content);

			return drawing;
		});

		return c.json(
			{
				success: true,
				drawing: formatDrawingResponse(result),
			},
			201,
		);
	} catch (error) {
		console.error("Error creating drawing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// GET /api/drawings/:id - Get single drawing metadata with smart access control
app.get("/:id", requireDrawingAccess, async (c) => {
	try {
		const drawing = c.get("drawing");
		const access = c.get("access");

		return c.json({
			drawing: formatDrawingResponse(drawing),
			access: access,
		});
	} catch (error) {
		console.error("Error fetching drawing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// PATCH /api/drawings/:id - Update drawing metadata including all states (requires ownership)
app.patch("/:id", requireAuth, requireDrawingOwnership, async (c) => {
	try {
		const drawingId = c.req.param("id");
		const body = await c.req.json();

		// Validate request body
		const parseResult = UpdateDrawingMetadataSchema.safeParse(body);
		if (!parseResult.success) {
			return c.json(
				{
					error: "Invalid request body",
					details: parseResult.error.errors,
				},
				400,
			);
		}

		// Prepare update data
		const updateData: any = {
			...parseResult.data,
			updatedAt: new Date(),
		};

		// Handle soft delete state change
		if (parseResult.data.isDeleted !== undefined) {
			if (parseResult.data.isDeleted) {
				// Soft delete: set deletedAt timestamp
				updateData.deletedAt = new Date();
			} else {
				// Restore: clear deletedAt timestamp
				updateData.deletedAt = null;
			}
		}

		const [updatedDrawing] = await db
			.update(drawings)
			.set(updateData)
			.where(eq(drawings.id, drawingId))
			.returning();

		return c.json({
			success: true,
			drawing: formatDrawingResponse(updatedDrawing),
			message: `Drawing ${
				parseResult.data.isDeleted === true
					? "deleted"
					: parseResult.data.isDeleted === false
						? "restored"
						: "updated"
			} successfully`,
		});
	} catch (error) {
		console.error("Error updating drawing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// DELETE /api/drawings/:id - Permanently delete drawing from database (requires ownership)
app.delete("/:id", requireAuth, requireDrawingOwnership, async (c) => {
	try {
		const drawingId = c.req.param("id");

		// Permanently delete the drawing (cascade will delete content too)
		const deletedRows = await db
			.delete(drawings)
			.where(eq(drawings.id, drawingId))
			.returning({ id: drawings.id });

		if (deletedRows.length === 0) {
			return c.json({ error: "Drawing not found" }, 404);
		}

		return c.json({
			success: true,
			message: "Drawing permanently deleted",
			deletedId: deletedRows[0].id,
		});
	} catch (error) {
		console.error("Error permanently deleting drawing:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default app;
