import * as React from "react";
import { Eye, EyeOff, Info, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface PasswordInputWithStrengthProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	showStrengthIndicator?: boolean;
	onStrengthChange?: (score: number) => void;
	onValidityChange?: (isValid: boolean) => void;
}

interface PasswordRequirement {
	id: string;
	label: string;
	test: (password: string) => boolean;
	required?: boolean;
}

const passwordRequirements: PasswordRequirement[] = [
	{
		id: "length",
		label: "At least 8 characters",
		test: (password) => password.length >= 8,
		required: true,
	},
	{
		id: "uppercase",
		label: "One uppercase letter",
		test: (password) => /[A-Z]/.test(password),
	},
	{
		id: "lowercase",
		label: "One lowercase letter",
		test: (password) => /[a-z]/.test(password),
	},
	{
		id: "number",
		label: "One number",
		test: (password) => /\d/.test(password),
	},
	{
		id: "special",
		label: "One special character",
		test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
	},
];

const getPasswordStrength = (
	password: string,
): {
	score: number;
	label: string;
	color: string;
	valid: boolean;
} => {
	// Basic validation: check all required requirements
	const requiredRequirements = passwordRequirements.filter(
		(req) => req.required,
	);
	const isBasicValid = requiredRequirements.every((req) => req.test(password));

	// Optional requirements for strength enhancement
	const optionalRequirements = passwordRequirements.filter(
		(req) => !req.required,
	);
	const optionalMet = optionalRequirements.filter((req) =>
		req.test(password),
	).length;

	// If basic requirement not met, password is invalid
	if (!isBasicValid) {
		return { score: 0, label: "Too Short", color: "bg-red-600", valid: false };
	}

	// Password is valid once it meets basic requirement, score based on optional enhancements
	if (optionalMet === 0) {
		return { score: 1, label: "Basic", color: "bg-yellow-400", valid: true };
	}
	if (optionalMet === 1) {
		return { score: 2, label: "Good", color: "bg-yellow-500", valid: true };
	}
	if (optionalMet === 2) {
		return { score: 3, label: "Strong", color: "bg-green-500", valid: true };
	}
	// 3 or 4 optional requirements met
	return { score: 4, label: "Very Strong", color: "bg-green-600", valid: true };
};

const PasswordInputWithStrength = React.forwardRef<
	HTMLInputElement,
	PasswordInputWithStrengthProps
>(
	(
		{
			className,
			showStrengthIndicator = false,
			onStrengthChange,
			onValidityChange,
			value,
			onChange,
			...props
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const [password, setPassword] = React.useState("");
		const [hasFocused, setHasFocused] = React.useState(false);

		// Generate unique IDs for accessibility
		const inputId = props.id || "password";
		const strengthId = `${inputId}-strength`;
		const errorId = `${inputId}-error`;

		React.useEffect(() => {
			if (typeof value === "string") {
				setPassword(value);
			}
		}, [value]);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setPassword(newValue);
			onChange?.(e);

			// Report strength score and validity
			const strength = getPasswordStrength(newValue);
			onStrengthChange?.(strength.score);
			onValidityChange?.(strength.valid);
		};

		const handleFocus = () => {
			setHasFocused(true);
		};

		const strength = getPasswordStrength(password);
		const requirementsMet = passwordRequirements.map((req) => ({
			...req,
			met: req.test(password),
		}));

		const hasError = hasFocused && !strength.valid;
		const hasStrength = showStrengthIndicator && password;

		// Calculate border color based on focus state and validity
		const getBorderColor = () => {
			if (!hasFocused) return ""; // No border color until focused

			if (strength.valid) {
				return "border-green-500 focus-visible:ring-green-500";
			}
			return "border-red-500 focus-visible:ring-red-500";
		};

		return (
			<div className="space-y-2">
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						className={cn("pr-20", getBorderColor(), className)}
						ref={ref}
						value={value}
						onChange={handleChange}
						onFocus={handleFocus}
						aria-invalid={hasError}
						aria-describedby={
							[hasError ? errorId : null, hasStrength ? strengthId : null]
								.filter(Boolean)
								.join(" ") || undefined
						}
						{...props}
					/>
					<div className="absolute right-0 top-0 h-full flex items-center">
						{showStrengthIndicator && (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-full px-2 py-2 hover:bg-transparent"
									>
										<Info className="h-4 w-4" aria-hidden="true" />
										<span className="sr-only">Password requirements</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-64" align="end">
									<div className="space-y-2">
										<div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
											Password Requirements
										</div>
										{requirementsMet.map((req) => (
											<div
												key={req.id}
												className="flex items-center space-x-2 text-sm"
											>
												{req.met ? (
													<Check className="h-4 w-4 text-green-500 flex-shrink-0" />
												) : (
													<X
														className={cn(
															"h-4 w-4 flex-shrink-0",
															req.required ? "text-red-500" : "text-gray-400",
														)}
													/>
												)}
												<span
													className={cn(
														req.met
															? "text-green-700 dark:text-green-400"
															: req.required
																? "text-red-600 dark:text-red-400 font-medium"
																: "text-gray-600 dark:text-gray-400",
													)}
												>
													{req.label}
													{req.required && " (Required)"}
												</span>
											</div>
										))}
									</div>
								</PopoverContent>
							</Popover>
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

				{/* Strength Indicator */}
				{hasStrength && (
					<output
						id={strengthId}
						className="h-6 flex items-center space-x-2"
						aria-live="polite"
					>
						<div
							className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
							aria-hidden="true"
						>
							<div
								className={cn(
									"h-full transition-all duration-300 ease-in-out",
									strength.color,
								)}
								style={{ width: `${(strength.score / 4) * 100}%` }}
							/>
						</div>
						<span
							className="text-sm font-medium min-w-0 flex-shrink-0"
							aria-label={`Password strength: ${strength.label}`}
						>
							{strength.label}
						</span>
					</output>
				)}

				{/* Validation message area */}
				<div className="flex items-center transition-all duration-200 ease-in-out">
					{hasError && (
						<span
							id={errorId}
							className="text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1"
							role="alert"
							aria-live="polite"
						>
							{password.length === 0
								? "Password is required"
								: "Password must be at least 8 characters"}
						</span>
					)}
				</div>
			</div>
		);
	},
);

PasswordInputWithStrength.displayName = "PasswordInputWithStrength";

export { PasswordInputWithStrength };
