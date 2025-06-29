import { Excalidraw } from "@excalidraw/excalidraw";
import { memo, useCallback, useEffect, useState } from "react";
import "@excalidraw/excalidraw/index.css";
import { useDrawingContent } from "@/hooks/use-drawing-content";
import { useTheme } from "@/components/theme/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface ExcalidrawCanvasProps {
	drawingId: string;
}

export const ExcalidrawCanvas = memo(function ExcalidrawCanvas({
	drawingId,
}: ExcalidrawCanvasProps) {
	const { theme } = useTheme();
	const { content, isLoading, isSaving, saveContent } = useDrawingContent(drawingId, {
		autoSave: true,
		autoSaveDelay: 2000, // 2 seconds
	});

	// Track if we've loaded initial content
	const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

	// Handle content changes from Excalidraw
	const handleChange = useCallback(
		(elements: any, appState: any, files: any) => {
			// Don't save if we haven't loaded initial content yet
			if (!hasLoadedInitial) return;

			saveContent({
				elements: elements as unknown[],
				appState: appState as Record<string, unknown>,
				files: files as Record<string, unknown>,
			});
		},
		[saveContent, hasLoadedInitial],
	);

	// Mark as loaded once content is available
	useEffect(() => {
		if (content && !hasLoadedInitial) {
			setHasLoadedInitial(true);
		}
	}, [content, hasLoadedInitial]);

	// Reset loaded state when drawing changes
	useEffect(() => {
		setHasLoadedInitial(false);
	}, [drawingId]);

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
			/>
			{isSaving && (
				<div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm text-muted-foreground">
					Saving...
				</div>
			)}
		</div>
	);
});