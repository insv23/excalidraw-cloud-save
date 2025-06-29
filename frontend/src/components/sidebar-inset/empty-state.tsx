import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DrawingCategory } from "@/types/drawing";

interface EmptyStateProps {
	onCreateNew: () => void;
	category?: DrawingCategory;
	isCreating?: boolean;
}

const getCategoryMessage = (category: DrawingCategory = "recent") => {
	switch (category) {
		case "recent":
			return {
				title: "No drawing selected",
				description:
					"Select a drawing from the sidebar to start editing, or create a new one to get started.",
			};
		case "pinned":
			return {
				title: "No pinned drawings",
				description:
					"Pin your favorite drawings to keep them easily accessible.",
			};
		case "public":
			return {
				title: "No public drawings",
				description: "Make your drawings public to share them with others.",
			};
		case "archived":
			return {
				title: "No archived drawings",
				description:
					"Archive drawings you want to keep but don't need in your recent list.",
			};
		case "trash":
			return {
				title: "Trash is empty",
				description: "Deleted drawings will appear here and can be restored.",
			};
		default:
			return {
				title: "No drawings found",
				description: "Create a new drawing to get started.",
			};
	}
};

export function EmptyState({
	onCreateNew,
	category = "recent",
	isCreating = false,
}: EmptyStateProps) {
	const message = getCategoryMessage(category);
	const showCreateButton = category !== "trash"; // Don't show create button in trash

	return (
		<div className="flex flex-1 items-center justify-center">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
					<Plus className="w-8 h-8 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-medium">{message.title}</h3>
					<p className="text-sm text-muted-foreground max-w-sm">
						{message.description}
					</p>
				</div>
				{showCreateButton && (
					<Button onClick={onCreateNew} disabled={isCreating}>
						<Plus className="w-4 h-4 mr-2" />
						{isCreating ? "Creating..." : "New Drawing"}
					</Button>
				)}
			</div>
		</div>
	);
}
