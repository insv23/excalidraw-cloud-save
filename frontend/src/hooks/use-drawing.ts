import { useState, useEffect } from "react";
import { drawingApi } from "@/lib/drawing-api";
import type { Drawing } from "@/types/drawing";
import { toast } from "sonner";

interface UseDrawingResult {
	drawing: Drawing | null;
	isLoading: boolean;
	error: string | null;
	access: "ALLOWED" | "PUBLIC_ACCESS" | null;
	refetch: () => void;
}

/**
 * Hook to fetch a single drawing by ID
 */
export function useDrawing(id: string | undefined): UseDrawingResult {
	const [drawing, setDrawing] = useState<Drawing | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [access, setAccess] = useState<"ALLOWED" | "PUBLIC_ACCESS" | null>(null);

	const fetchDrawing = async () => {
		if (!id) {
			setDrawing(null);
			setAccess(null);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await drawingApi.getDrawing(id);
			setDrawing(response.drawing);
			setAccess(response.access);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to load drawing";
			setError(errorMessage);
			
			// Don't show toast for expected errors like 404
			if (!(err instanceof Error && err.message.includes("404"))) {
				toast.error(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDrawing();
	}, [id]);

	return {
		drawing,
		isLoading,
		error,
		access,
		refetch: fetchDrawing,
	};
}