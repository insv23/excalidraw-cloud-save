import { useEffect, useState } from "react";
import { useDrawingsStore } from "@/store/drawings-store";
import { drawingApi } from "@/lib/drawing-api";
import { ApiError } from "@/lib/api-client";
import type { Drawing, AccessResult } from "@/types/drawing";

interface UseDrawingResult {
	drawing: Drawing | null;
	access: AccessResult | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Hook to fetch and manage a single drawing
 * First checks the local store, then fetches from API if needed
 */
export function useDrawing(drawingId: string | undefined): UseDrawingResult {
	const getDrawingById = useDrawingsStore((state) => state.getDrawingById);
	const updateDrawing = useDrawingsStore((state) => state.updateDrawing);
	// Subscribe to the specific drawing in the store
	const storeDrawing = useDrawingsStore((state) => 
		drawingId ? state.getDrawingById(drawingId) : null
	);
	
	const [drawing, setDrawing] = useState<Drawing | null>(null);
	const [access, setAccess] = useState<AccessResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!drawingId) {
			setDrawing(null);
			setAccess(null);
			setError(null);
			return;
		}

		// First check if drawing exists in store
		if (storeDrawing) {
			setDrawing(storeDrawing);
			setAccess("ALLOWED"); // If it's in the store, user has access
			setIsLoading(false);
			return;
		}

		// If not in store, fetch from API
		let cancelled = false;

		const fetchDrawing = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await drawingApi.getDrawing(drawingId);
				
				if (!cancelled) {
					setDrawing(response.drawing);
					setAccess(response.access);
					
					// Update the store with the fetched drawing
					updateDrawing(response.drawing.id, response.drawing);
				}
			} catch (err) {
				if (!cancelled) {
					if (err instanceof ApiError) {
						// Handle specific error cases based on status code
						switch (err.status) {
							case 404:
								setError("Drawing not found");
								setAccess("NOT_FOUND");
								break;
							case 401:
								setError("Authentication required");
								setAccess("LOGIN_REQUIRED");
								break;
							case 403:
								setError("Access denied");
								setAccess("FORBIDDEN");
								break;
							case 410:
								setError("Drawing has been deleted");
								setAccess("DELETED");
								break;
							default:
								setError(err.message);
								setAccess(null);
						}
					} else if (err instanceof Error) {
						setError(err.message);
						setAccess(null);
					} else {
						setError("Failed to load drawing");
						setAccess(null);
					}
					setDrawing(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		fetchDrawing();

		return () => {
			cancelled = true;
		};
	}, [drawingId, storeDrawing, updateDrawing]);

	return { drawing, access, isLoading, error };
}