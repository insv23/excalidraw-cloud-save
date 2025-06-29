import { useState, useEffect, useCallback, useRef } from "react";
import { drawingApi } from "@/lib/drawing-api";
import type { DrawingContent } from "@/types/drawing";
import { toast } from "sonner";
import { debounce } from "@/lib/utils";

interface UseDrawingContentResult {
	content: DrawingContent | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	saveContent: (content: Omit<DrawingContent, "drawingId">) => void;
	refetch: () => void;
}

/**
 * Hook to fetch and save drawing content with auto-save functionality
 */
export function useDrawingContent(
	drawingId: string | undefined,
	options?: {
		autoSave?: boolean;
		autoSaveDelay?: number;
		drawingUpdatedAt?: string;
	},
): UseDrawingContentResult {
	const { autoSave = true, autoSaveDelay = 500, drawingUpdatedAt } = options || {};

	const [content, setContent] = useState<DrawingContent | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	// Track the last saved timestamp for optimistic locking
	const lastSavedAt = useRef<string | null>(null);

	// Fetch drawing content
	const fetchContent = useCallback(async () => {
		if (!drawingId) {
			setContent(null);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await drawingApi.getDrawingContent(drawingId);
			setContent(response.content);
			// Update last saved timestamp when fetching
			lastSavedAt.current = new Date().toISOString();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to load drawing content";
			setError(errorMessage);
			
			// Don't show toast for 404 errors (new drawings)
			if (!(err instanceof Error && err.message.includes("404"))) {
				toast.error(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	}, [drawingId]);

	// Save drawing content
	const saveContentImmediately = useCallback(
		async (contentToSave: Omit<DrawingContent, "drawingId">) => {
			if (!drawingId) return;

			setIsSaving(true);
			setError(null);

			try {
				const saveData = {
					elements: contentToSave.elements,
					appState: contentToSave.appState,
					files: contentToSave.files,
					lastModified: lastSavedAt.current || undefined,
				};

				const response = await drawingApi.saveDrawingContent(drawingId, saveData);
				
				// Update last saved timestamp on successful save
				lastSavedAt.current = response.updatedAt;
				
				// Update local content
				setContent({
					drawingId,
					...contentToSave,
				});
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to save drawing";
				setError(errorMessage);

				// Handle conflict errors specially
				if (drawingApi.isConflictError(err)) {
					toast.error(
						"Drawing has been modified by another session. Please reload to get the latest version.",
						{
							duration: 5000,
							action: {
								label: "Reload",
								onClick: () => window.location.reload(),
							},
						},
					);
				} else {
					toast.error(errorMessage);
				}
			} finally {
				setIsSaving(false);
			}
		},
		[drawingId],
	);

	// Debounced save for auto-save functionality
	// Recreate when drawingId changes to avoid saving to wrong drawing
	const debouncedSave = useRef<ReturnType<typeof debounce>>();
	
	useEffect(() => {
		// Cancel previous debounced function
		if (debouncedSave.current) {
			debouncedSave.current.cancel();
		}
		
		// Create new debounced function for this drawing
		debouncedSave.current = debounce(saveContentImmediately, autoSaveDelay);
		
		// Cleanup on unmount or when dependencies change
		return () => {
			debouncedSave.current?.cancel();
		};
	}, [saveContentImmediately, autoSaveDelay]);

	// Public save method that uses debouncing if auto-save is enabled
	const saveContent = useCallback(
		(contentToSave: Omit<DrawingContent, "drawingId">) => {
			if (autoSave && debouncedSave.current) {
				debouncedSave.current(contentToSave);
			} else {
				saveContentImmediately(contentToSave);
			}
		},
		[autoSave, saveContentImmediately],
	);

	// Reset state and fetch content when drawingId changes
	useEffect(() => {
		// Cancel any pending saves from previous drawing
		debouncedSave.current?.cancel();
		
		// Reset all state
		setContent(null);
		setError(null);
		setIsSaving(false);
		lastSavedAt.current = null;
		
		// Fetch new content
		fetchContent();
	}, [drawingId, fetchContent]);

	// Update lastSavedAt when drawing metadata is updated externally
	useEffect(() => {
		if (drawingUpdatedAt && lastSavedAt.current && drawingUpdatedAt > lastSavedAt.current) {
			lastSavedAt.current = drawingUpdatedAt;
		}
	}, [drawingUpdatedAt]);

	// Clean up debounced function on unmount
	useEffect(() => {
		return () => {
			debouncedSave.current?.cancel();
		};
	}, []);

	return {
		content,
		isLoading,
		isSaving,
		error,
		saveContent,
		refetch: fetchContent,
	};
}