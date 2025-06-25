"use client";

import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
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

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar?: string | null;
	};
}) {
	const { isMobile } = useSidebar();

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

	const avatarFallback = generateFallback(user.name);
	const displayEmail = formatDisplayEmail(user.email);

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
								{user.avatar && (
									<AvatarImage src={user.avatar} alt={user.name} />
								)}
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
									{user.avatar && (
										<AvatarImage src={user.avatar} alt={user.name} />
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
