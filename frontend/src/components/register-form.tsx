import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
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
import { PasswordInputWithStrength } from "@/components/ui/password-input-with-strength";
import { PasswordInputConfirm } from "@/components/ui/password-input-confirm";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { VerificationCodeInput } from "@/components/ui/verification-code-input";
import type { VerificationCodeInputRef } from "@/components/ui/verification-code-input";
import { NameInput } from "@/components/ui/name-input";
import { TermsCheckbox } from "@/components/ui/terms-checkbox";
import consola from "consola";
import { useSession, signUp, authClient } from "@/lib/auth-client";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { data: session, isPending } = useSession();
	const [currentTab, setCurrentTab] = useState("email");

	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [verificationCode, setVerificationCode] = useState("");

	// Refs for form elements
	const verificationCodeRef = useRef<VerificationCodeInputRef>(null);

	// Form validation states
	const [emailValid, setEmailValid] = useState(false);
	const [nameValid, setNameValid] = useState(false);
	const [nameFocused, setNameFocused] = useState(false);
	const [passwordScore, setPasswordScore] = useState(0);
	const [passwordsMatch, setPasswordsMatch] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);

	// Phone-specific validation states
	const [phoneValid, setPhoneValid] = useState(false);
	const [verificationCodeValid, setVerificationCodeValid] = useState(false);

	// Phone OTP states
	const [otpSent, setOtpSent] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Calculate if current form is valid
	const isEmailFormValid =
		nameValid &&
		emailValid &&
		passwordScore >= 2 &&
		passwordsMatch &&
		termsAccepted;
	const isPhoneFormValid =
		nameValid &&
		phoneValid &&
		verificationCodeValid &&
		passwordScore >= 2 &&
		passwordsMatch &&
		termsAccepted;
	const canSubmit =
		currentTab === "email" ? isEmailFormValid : isPhoneFormValid;

	// Countdown timer for OTP
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	// If user is already logged in, redirect to home
	if (session && !isPending) {
		return <Navigate to="/" replace />;
	}

	// Send OTP to phone number
	const handleSendOtp = async () => {
		if (!phoneValid || countdown > 0) return;

		try {
			toast.info("Sending verification code...");
			await authClient.phoneNumber.sendOtp({
				phoneNumber,
			});

			setOtpSent(true);
			setCountdown(60); // Start 60 second countdown
			toast.success("Verification code sent!");

			// Auto focus to verification code input
			setTimeout(() => {
				verificationCodeRef.current?.focus();
			}, 100); // Small delay to ensure the UI has updated
		} catch (error) {
			consola.error("Failed to send OTP:", error);
			toast.error("Failed to send verification code");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (currentTab === "email") {
			// Handle email registration
			setIsSubmitting(true);
			try {
				await signUp.email(
					{
						email,
						name,
						password: password,
						callbackURL: "/", // Redirect to home after successful registration
					},
					{
						onRequest: () => {
							// Show loading state
							toast.info("Creating account...");
						},
						onSuccess: () => {
							toast.success("Registration successful! You are now signed in.");
						},
						onError: (ctx) => {
							toast.error(ctx.error.message);
						},
					},
				);
			} catch (error) {
				consola.error(error);
				toast.error("An unexpected error occurred");
			} finally {
				setIsSubmitting(false);
			}
		} else {
			// Handle phone registration
			if (!otpSent) {
				toast.error("Please send verification code first");
				return;
			}

			if (!verificationCodeValid) {
				toast.error("Please enter a valid verification code");
				return;
			}

			setIsSubmitting(true);
			try {
				// Step 1: Create account with password first
				const tempEmail = `${phoneNumber.replace(/[^0-9]/g, "")}@nomail.auth`;
				await signUp.email(
					{
						email: tempEmail,
						name: name,
						password: password,
						callbackURL: "/",
					},
					{
						onRequest: () => {
							toast.info("Creating account...");
						},
						onSuccess: async () => {
							// Step 2: After successful account creation, verify phone number
							try {
								await authClient.phoneNumber.verify({
									phoneNumber,
									code: verificationCode,
									updatePhoneNumber: true, // Update current user's phone number
								});
								toast.success(
									"Registration successful! Phone number verified.",
								);
							} catch (verifyError) {
								consola.error("Phone verification failed:", verifyError);
								toast.error(
									"Account created but phone verification failed. Please try again later.",
								);
							}
						},
						onError: (ctx) => {
							toast.error(ctx.error.message);
						},
					},
				);
			} catch (error) {
				consola.error("Phone registration failed:", error);
				toast.error("Registration failed. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Create your account</CardTitle>
					<CardDescription>
						Choose your preferred registration method
					</CardDescription>
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
										<Label htmlFor="name">Name</Label>
										<NameInput
											id="name"
											name="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											onValidationChange={setNameValid}
											onFocus={() => setNameFocused(true)}
											focused={nameFocused}
											required
										/>
									</div>
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
										<Label htmlFor="password">Password</Label>
										<PasswordInputWithStrength
											id="password"
											name="password"
											showStrengthIndicator={true}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											onStrengthChange={setPasswordScore}
											autoComplete="new-password"
											required
										/>
									</div>
									<div className="grid gap-3">
										<Label htmlFor="confirm-password">Confirm Password</Label>
										<PasswordInputConfirm
											id="confirm-password"
											name="confirmPassword"
											password={password}
											onValidationChange={setPasswordsMatch}
											autoComplete="new-password"
											required
										/>
									</div>

									<TermsCheckbox
										id="terms"
										name="terms"
										checked={termsAccepted}
										onCheckedChange={setTermsAccepted}
									/>
								</div>
							</TabsContent>

							<TabsContent value="phone" className="space-y-4">
								<div className="flex flex-col gap-6">
									<div className="grid gap-3">
										<Label htmlFor="phone-name">Name</Label>
										<NameInput
											id="phone-name"
											name="phone-name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											onValidationChange={setNameValid}
											onFocus={() => setNameFocused(true)}
											focused={nameFocused}
											required
										/>
									</div>
									<div className="grid gap-3">
										<Label htmlFor="phone">Phone Number</Label>
										<div className="flex gap-2">
											<PhoneInput
												id="phone"
												name="phone"
												className="flex-1"
												autoComplete="tel"
												required
												value={phoneNumber}
												onChange={(e) => setPhoneNumber(e.target.value)}
												onValidationChange={setPhoneValid}
											/>
											<Button
												variant="outline"
												type="button"
												className="px-4"
												onClick={handleSendOtp}
												disabled={!phoneValid || countdown > 0}
												aria-label={
													!phoneValid
														? "Cannot send code: Please enter a valid phone number first"
														: countdown > 0
															? `Cannot send code: Please wait ${countdown} seconds before sending again`
															: "Send verification code to your phone number"
												}
											>
												{countdown > 0 ? `${countdown}s` : "Send Code"}
											</Button>
										</div>
									</div>
									<div className="grid gap-3">
										<Label htmlFor="verification-code" className="text-center">
											Verification Code
										</Label>
										<div className="flex justify-center">
											<VerificationCodeInput
												ref={verificationCodeRef}
												id="verification-code"
												maxLength={4}
												onValidationChange={(isValid, code) => {
													setVerificationCodeValid(isValid);
													setVerificationCode(code);
												}}
											/>
										</div>
									</div>
									<div className="grid gap-3">
										<Label htmlFor="phone-password">Password</Label>
										<PasswordInputWithStrength
											id="phone-password"
											name="password"
											showStrengthIndicator={true}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											onStrengthChange={setPasswordScore}
											autoComplete="new-password"
											required
										/>
									</div>
									<div className="grid gap-3">
										<Label htmlFor="phone-confirm-password">
											Confirm Password
										</Label>
										<PasswordInputConfirm
											id="phone-confirm-password"
											name="confirmPassword"
											password={password}
											onValidationChange={setPasswordsMatch}
											autoComplete="new-password"
											required
										/>
									</div>

									<TermsCheckbox
										id="phone-terms"
										name="phoneTerms"
										checked={termsAccepted}
										onCheckedChange={setTermsAccepted}
									/>
								</div>
							</TabsContent>
						</Tabs>

						{/* Unified Submit Button */}
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
											? !nameValid
												? "Cannot submit: Please enter a valid name (at least 2 characters)"
												: !emailValid
													? "Cannot submit: Please enter a valid email address"
													: passwordScore < 2
														? "Cannot submit: Password must be stronger (at least 'Good')"
														: !passwordsMatch
															? "Cannot submit: Passwords do not match"
															: !termsAccepted
																? "Cannot submit: Please accept the terms and conditions"
																: "Cannot submit: Please complete the form"
											: !nameValid
												? "Cannot submit: Please enter a valid name (at least 2 characters)"
												: !phoneValid
													? "Cannot submit: Please enter a valid phone number"
													: !verificationCodeValid
														? "Cannot submit: Please enter a valid verification code"
														: passwordScore < 2
															? "Cannot submit: Password must be stronger (at least 'Good')"
															: !passwordsMatch
																? "Cannot submit: Passwords do not match"
																: !termsAccepted
																	? "Cannot submit: Please accept the terms and conditions"
																	: "Cannot submit: Please complete the form"
										: isSubmitting
											? "Creating account, please wait"
											: "Submit registration form"
								}
							>
								{isSubmitting
									? "Creating Account..."
									: canSubmit
										? "Create Account"
										: "Complete the form above"}
							</Button>
							<Button variant="outline" className="w-full" type="button">
								Register with Google
							</Button>
						</div>
					</form>

					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<a
							href="/login"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign in
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
