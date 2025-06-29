import { create } from "zustand";
import type { Drawing } from "@/types/drawing";
import { mockDrawings } from "@/lib/mock-data";
import { generateDrawingId } from "@/lib/drawing-utils";

interface DrawingsState {
	drawings: Drawing[];
	getDrawingById: (id: string | null | undefined) => Drawing | null;
	deleteDrawing: (id: string) => void;
	restoreDrawing: (id: string) => void;
	togglePin: (id: string) => void;
	togglePublic: (id: string) => void;
	toggleArchive: (id: string) => void;
	createNewDrawing: (user: { id: string }) => Drawing;
}

export const useDrawingsStore = create<DrawingsState>((set, get) => ({
	drawings: mockDrawings,

	getDrawingById: (id) => {
		if (!id) return null;
		return get().drawings.find((d) => d.id === id) || null;
	},

	deleteDrawing: (id) => {
		set((state) => ({
			drawings: state.drawings.map((d) =>
				d.id === id
					? { ...d, isDeleted: true, deletedAt: new Date().toISOString() }
					: d,
			),
		}));
	},

	restoreDrawing: (id: string) => {
		set((state) => ({
			drawings: state.drawings.map((d) =>
				d.id === id ? { ...d, isDeleted: false, deletedAt: undefined } : d,
			),
		}));
	},

	togglePin: (id: string) => {
		set((state) => ({
			drawings: state.drawings.map((d) =>
				d.id === id ? { ...d, isPinned: !d.isPinned } : d,
			),
		}));
	},

	togglePublic: (id: string) => {
		set((state) => ({
			drawings: state.drawings.map((d) =>
				d.id === id ? { ...d, isPublic: !d.isPublic } : d,
			),
		}));
	},

	toggleArchive: (id: string) => {
		set((state) => ({
			drawings: state.drawings.map((d) =>
				d.id === id ? { ...d, isArchived: !d.isArchived } : d,
			),
		}));
	},

	createNewDrawing: (user) => {
		const newDrawingId = generateDrawingId();
		const newDrawing: Drawing = {
			id: newDrawingId,
			ownerId: user.id,
			title: "Untitled Drawing",
			description: "New drawing",
			isPinned: false,
			isPublic: false,
			isArchived: false,
			isDeleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		set((state) => ({
			drawings: [newDrawing, ...state.drawings],
		}));
		return newDrawing;
	},
}));
