import { Excalidraw } from "@excalidraw/excalidraw";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import "@excalidraw/excalidraw/index.css";
import { useDrawingContent } from "@/hooks/use-drawing-content";
import { useDrawing } from "@/hooks/use-drawing";
import { useTheme } from "@/components/theme/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface ExcalidrawCanvasProps {
	drawingId: string;
	onSaveStatusChange?: (status: { isSaving: boolean; hasUnsavedChanges: boolean; onSave: () => void }) => void;
}

export const ExcalidrawCanvas = memo(function ExcalidrawCanvas({
	drawingId,
	onSaveStatusChange,
}: ExcalidrawCanvasProps) {
	const { theme } = useTheme();
	const { drawing } = useDrawing(drawingId);
	const { content, isLoading, isSaving, saveContent, saveContentImmediately, hasUnsavedChanges } = useDrawingContent(drawingId, {
		autoSave: true,
		autoSaveDelay: 2000, // 2 seconds
		drawingUpdatedAt: drawing?.updatedAt,
	});

	// Track if we've loaded initial content
	const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
	// Store reference to current elements for manual save
	const currentContentRef = useRef<any>(null);
	// Store reference to last saved content for comparison
	const lastSavedContentRef = useRef<any>(null);

	// Handle content changes from Excalidraw
	const handleChange = useCallback(
		(elements: any, appState: any, files: any) => {
			// Don't save if we haven't loaded initial content yet
			if (!hasLoadedInitial) return;

			// Store current content for manual save
			currentContentRef.current = { elements, appState, files };

			// Compare with last saved content instead of React state
			const newElements = JSON.stringify(elements);
			const newFiles = JSON.stringify(files);
			const lastElements = lastSavedContentRef.current ? JSON.stringify(lastSavedContentRef.current.elements) : '';
			const lastFiles = lastSavedContentRef.current ? JSON.stringify(lastSavedContentRef.current.files) : '';
			
			const elementsChanged = newElements !== lastElements;
			const filesChanged = newFiles !== lastFiles;
			const hasChanged = elementsChanged || filesChanged;
			
			if (hasChanged) {
				// Update the last saved reference immediately to prevent duplicate saves
				lastSavedContentRef.current = { elements, appState, files };
				
				saveContent({
					elements: elements as unknown[],
					appState: appState as Record<string, unknown>,
					files: files as Record<string, unknown>,
				});
			}
		},
		[saveContent, hasLoadedInitial],
	);

	// Mark as loaded once content is available
	useEffect(() => {
		if (content && !hasLoadedInitial) {
			setHasLoadedInitial(true);
			// Set initial content as "last saved" to prevent immediate save
			lastSavedContentRef.current = {
				elements: content.elements,
				appState: content.appState,
				files: content.files,
			};
		}
	}, [content, hasLoadedInitial]);

	// Reset loaded state when drawing changes
	useEffect(() => {
		setHasLoadedInitial(false);
		lastSavedContentRef.current = null;
	}, [drawingId]);

	// Manual save function
	const handleManualSave = useCallback(() => {
		if (currentContentRef.current && hasLoadedInitial) {
			saveContentImmediately({
				elements: currentContentRef.current.elements as unknown[],
				appState: currentContentRef.current.appState as Record<string, unknown>,
				files: currentContentRef.current.files as Record<string, unknown>,
			});
		}
	}, [saveContentImmediately, hasLoadedInitial]);

	// Notify parent about save status changes
	useEffect(() => {
		if (onSaveStatusChange) {
			onSaveStatusChange({
				isSaving,
				hasUnsavedChanges,
				onSave: handleManualSave,
			});
		}
	}, [isSaving, hasUnsavedChanges, handleManualSave, onSaveStatusChange]);

	// Override Cmd/Ctrl+S to save to server
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 's') {
				e.preventDefault();
				handleManualSave();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleManualSave]);

	// Show loading skeleton while loading or content is not ready
	if (isLoading || !content) {
		return (
			<div className="w-full h-full p-4">
				<div className="space-y-4">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-[calc(100vh-120px)] w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full relative">
			<Excalidraw
				key={drawingId}
				theme={theme === "dark" ? "dark" : "light"}
				initialData={
					content
						? {
								elements: content.elements as any,
								appState: {
									...content.appState,
									// Force disable welcome screen to ensure content is shown
									showWelcomeScreen: false,
								} as any,
								files: content.files as any,
						  }
						: undefined
				}
				onChange={handleChange}
				UIOptions={{
					canvasActions: {
						saveToActiveFile: false,
						saveAsImage: true,
						export: {
							saveFileToDisk: false
						}
					}
				}}
			/>
			{isSaving && (
				<div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm text-muted-foreground">
					Saving...
				</div>
			)}
		</div>
	);
});