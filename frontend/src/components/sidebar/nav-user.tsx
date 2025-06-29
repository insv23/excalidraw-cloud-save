"use client";

import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
	Monitor,
	Moon,
	Sun,
	User,
	LogIn,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "@/lib/auth-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme/theme-provider";
import { useNavigate } from "react-router-dom";
import consola from "consola";

// Check if email is a phone number virtual email and format it
const formatDisplayEmail = (email: string): string => {
	// Check if it's a virtual phone email (ends with @nomail.auth)
	if (email.endsWith("@nomail.auth")) {
		const phoneNumber = email.replace("@nomail.auth", "");
		// Check if it's a valid 11-digit Chinese phone number
		if (/^1\d{10}$/.test(phoneNumber)) {
			// Format as 138 1234 5678 (3-4-4 pattern)
			return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 7)} ${phoneNumber.slice(7)}`;
		}
	}
	// Return original email if not a phone number virtual email
	return email;
};

export function NavUser() {
	const { data: session } = useSession();
	const { isMobile } = useSidebar();
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();

	// Generate fallback text from name
	const generateFallback = (name: string): string => {
		const words = name.trim().split(/\s+/);
		if (words.length > 1) {
			// Multiple words: take first letter of each word, max 2
			return words
				.slice(0, 2)
				.map((word) => word[0] || "")
				.join("");
		}
		// Single word: take first 2 characters
		return name.slice(0, 2);
	};

	const handleSignOut = async () => {
		try {
			await signOut({
				fetchOptions: {
					onSuccess: () => {
						// Redirect to login page after successful logout
						window.location.href = "/login";
					},
				},
			});
		} catch (error) {
			consola.error("Sign out failed:", error);
		}
	};

	const handleLogin = () => {
		navigate("/login");
	};

	const handleRegister = () => {
		navigate("/register");
	};

	// Anonymous user state
	if (!session?.user) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
							>
								<Avatar className="h-8 w-8 rounded-lg border border-gray-200">
									<AvatarFallback className="rounded-lg bg-muted">
										<User className="h-4 w-4 text-muted-foreground" />
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium text-muted-foreground">
										Anonymous
									</span>
									<span className="truncate text-xs text-muted-foreground">
										Click to sign in
									</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarFallback className="rounded-lg bg-muted">
											<User className="h-4 w-4 text-muted-foreground" />
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium text-muted-foreground">
											Anonymous User
										</span>
										<span className="truncate text-xs text-muted-foreground">
											Not signed in
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={handleLogin}>
									<LogIn />
									Sign In
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleRegister}>
									<User />
									Create Account
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									{theme === "light" && <Sun className="mr-2 h-4 w-4" />}
									{theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
									{theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
									Theme
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem onClick={() => setTheme("light")}>
										<Sun className="mr-2 h-4 w-4" />
										Light
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("dark")}>
										<Moon className="mr-2 h-4 w-4" />
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("system")}>
										<Monitor className="mr-2 h-4 w-4" />
										System
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	// Authenticated user state
	const user = session.user;
	const avatarFallback = generateFallback(user.name);
	const displayEmail = formatDisplayEmail(user.email);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
						>
							<Avatar className="h-8 w-8 rounded-lg border border-gray-200">
								{user.image && <AvatarImage src={user.image} alt={user.name} />}
								<AvatarFallback className="rounded-lg">
									{avatarFallback}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs">{displayEmail}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{user.image && (
										<AvatarImage src={user.image} alt={user.name} />
									)}
									<AvatarFallback className="rounded-lg">
										{avatarFallback}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{displayEmail}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles />
								Upgrade to Pro
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									{theme === "light" && <Sun className="mr-2 h-4 w-4" />}
									{theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
									{theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
									Theme
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem onClick={() => setTheme("light")}>
										<Sun className="mr-2 h-4 w-4" />
										Light
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("dark")}>
										<Moon className="mr-2 h-4 w-4" />
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("system")}>
										<Monitor className="mr-2 h-4 w-4" />
										System
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
