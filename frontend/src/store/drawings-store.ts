import { create } from "zustand";
import type { Drawing, DrawingCategory } from "@/types/drawing";
import { generateDrawingId } from "@/lib/drawing-utils";
import { drawingApi } from "@/lib/drawing-api";
import { toast } from "sonner";

interface DrawingsState {
	// Data
	drawings: Drawing[];
	
	// Loading states
	isLoading: boolean;
	isCreating: boolean;
	
	// Error state
	error: string | null;
	
	// Actions
	fetchDrawings: (params?: { category?: DrawingCategory; search?: string }) => Promise<void>;
	getDrawingById: (id: string | null | undefined) => Drawing | null;
	createNewDrawing: (user: { id: string }) => Promise<Drawing | null>;
	updateDrawing: (id: string, updates: Partial<Drawing>) => Promise<void>;
	deleteDrawing: (id: string, permanent?: boolean) => Promise<void>;
	restoreDrawing: (id: string) => Promise<void>;
	togglePin: (id: string) => Promise<void>;
	togglePublic: (id: string) => Promise<void>;
	toggleArchive: (id: string) => Promise<void>;
	
	// Optimistic updates
	optimisticUpdate: (id: string, updates: Partial<Drawing>) => void;
	
	// Clear error
	clearError: () => void;
}

export const useDrawingsStore = create<DrawingsState>((set, get) => ({
	drawings: [],
	isLoading: false,
	isCreating: false,
	error: null,

	fetchDrawings: async (params) => {
		set({ isLoading: true, error: null });
		
		try {
			const response = await drawingApi.listDrawings(params);
			set({ drawings: response.drawings, isLoading: false });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to load drawings";
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
		}
	},

	getDrawingById: (id) => {
		if (!id) return null;
		return get().drawings.find((d) => d.id === id) || null;
	},

	createNewDrawing: async (user) => {
		set({ isCreating: true, error: null });
		
		const newDrawingId = generateDrawingId();
		const optimisticDrawing: Drawing = {
			id: newDrawingId,
			ownerId: user.id,
			title: "Untitled Drawing",
			description: "",
			isPinned: false,
			isPublic: false,
			isArchived: false,
			isDeleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Optimistically add the drawing
		set((state) => ({
			drawings: [optimisticDrawing, ...state.drawings],
		}));

		try {
			const response = await drawingApi.createDrawing(newDrawingId, {
				title: optimisticDrawing.title,
				description: optimisticDrawing.description,
			});
			
			// Update with server response
			set((state) => ({
				drawings: state.drawings.map((d) =>
					d.id === newDrawingId ? response.drawing : d
				),
				isCreating: false,
			}));
			
			toast.success("Drawing created successfully");
			return response.drawing;
		} catch (error) {
			// Remove optimistic drawing on error
			set((state) => ({
				drawings: state.drawings.filter((d) => d.id !== newDrawingId),
				isCreating: false,
				error: error instanceof Error ? error.message : "Failed to create drawing",
			}));
			toast.error("Failed to create drawing");
			return null;
		}
	},

	updateDrawing: async (id, updates) => {
		// Store original state for rollback
		const originalDrawing = get().getDrawingById(id);
		if (!originalDrawing) return;

		// Optimistic update
		get().optimisticUpdate(id, updates);

		try {
			const response = await drawingApi.updateDrawing(id, updates);
			
			// Update with server response
			set((state) => ({
				drawings: state.drawings.map((d) =>
					d.id === id ? response.drawing : d
				),
			}));
		} catch (error) {
			// Rollback on error
			set((state) => ({
				drawings: state.drawings.map((d) =>
					d.id === id ? originalDrawing : d
				),
			}));
			toast.error("Failed to update drawing");
		}
	},

	deleteDrawing: async (id, permanent = false) => {
		if (permanent) {
			// Permanent deletion
			const confirmDelete = window.confirm(
				"Are you sure you want to permanently delete this drawing? This cannot be undone."
			);
			if (!confirmDelete) return;

			set((state) => ({
				drawings: state.drawings.filter((d) => d.id !== id),
			}));

			try {
				await drawingApi.deleteDrawing(id);
				toast.success("Drawing permanently deleted");
			} catch (error) {
				// Re-fetch to restore state
				get().fetchDrawings();
				toast.error("Failed to delete drawing");
			}
		} else {
			// Soft delete
			await get().updateDrawing(id, { isDeleted: true });
		}
	},

	restoreDrawing: async (id) => {
		await get().updateDrawing(id, { isDeleted: false });
	},

	togglePin: async (id) => {
		const drawing = get().getDrawingById(id);
		if (drawing) {
			await get().updateDrawing(id, { isPinned: !drawing.isPinned });
		}
	},

	togglePublic: async (id) => {
		const drawing = get().getDrawingById(id);
		if (drawing) {
			await get().updateDrawing(id, { isPublic: !drawing.isPublic });
		}
	},

	toggleArchive: async (id) => {
		const drawing = get().getDrawingById(id);
		if (drawing) {
			await get().updateDrawing(id, { isArchived: !drawing.isArchived });
		}
	},

	optimisticUpdate: (id, updates) => {
		set((state) => ({
			drawings: state.drawings.map((d) =>
				d.id === id
					? {
							...d,
							...updates,
							updatedAt: new Date().toISOString(),
							// Handle soft delete
							...(updates.isDeleted !== undefined && {
								deletedAt: updates.isDeleted ? new Date().toISOString() : undefined,
							}),
					  }
					: d
			),
		}));
	},

	clearError: () => set({ error: null }),
}));