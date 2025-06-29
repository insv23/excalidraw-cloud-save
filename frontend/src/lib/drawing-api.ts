import { api, ApiError } from "./api-client";
import type { Drawing, DrawingContent, DrawingCategory } from "@/types/drawing";

// API response types
interface DrawingsListResponse {
	drawings: Drawing[];
	total: number;
	page: number;
	pageSize: number;
	category: DrawingCategory;
}

interface DrawingResponse {
	drawing: Drawing;
	access: "ALLOWED" | "PUBLIC_ACCESS";
}

interface DrawingCreateResponse {
	success: boolean;
	drawing: Drawing;
}

interface DrawingUpdateResponse {
	success: boolean;
	drawing: Drawing;
	message: string;
}

interface DrawingDeleteResponse {
	success: boolean;
	message: string;
	deletedId: string;
}

interface DrawingContentResponse {
	content: DrawingContent;
}

interface DrawingContentSaveResponse {
	success: boolean;
	updatedAt: string;
	message: string;
}

// Request types
interface DrawingCreateRequest {
	title?: string;
	description?: string;
	content?: {
		elements: unknown[];
		appState: Record<string, unknown>;
		files: Record<string, unknown>;
	};
}

interface DrawingUpdateRequest {
	title?: string;
	description?: string;
	isPinned?: boolean;
	isPublic?: boolean;
	isArchived?: boolean;
	isDeleted?: boolean;
}

interface DrawingContentSaveRequest {
	elements: unknown[];
	appState: Record<string, unknown>;
	files: Record<string, unknown>;
	lastModified?: string;
}

export const drawingApi = {
	/**
	 * List user's drawings with filtering and pagination
	 */
	async listDrawings(params?: {
		category?: DrawingCategory;
		page?: number;
		pageSize?: number;
		search?: string;
	}): Promise<DrawingsListResponse> {
		return api.get<DrawingsListResponse>("/api/drawings", { params });
	},

	/**
	 * Create a new drawing with frontend-generated UUID
	 */
	async createDrawing(
		id: string,
		data?: DrawingCreateRequest,
	): Promise<DrawingCreateResponse> {
		// Validate UUID format
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(id)) {
			throw new ApiError(400, "Invalid UUID format");
		}

		return api.post<DrawingCreateResponse>(`/api/drawings/${id}`, data);
	},

	/**
	 * Get drawing metadata with access control
	 */
	async getDrawing(id: string): Promise<DrawingResponse> {
		return api.get<DrawingResponse>(`/api/drawings/${id}`);
	},

	/**
	 * Update drawing metadata (requires ownership)
	 */
	async updateDrawing(
		id: string,
		data: DrawingUpdateRequest,
	): Promise<DrawingUpdateResponse> {
		return api.patch<DrawingUpdateResponse>(`/api/drawings/${id}`, data);
	},

	/**
	 * Permanently delete drawing (requires ownership)
	 */
	async deleteDrawing(id: string): Promise<DrawingDeleteResponse> {
		return api.delete<DrawingDeleteResponse>(`/api/drawings/${id}`);
	},

	/**
	 * Get drawing canvas data with access control
	 */
	async getDrawingContent(id: string): Promise<DrawingContentResponse> {
		return api.get<DrawingContentResponse>(`/api/drawings/${id}/content`);
	},

	/**
	 * Save/update drawing canvas data (requires ownership)
	 */
	async saveDrawingContent(
		id: string,
		data: DrawingContentSaveRequest,
	): Promise<DrawingContentSaveResponse> {
		return api.put<DrawingContentSaveResponse>(`/api/drawings/${id}/content`, data);
	},

	/**
	 * Helper to handle save conflicts (409 status)
	 */
	isConflictError(error: unknown): error is ApiError {
		return error instanceof ApiError && error.status === 409;
	},

	/**
	 * Helper to check if error is authentication required
	 */
	isAuthRequired(error: unknown): boolean {
		return error instanceof ApiError && error.status === 401;
	},

	/**
	 * Helper to check if error is forbidden (no access)
	 */
	isForbidden(error: unknown): boolean {
		return error instanceof ApiError && error.status === 403;
	},

	/**
	 * Helper to check if resource is gone (soft deleted)
	 */
	isGone(error: unknown): boolean {
		return error instanceof ApiError && error.status === 410;
	},
};