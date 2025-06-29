import type { Drawing, DrawingCategory, AccessResult } from "@/types/drawing";

/**
 * Filter drawings by category according to design document rules
 */
export function filterDrawingsByCategory(
	drawings: Drawing[],
	category: DrawingCategory,
): Drawing[] {
	const activeDrawings = drawings.filter((d) => !d.isDeleted);

	switch (category) {
		case "recent":
			return activeDrawings.filter((d) => !d.isArchived);
		case "pinned":
			return activeDrawings.filter((d) => d.isPinned);
		case "public":
			return activeDrawings.filter((d) => d.isPublic);
		case "archived":
			return activeDrawings.filter((d) => d.isArchived);
		case "trash":
			return drawings.filter((d) => d.isDeleted);
		default:
			return activeDrawings.filter((d) => !d.isArchived);
	}
}

/**
 * Validate user access to a specific drawing
 */
export function validateAccess(
	drawing: Drawing | null,
	user: { id: string } | null,
): AccessResult {
	// Drawing doesn't exist
	if (!drawing) return "NOT_FOUND";

	// Drawing is deleted - only owner can access in trash
	if (drawing.isDeleted) {
		return !user || drawing.ownerId !== user.id ? "DELETED" : "ALLOWED";
	}

	// Drawing is public
	if (drawing.isPublic) return "PUBLIC_ACCESS";

	// User not logged in and drawing is private
	if (!user) return "LOGIN_REQUIRED";

	// User doesn't have permission to access
	if (drawing.ownerId !== user.id) return "FORBIDDEN";

	return "ALLOWED";
}

/**
 * Generate UUID for new drawings
 */
export function generateDrawingId(): string {
	return crypto.randomUUID();
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: DrawingCategory): string {
	switch (category) {
		case "recent":
			return "Recent";
		case "pinned":
			return "Pinned";
		case "public":
			return "Public";
		case "archived":
			return "Archived";
		case "trash":
			return "Trash";
		default:
			return "Recent";
	}
}
