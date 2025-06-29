import { useEffect } from "react";
import { useDrawingsStore } from "@/store/drawings-store";
import type { DrawingCategory } from "@/types/drawing";

/**
 * Hook to fetch and manage drawings list
 */
export function useDrawings(params?: {
	category?: DrawingCategory;
	search?: string;
}) {
	const {
		drawings,
		isLoading,
		error,
		fetchDrawings,
		clearError,
	} = useDrawingsStore();

	// Fetch drawings on mount and when params change
	useEffect(() => {
		fetchDrawings(params);
	}, [params?.category, params?.search]);

	return {
		drawings,
		isLoading,
		error,
		refetch: () => fetchDrawings(params),
		clearError,
	};
}