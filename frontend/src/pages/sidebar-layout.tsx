import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { LoginPromptSidebar } from "@/components/sidebar/app-sidebar-login-prompt";
import { EmptyState } from "@/components/sidebar-inset/empty-state";
import { ExcalidrawCanvas } from "@/components/sidebar-inset/excalidraw-canvas";
import { useSession } from "@/lib/auth-client";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { DrawingCategory } from "@/types/drawing";
import { validateAccess } from "@/lib/drawing-utils";
import { useDrawingsStore } from "@/store/drawings-store";

export default function SidebarLayout() {
	const { id: drawingId } = useParams<{ id: string }>();
	const { data: session, isPending } = useSession();
	const navigate = useNavigate();
	const [currentCategory, setCurrentCategory] =
		useState<DrawingCategory>("recent");
	const getDrawingById = useDrawingsStore((state) => state.getDrawingById);
	const createNewDrawing = useDrawingsStore((state) => state.createNewDrawing);

	// Memoize drawing data to avoid unnecessary lookups
	const currentDrawing = useMemo(() => {
		return getDrawingById(drawingId);
	}, [drawingId, getDrawingById]);

	// Memoize access validation result
	const accessResult = useMemo(() => {
		if (!drawingId || isPending) return null;
		const user = session?.user ? { id: session.user.id } : null;
		return validateAccess(currentDrawing, user);
	}, [drawingId, currentDrawing, session?.user, isPending]);

	// Access validation for drawing pages
	useEffect(() => {
		if (!drawingId || isPending || !accessResult) return;

		// Handle access denied cases
		switch (accessResult) {
			case "NOT_FOUND":
				navigate("/error/not-found");
				return;
			case "DELETED":
				navigate("/error/deleted");
				return;
			case "LOGIN_REQUIRED":
				navigate("/error/private");
				return;
			case "FORBIDDEN":
				navigate("/error/forbidden");
				return;
			case "PUBLIC_ACCESS":
			case "ALLOWED":
				// Access granted, continue to render
				break;
		}
	}, [accessResult, drawingId, isPending, navigate]);

	const handleCreateNew = () => {
		if (!session?.user) return; // Should not happen if button is shown
		const newDrawing = createNewDrawing(session.user);
		navigate(`/${newDrawing.id}`);
	};

	const isLoggedIn = session?.user;

	// Show loading state while session is being fetched
	if (isPending) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Get current drawing name for header
	const getCurrentDrawingName = () => {
		if (!drawingId) return "Drawings";
		return currentDrawing?.title || "Untitled Drawing";
	};

	// Check if we should show the drawing canvas
	const shouldShowCanvas =
		drawingId &&
		(accessResult === "ALLOWED" || accessResult === "PUBLIC_ACCESS");

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "350px",
				} as React.CSSProperties
			}
		>
			{isLoggedIn ? (
				<AppSidebar
					currentCategory={currentCategory}
					onCategoryChange={setCurrentCategory}
					selectedDrawingId={drawingId}
				/>
			) : (
				<LoginPromptSidebar />
			)}

			<SidebarInset>
				{isLoggedIn && (
					<header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<div className="text-sm font-medium text-muted-foreground">
							{getCurrentDrawingName()}
						</div>
					</header>
				)}

				<div className="flex flex-1 flex-col">
					{!isLoggedIn ? (
						<div className="flex flex-1 items-center justify-center">
							<div className="text-center space-y-4">
								<h1 className="text-2xl font-semibold">
									Welcome to Excalidraw Cloud Save
								</h1>
								<p className="text-muted-foreground max-w-md">
									Create, save, and share your drawings in the cloud. Sign in to
									get started.
								</p>
							</div>
						</div>
					) : shouldShowCanvas && drawingId ? (
						<ExcalidrawCanvas drawingId={drawingId} />
					) : (
						<EmptyState
							onCreateNew={handleCreateNew}
							category={currentCategory}
						/>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
