import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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

	// Form data grouped together
	const [formData, setFormData] = useState({
		email: "",
		phoneNumber: "",
		password: "",
		rememberMe: false,
	});

	// Validation state grouped together
	const [validationState, setValidationState] = useState({
		emailValid: false,
		phoneValid: false,
	});

	// Independent UI state
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Destructure for easier access
	const { email, phoneNumber, password, rememberMe } = formData;
	const { emailValid, phoneValid } = validationState;

	// Password validation (consistent with registration form)
	const passwordValid = password.length >= 8;

	// Optimized input change handlers with useCallback
	const handleEmailChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, email: e.target.value }));
		},
		[],
	);

	const handlePhoneNumberChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }));
		},
		[],
	);

	const handlePasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, password: e.target.value }));
		},
		[],
	);

	const handleRememberMeChange = useCallback((checked: boolean) => {
		setFormData((prev) => ({ ...prev, rememberMe: checked }));
	}, []);

	// Optimized validation change handlers
	const handleEmailValidationChange = useCallback((isValid: boolean) => {
		setValidationState((prev) => ({ ...prev, emailValid: isValid }));
	}, []);

	const handlePhoneValidationChange = useCallback((isValid: boolean) => {
		setValidationState((prev) => ({ ...prev, phoneValid: isValid }));
	}, []);

	// Calculate if current form is valid
	const isEmailFormValid = emailValid && passwordValid;
	const isPhoneFormValid = phoneValid && passwordValid;
	const canSubmit =
		currentTab === "email" ? isEmailFormValid : isPhoneFormValid;

	// Optimized form submit handler
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
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
							rememberMe: rememberMe,
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
							rememberMe: rememberMe,
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
		},
		[canSubmit, currentTab, email, phoneNumber, password, rememberMe],
	);

	// If user is already logged in, redirect to home
	if (session && !isPending) {
		return <Navigate to="/" replace />;
	}

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
											onValidationChange={handleEmailValidationChange}
											onChange={handleEmailChange}
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
												onChange={handlePasswordChange}
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

									{/* Remember Me Checkbox */}
									<div className="flex items-center space-x-2">
										<Checkbox
											id="email-remember"
											name="rememberMe"
											checked={rememberMe}
											onCheckedChange={(checked) =>
												handleRememberMeChange(checked === true)
											}
										/>
										<Label
											htmlFor="email-remember"
											className="text-sm font-normal cursor-pointer"
										>
											Keep me logged in
										</Label>
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
											onChange={handlePhoneNumberChange}
											onValidationChange={handlePhoneValidationChange}
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
												onChange={handlePasswordChange}
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

									{/* Remember Me Checkbox */}
									<div className="flex items-center space-x-2">
										<Checkbox
											id="phone-remember"
											name="rememberMe"
											checked={rememberMe}
											onCheckedChange={(checked) =>
												handleRememberMeChange(checked === true)
											}
										/>
										<Label
											htmlFor="phone-remember"
											className="text-sm font-normal cursor-pointer"
										>
											Keep me logged in
										</Label>
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
