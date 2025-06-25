import * as React from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputConfirmProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	password: string;
	showValidation?: boolean;
	onValidationChange?: (isValid: boolean) => void;
}

const PasswordInputConfirm = React.forwardRef<
	HTMLInputElement,
	PasswordInputConfirmProps
>(
	(
		{
			className,
			password,
			showValidation = true,
			onValidationChange,
			value,
			onChange,
			...props
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const [confirmPassword, setConfirmPassword] = React.useState("");
		const [validationState, setValidationState] = React.useState<
			"idle" | "valid" | "invalid"
		>("idle");
		const [hasFocused, setHasFocused] = React.useState(false);

		// Generate unique IDs for accessibility
		const inputId = props.id || "confirm-password";
		const errorId = `${inputId}-error`;
		const statusId = `${inputId}-status`;

		React.useEffect(() => {
			if (typeof value === "string") {
				setConfirmPassword(value);
			}
		}, [value]);

		const validatePasswords = React.useCallback(
			(confirmValue: string) => {
				if (!confirmValue) {
					setValidationState("invalid"); // Empty is now invalid
					onValidationChange?.(false);
					return;
				}

				if (confirmValue === password) {
					setValidationState("valid");
					onValidationChange?.(true);
				} else {
					setValidationState("invalid");
					onValidationChange?.(false);
				}
			},
			[password, onValidationChange],
		);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setConfirmPassword(newValue);
			onChange?.(e);

			// Real-time validation after focus
			if (hasFocused) {
				validatePasswords(newValue);
			}
		};

		const handleFocus = () => {
			setHasFocused(true);
			// Validate immediately on focus
			validatePasswords(confirmPassword);
		};

		// Re-validate when password changes
		React.useEffect(() => {
			if (hasFocused && confirmPassword) {
				validatePasswords(confirmPassword);
			}
		}, [hasFocused, confirmPassword, validatePasswords]);

		const getStatusIcon = () => {
			if (hasFocused && validationState === "valid") {
				return <Check className="h-4 w-4 text-green-500" />;
			}
			if (hasFocused && validationState === "invalid") {
				return <X className="h-4 w-4 text-red-500" />;
			}
			return null;
		};

		const getStatusColor = () => {
			if (!hasFocused) return ""; // No border color until focused

			if (validationState === "valid") {
				return "border-green-500 focus-visible:ring-green-500";
			}
			if (validationState === "invalid") {
				return "border-red-500 focus-visible:ring-red-500";
			}
			return "";
		};

		const hasMessage = hasFocused && validationState !== "idle";
		const hasError = hasMessage && validationState === "invalid";

		return (
			<div className="space-y-2">
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						className={cn("pr-20", getStatusColor(), className)}
						ref={ref}
						value={value}
						onChange={handleChange}
						onFocus={handleFocus}
						aria-invalid={hasError}
						aria-describedby={
							[
								hasError ? errorId : null,
								hasMessage && !hasError ? statusId : null,
							]
								.filter(Boolean)
								.join(" ") || undefined
						}
						{...props}
					/>
					<div className="absolute right-0 top-0 h-full flex items-center">
						{showValidation && validationState !== "idle" && (
							<div className="px-2" aria-hidden="true">
								{getStatusIcon()}
							</div>
						)}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowPassword((prev) => !prev)}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" aria-hidden="true" />
							) : (
								<Eye className="h-4 w-4" aria-hidden="true" />
							)}
							<span className="sr-only">
								{showPassword ? "Hide password" : "Show password"}
							</span>
						</Button>
					</div>
				</div>

				{/* Validation message area */}
				<div className="flex items-center transition-all duration-200 ease-in-out">
					{showValidation && hasMessage && (
						<span
							id={hasError ? errorId : statusId}
							className={cn(
								"text-sm animate-in slide-in-from-top-1",
								validationState === "valid"
									? "text-green-600 dark:text-green-400"
									: "text-red-600 dark:text-red-400",
							)}
							role={hasError ? "alert" : "status"}
							aria-live="polite"
						>
							{validationState === "valid"
								? "Passwords match"
								: confirmPassword.length === 0
									? "Please confirm your password"
									: "Passwords don't match"}
						</span>
					)}
				</div>
			</div>
		);
	},
);

PasswordInputConfirm.displayName = "PasswordInputConfirm";

export { PasswordInputConfirm };
