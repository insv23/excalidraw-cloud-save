import * as React from "react";
import {
	Archive,
	Command,
	Palette,
	Share,
	Star,
	Trash2,
	Plus,
	Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { NavUser } from "@/components/sidebar/nav-user";
import { useSession } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { DrawingListItem } from "@/components/sidebar/app-sidebar-list-item";
import type { Drawing, DrawingCategory } from "@/types/drawing";
import { useDrawingsStore } from "@/store/drawings-store";
import {
	filterDrawingsByCategory,
	getCategoryDisplayName,
} from "@/lib/drawing-utils";

// Category navigation configuration
const navCategories = [
	{
		id: "recent" as DrawingCategory,
		title: "Recent",
		icon: Palette,
	},
	{
		id: "pinned" as DrawingCategory,
		title: "Pinned",
		icon: Star,
	},
	{
		id: "public" as DrawingCategory,
		title: "Public",
		icon: Share,
	},
	{
		id: "archived" as DrawingCategory,
		title: "Archived",
		icon: Archive,
	},
	{
		id: "trash" as DrawingCategory,
		title: "Trash",
		icon: Trash2,
	},
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	currentCategory: DrawingCategory;
	onCategoryChange: (category: DrawingCategory) => void;
	selectedDrawingId?: string;
}

export function AppSidebar({
	currentCategory,
	onCategoryChange,
	selectedDrawingId,
	...props
}: AppSidebarProps) {
	const { data: session } = useSession();
	const navigate = useNavigate();
	const { setOpen } = useSidebar();
	const isMobile = useIsMobile();

	const drawings = useDrawingsStore((state) => state.drawings);
	const createNewDrawing = useDrawingsStore((state) => state.createNewDrawing);
	const deleteDrawing = useDrawingsStore((state) => state.deleteDrawing);
	const restoreDrawing = useDrawingsStore((state) => state.restoreDrawing);
	const togglePin = useDrawingsStore((state) => state.togglePin);
	const togglePublic = useDrawingsStore((state) => state.togglePublic);
	const toggleArchive = useDrawingsStore((state) => state.toggleArchive);
	const isCreating = useDrawingsStore((state) => state.isCreating);

	const [searchQuery, setSearchQuery] = React.useState("");
	const [openMenu, setOpenMenu] = React.useState<string | null>(null);

	// Filter drawings by current category
	const categoryDrawings = React.useMemo(() => {
		const filtered = filterDrawingsByCategory(drawings, currentCategory);

		// Apply search filter
		if (searchQuery.trim()) {
			return filtered.filter(
				(drawing) =>
					drawing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					drawing.description
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()),
			);
		}

		return filtered;
	}, [drawings, currentCategory, searchQuery]);

	const handleCreateNewDrawing = async () => {
		if (!session?.user) return;
		const newDrawing = await createNewDrawing(session.user);
		if (newDrawing) {
			navigate(`/${newDrawing.id}`);

			// Only close sidebar on mobile devices
			if (isMobile) {
				setOpen(false);
			}
		}
	};

	const handleDrawingClick = (drawingId: string) => {
		navigate(`/${drawingId}`);

		// Only close sidebar on mobile devices
		if (isMobile) {
			setOpen(false);
		}
	};

	const handleCategoryClick = (category: DrawingCategory) => {
		onCategoryChange(category);
		setSearchQuery(""); // Clear search when switching categories
	};

	const handleTogglePin = (drawing: Drawing, e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent navigation
		togglePin(drawing.id);
	};

	const handleTogglePublic = (drawing: Drawing, e: React.MouseEvent) => {
		e.stopPropagation();
		togglePublic(drawing.id);
	};

	const handleToggleArchive = (drawing: Drawing, e: React.MouseEvent) => {
		e.stopPropagation();
		toggleArchive(drawing.id);
	};

	const handleDelete = async (drawing: Drawing, e: React.MouseEvent) => {
		e.stopPropagation();
		await deleteDrawing(drawing.id, false); // soft delete

		// If we just deleted the currently selected drawing, navigate to home
		if (selectedDrawingId === drawing.id) {
			navigate("/");
		}
	};

	const handleRestore = async (drawing: Drawing, e: React.MouseEvent) => {
		e.stopPropagation();
		await restoreDrawing(drawing.id);
	};

	const handlePermanentDelete = async (drawing: Drawing, e: React.MouseEvent) => {
		e.stopPropagation();
		await deleteDrawing(drawing.id, true); // permanent delete

		// If we just deleted the currently selected drawing, navigate to home
		if (selectedDrawingId === drawing.id) {
			navigate("/");
		}
	};

	return (
		<Sidebar
			collapsible="offcanvas"
			className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
			{...props}
		>
			{/* Left icon sidebar */}
			<Sidebar
				collapsible="none"
				className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
			>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
								<a href="/">
									<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
										<Command className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">Excalidraw</span>
										<span className="truncate text-xs">Cloud Save</span>
									</div>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent className="px-1.5 md:px-0">
							<SidebarMenu>
								{navCategories.map((category) => (
									<SidebarMenuItem key={category.id}>
										<SidebarMenuButton
											tooltip={{
												children: category.title,
												hidden: false,
											}}
											onClick={() => handleCategoryClick(category.id)}
											isActive={currentCategory === category.id}
											className="px-2.5 md:px-2"
										>
											<category.icon />
											<span>{category.title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<NavUser />
				</SidebarFooter>
			</Sidebar>

			{/* Right content sidebar */}
			<Sidebar collapsible="none" className="hidden flex-1 md:flex">
				<SidebarHeader className="gap-3.5 border-b p-4">
					<div className="flex w-full items-center justify-between">
						<div className="text-foreground text-base font-medium">
							{getCategoryDisplayName(currentCategory)}
						</div>
						{currentCategory !== "trash" && (
							<Button size="sm" onClick={handleCreateNewDrawing} disabled={isCreating}>
								<Plus className="w-4 h-4 mr-2" />
								{isCreating ? "Creating..." : "New"}
							</Button>
						)}
					</div>
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<SidebarInput
							placeholder="Search drawings..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup className="p-0">
						<SidebarGroupContent>
							{categoryDrawings.map((drawing) => (
								<DrawingListItem
									key={drawing.id}
									drawing={drawing}
									isSelected={selectedDrawingId === drawing.id}
									currentCategory={currentCategory}
									isMenuOpen={openMenu === drawing.id}
									onMenuOpenChange={(isOpen) =>
										setOpenMenu(isOpen ? drawing.id : null)
									}
									onDrawingClick={handleDrawingClick}
									onRestore={handleRestore}
									onTogglePin={handleTogglePin}
									onTogglePublic={handleTogglePublic}
									onToggleArchive={handleToggleArchive}
									onDelete={handleDelete}
									onPermanentDelete={handlePermanentDelete}
								/>
							))}
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	);
}
