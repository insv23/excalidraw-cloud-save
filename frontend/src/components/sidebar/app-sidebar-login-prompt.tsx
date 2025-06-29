import { Command, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function LoginPromptSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const navigate = useNavigate();

	const handleLogin = () => {
		navigate("/login");
	};

	const handleRegister = () => {
		navigate("/register");
	};

	return (
		<Sidebar
			collapsible="offcanvas"
			className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
			{...props}
		>
			{/* Icon sidebar */}
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
			</Sidebar>

			{/* Content sidebar - shows login prompt */}
			<Sidebar collapsible="none" className="hidden flex-1 md:flex">
				<SidebarContent>
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-4 text-center p-6">
							<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
								<LogIn className="w-8 h-8 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Sign in to continue</h3>
								<p className="text-sm text-muted-foreground max-w-sm">
									Sign in to create, save, and manage your drawings in the
									cloud.
								</p>
							</div>
							<div className="space-y-2 w-full">
								<Button onClick={handleLogin} className="w-full">
									Sign In
								</Button>
								<Button
									variant="outline"
									onClick={handleRegister}
									className="w-full"
								>
									Create Account
								</Button>
							</div>
						</div>
					</div>
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	);
}
