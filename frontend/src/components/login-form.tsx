import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordInput } from "@/components/ui/password-input";
import consola from "consola";
import { useSession, signIn, authClient } from "@/lib/auth-client";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { data: session, isPending } = useSession();
	const [currentTab, setCurrentTab] = useState("email");

	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");

	// Form validation states
	const [emailValid, setEmailValid] = useState(false);
	const [phoneValid, setPhoneValid] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Password validation (consistent with registration form)
	const passwordValid = password.length >= 8;

	// Calculate if current form is valid
	const isEmailFormValid = emailValid && passwordValid;
	const isPhoneFormValid = phoneValid && passwordValid;
	const canSubmit =
		currentTab === "email" ? isEmailFormValid : isPhoneFormValid;

	// If user is already logged in, redirect to home
	if (session && !isPending) {
		return <Navigate to="/" replace />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!canSubmit) return;

		setIsSubmitting(true);

		try {
			if (currentTab === "email") {
				// Handle email login
				await signIn.email(
					{
						email,
						password: password,
						callbackURL: "/", // Redirect to home after successful login
					},
					{
						onRequest: () => {
							toast.info("Signing in...");
						},
						onSuccess: () => {
							toast.success("Welcome back!");
						},
						onError: (ctx) => {
							toast.error(ctx.error.message);
						},
					},
				);
			} else {
				// Handle phone login
				await authClient.signIn.phoneNumber(
					{
						phoneNumber,
						password: password,
						rememberMe: true,
					},
					{
						onRequest: () => {
							toast.info("Signing in...");
						},
						onSuccess: () => {
							toast.success("Welcome back!");
						},
						onError: (ctx) => {
							toast.error(ctx.error.message);
						},
					},
				);
			}
		} catch (error) {
			consola.error("Login failed:", error);
			toast.error("Login failed. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>Choose your preferred login method</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<Tabs
							value={currentTab}
							onValueChange={setCurrentTab}
							className="w-full"
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="email">Email</TabsTrigger>
								<TabsTrigger value="phone">Phone Number</TabsTrigger>
							</TabsList>

							<TabsContent value="email" className="space-y-4">
								<div className="flex flex-col gap-6">
									<div className="grid gap-3">
										<Label htmlFor="email">Email</Label>
										<EmailInput
											id="email"
											name="email"
											placeholder="m@example.com"
											autoComplete="email"
											required
											onValidationChange={setEmailValid}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div className="grid gap-3">
										<div className="flex items-center">
											<Label htmlFor="email-password">Password</Label>
											<a
												href="/forgot-password"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</a>
										</div>
										<div className="space-y-2">
											<PasswordInput
												id="email-password"
												name="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												autoComplete="current-password"
												aria-invalid={password.length > 0 && !passwordValid}
												aria-describedby={
													password.length > 0 && !passwordValid
														? "email-password-error"
														: undefined
												}
												className={cn(
													password.length > 0 && !passwordValid
														? "border-red-500 focus-visible:ring-red-500"
														: password.length > 0 && passwordValid
															? "border-green-500 focus-visible:ring-green-500"
															: "",
												)}
												required
											/>
											{password.length > 0 && !passwordValid && (
												<span
													id="email-password-error"
													className="text-sm text-red-600 dark:text-red-400"
													role="alert"
													aria-live="polite"
												>
													Password must be at least 8 characters
												</span>
											)}
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="phone" className="space-y-4">
								<div className="flex flex-col gap-6">
									<div className="grid gap-3">
										<Label htmlFor="phone">Phone Number</Label>
										<PhoneInput
											id="phone"
											name="phone"
											autoComplete="tel"
											required
											value={phoneNumber}
											onChange={(e) => setPhoneNumber(e.target.value)}
											onValidationChange={setPhoneValid}
										/>
									</div>
									<div className="grid gap-3">
										<div className="flex items-center">
											<Label htmlFor="phone-password">Password</Label>
											<a
												href="/forgot-password"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</a>
										</div>
										<div className="space-y-2">
											<PasswordInput
												id="phone-password"
												name="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												autoComplete="current-password"
												aria-invalid={password.length > 0 && !passwordValid}
												aria-describedby={
													password.length > 0 && !passwordValid
														? "phone-password-error"
														: undefined
												}
												className={cn(
													password.length > 0 && !passwordValid
														? "border-red-500 focus-visible:ring-red-500"
														: password.length > 0 && passwordValid
															? "border-green-500 focus-visible:ring-green-500"
															: "",
												)}
												required
											/>
											{password.length > 0 && !passwordValid && (
												<span
													id="phone-password-error"
													className="text-sm text-red-600 dark:text-red-400"
													role="alert"
													aria-live="polite"
												>
													Password must be at least 8 characters
												</span>
											)}
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>

						{/* Submit Button */}
						<div className="mt-6 flex flex-col gap-3">
							<Button
								type="submit"
								className={cn(
									"w-full transition-all",
									canSubmit && !isSubmitting
										? "bg-primary hover:bg-primary/90"
										: "bg-gray-300 cursor-not-allowed text-gray-500",
								)}
								disabled={!canSubmit || isSubmitting}
								aria-label={
									!canSubmit && !isSubmitting
										? currentTab === "email"
											? !emailValid
												? "Cannot submit: Please enter a valid email address"
												: !passwordValid
													? "Cannot submit: Password must be at least 8 characters"
													: "Cannot submit: Please complete the form"
											: !phoneValid
												? "Cannot submit: Please enter a valid phone number"
												: !passwordValid
													? "Cannot submit: Password must be at least 8 characters"
													: "Cannot submit: Please complete the form"
										: isSubmitting
											? "Signing in, please wait"
											: "Submit login form"
								}
							>
								{isSubmitting
									? "Signing in..."
									: canSubmit
										? "Login"
										: currentTab === "email"
											? !emailValid
												? "Enter a valid email"
												: !passwordValid
													? "Password must be at least 8 characters"
													: "Complete the form above"
											: !phoneValid
												? "Enter a valid phone number"
												: !passwordValid
													? "Password must be at least 8 characters"
													: "Complete the form above"}
							</Button>
							<Button variant="outline" className="w-full" type="button">
								Login with Google
							</Button>
						</div>
					</form>

					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<a
							href="/register"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign up
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
