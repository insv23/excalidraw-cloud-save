import * as React from "react";
import { useState } from "react";
import {
	MoreHorizontal,
	Archive,
	ArchiveRestore,
	Lock,
	Share,
	Star,
	StarOff,
	Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import type { Drawing, DrawingCategory } from "@/types/drawing";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DescriptionDialog } from "@/components/description-dialog";
import { useDrawingsStore } from "@/store/drawings-store";

interface DrawingListItemProps {
	drawing: Drawing;
	isSelected: boolean;
	currentCategory: DrawingCategory;
	isMenuOpen: boolean;
	onMenuOpenChange: (isOpen: boolean) => void;
	onDrawingClick: (id: string) => void;
	onRestore: (drawing: Drawing, e: React.MouseEvent) => void;
	onTogglePin: (drawing: Drawing, e: React.MouseEvent) => void;
	onTogglePublic: (drawing: Drawing, e: React.MouseEvent) => void;
	onToggleArchive: (drawing: Drawing, e: React.MouseEvent) => void;
	onDelete: (drawing: Drawing, e: React.MouseEvent) => void;
	onPermanentDelete?: (drawing: Drawing, e: React.MouseEvent) => void;
}

export function DrawingListItem({
	drawing,
	isSelected,
	currentCategory,
	isMenuOpen,
	onMenuOpenChange,
	onDrawingClick,
	onRestore,
	onTogglePin,
	onTogglePublic,
	onToggleArchive,
	onDelete,
	onPermanentDelete,
}: DrawingListItemProps) {
	const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
	const updateDrawing = useDrawingsStore((state) => state.updateDrawing);

	const formatLastModified = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch {
			return "Unknown";
		}
	};

	const handleDescriptionSave = (newDescription: string) => {
		updateDrawing(drawing.id, { description: newDescription });
	};

	return (
		<div
			className={cn(
				"group/item relative overflow-hidden flex items-center gap-2 w-full border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				{
					"bg-sidebar-accent text-sidebar-accent-foreground": isSelected,
				},
			)}
		>
			<button
				type="button"
				onClick={() => onDrawingClick(drawing.id)}
				className="flex flex-1 flex-col items-start gap-2 text-left"
			>
				<div className="flex w-full items-center gap-2">
					<span className="font-medium line-clamp-2">{drawing.title}</span>
					<span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
						{formatLastModified(drawing.updatedAt)}
					</span>
				</div>
				<div
					className="w-full text-xs text-muted-foreground cursor-pointer"
					onDoubleClick={(e) => {
						e.stopPropagation();
						setDescriptionDialogOpen(true);
					}}
				>
					{drawing.description ? (
						<span className="line-clamp-3">{drawing.description}</span>
					) : (
						<span className="italic text-muted-foreground/60">
							Double-click to create or edit description
						</span>
					)}
				</div>
			</button>

			{/* Container for the frosted glass effect */}
			<div className="pointer-events-none absolute inset-y-0 right-0 h-full w-24">
				<div
					className={cn(
						"h-full w-full bg-sidebar-accent/10 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover/item:opacity-100",
						{ "opacity-100": isMenuOpen },
					)}
					style={{
						maskImage: "linear-gradient(to right, transparent, black 50%)",
						WebkitMaskImage:
							"linear-gradient(to right, transparent, black 50%)",
					}}
				/>
			</div>

			{/* Container for the animated button */}
			<div className="absolute inset-y-0 right-0 flex items-center pr-2">
				<DropdownMenu open={isMenuOpen} onOpenChange={onMenuOpenChange}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"relative z-10 h-8 w-8 p-0 opacity-0 translate-x-4 transition-all duration-300 ease-in-out group-hover/item:opacity-100 group-hover/item:translate-x-0 hover:bg-sidebar-accent-foreground/10",
								{
									"opacity-100 translate-x-0": isMenuOpen,
								},
							)}
						>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{currentCategory === "trash" ? (
							<>
								<DropdownMenuItem onClick={(e) => onRestore(drawing, e)}>
									<ArchiveRestore className="mr-2 h-4 w-4" />
									<span>Restore</span>
								</DropdownMenuItem>
								{onPermanentDelete && (
									<DropdownMenuItem
										onClick={(e) => onPermanentDelete(drawing, e)}
										className="text-destructive"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										<span>Delete Permanently</span>
									</DropdownMenuItem>
								)}
							</>
						) : (
							<>
								<DropdownMenuItem onClick={(e) => onTogglePin(drawing, e)}>
									{drawing.isPinned ? (
										<StarOff className="mr-2 h-4 w-4" />
									) : (
										<Star className="mr-2 h-4 w-4" />
									)}
									<span>{drawing.isPinned ? "Unpin" : "Pin"}</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(e) => onTogglePublic(drawing, e)}>
									{drawing.isPublic ? (
										<Lock className="mr-2 h-4 w-4" />
									) : (
										<Share className="mr-2 h-4 w-4" />
									)}
									<span>
										{drawing.isPublic ? "Make Private" : "Make Public"}
									</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(e) => onToggleArchive(drawing, e)}>
									{drawing.isArchived ? (
										<ArchiveRestore className="mr-2 h-4 w-4" />
									) : (
										<Archive className="mr-2 h-4 w-4" />
									)}
									<span>{drawing.isArchived ? "Unarchive" : "Archive"}</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => onDelete(drawing, e)}
									className="text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									<span>Delete</span>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<DescriptionDialog
				open={descriptionDialogOpen}
				onOpenChange={setDescriptionDialogOpen}
				title={drawing.title}
				value={drawing.description}
				onSave={handleDescriptionSave}
			/>
		</div>
	);
}
