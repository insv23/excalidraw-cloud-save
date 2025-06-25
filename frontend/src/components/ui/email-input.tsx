import * as React from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface EmailInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	showValidation?: boolean;
	onValidationChange?: (isValid: boolean) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
	(
		{
			className,
			showValidation = true,
			onValidationChange,
			value,
			onChange,
			...props
		},
		ref,
	) => {
		const [email, setEmail] = React.useState("");
		const [validationState, setValidationState] = React.useState<
			"idle" | "valid" | "invalid"
		>("idle");
		const [hasFocused, setHasFocused] = React.useState(false);

		// Generate unique IDs for accessibility
		const inputId = props.id || "email";
		const errorId = `${inputId}-error`;

		React.useEffect(() => {
			if (typeof value === "string") {
				setEmail(value);
			}
		}, [value]);

		const validateEmail = React.useCallback(
			(emailValue: string) => {
				if (!emailValue) {
					setValidationState("invalid"); // Empty is now invalid
					onValidationChange?.(false);
					return;
				}

				if (EMAIL_REGEX.test(emailValue)) {
					setValidationState("valid");
					onValidationChange?.(true);
				} else {
					setValidationState("invalid");
					onValidationChange?.(false);
				}
			},
			[onValidationChange],
		);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setEmail(newValue);
			onChange?.(e);

			// Real-time validation after focus
			if (hasFocused) {
				validateEmail(newValue);
			}
		};

		const handleFocus = () => {
			setHasFocused(true);
			// Validate immediately on focus
			validateEmail(email);
		};

		const getStatusIcon = () => {
			if (hasFocused && validationState === "valid") {
				return <Check className="h-4 w-4 text-green-500" />;
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

		const shouldShowError = () => {
			return showValidation && hasFocused && validationState === "invalid";
		};

		const hasError = shouldShowError();

		return (
			<div className="space-y-2">
				<div className="relative">
					<Input
						type="email"
						className={cn("pr-10", getStatusColor(), className)}
						ref={ref}
						value={value}
						onChange={handleChange}
						onFocus={handleFocus}
						aria-invalid={hasError}
						aria-describedby={hasError ? errorId : undefined}
						{...props}
					/>
					<div className="absolute right-0 top-0 h-full flex items-center">
						{showValidation && (
							<div className="px-3" aria-hidden="true">
								{getStatusIcon()}
							</div>
						)}
					</div>
				</div>

				{/* Validation message area */}
				<div className="flex items-center transition-all duration-200 ease-in-out">
					{hasError && (
						<span
							id={errorId}
							className="text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1"
							role="alert"
							aria-live="polite"
						>
							{email.length === 0
								? "Email is required"
								: "Please enter a valid email address"}
						</span>
					)}
				</div>
			</div>
		);
	},
);

EmailInput.displayName = "EmailInput";

export { EmailInput };
