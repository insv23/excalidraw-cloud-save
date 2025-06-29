import { Excalidraw } from "@excalidraw/excalidraw";
import { memo } from "react";
import "@excalidraw/excalidraw/index.css";

interface ExcalidrawCanvasProps {
	drawingId: string;
}

export const ExcalidrawCanvas = memo(function ExcalidrawCanvas({
	drawingId,
}: ExcalidrawCanvasProps) {
	return (
		<div className="w-full h-full">
			<Excalidraw
				key={drawingId}
				theme="light"
				// We can add more props here later for customization
			/>
		</div>
	);
});
