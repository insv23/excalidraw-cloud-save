import * as React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	showValidation?: boolean;
	onValidationChange?: (isValid: boolean) => void;
}

// Chinese mobile phone number validation
const validateChinesePhone = (phone: string): boolean => {
	// Must be exactly 11 digits
	if (phone.length !== 11) return false;

	// Must start with 1
	if (!phone.startsWith("1")) return false;

	// Second digit must be 3-9 (main carrier ranges)
	const secondDigit = phone[1];
	if (!/[3-9]/.test(secondDigit)) return false;

	// Optional: More specific carrier validation
	// China Mobile: 134-139, 147, 150-152, 157-159, 178, 182-184, 187-188, 198
	// China Unicom: 130-132, 145, 155-156, 166, 175-176, 185-186
	// China Telecom: 133, 149, 153, 173-174, 177, 180-181, 189, 199
	const prefix = phone.substring(0, 3);
	const validPrefixes = [
		// China Mobile
		"134",
		"135",
		"136",
		"137",
		"138",
		"139",
		"147",
		"150",
		"151",
		"152",
		"157",
		"158",
		"159",
		"178",
		"182",
		"183",
		"184",
		"187",
		"188",
		"198",
		// China Unicom
		"130",
		"131",
		"132",
		"145",
		"155",
		"156",
		"166",
		"175",
		"176",
		"185",
		"186",
		// China Telecom
		"133",
		"149",
		"153",
		"173",
		"174",
		"177",
		"180",
		"181",
		"189",
		"199",
	];

	return validPrefixes.includes(prefix);
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
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
		const [phone, setPhone] = React.useState("");
		const [validationState, setValidationState] = React.useState<
			"idle" | "valid" | "invalid"
		>("idle");
		const [hasFocused, setHasFocused] = React.useState(false);

		// Generate unique IDs for accessibility
		const inputId = props.id || "phone";
		const errorId = `${inputId}-error`;

		React.useEffect(() => {
			if (typeof value === "string") {
				setPhone(value);
			}
		}, [value]);

		const validatePhone = React.useCallback(
			(phoneValue: string) => {
				if (!phoneValue) {
					setValidationState("invalid"); // Empty is now invalid
					onValidationChange?.(false);
					return;
				}

				if (validateChinesePhone(phoneValue)) {
					setValidationState("valid");
					onValidationChange?.(true);
				} else {
					setValidationState("invalid");
					onValidationChange?.(false);
				}
			},
			[onValidationChange],
		);

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			// Allow navigation and editing keys
			if (
				[
					"Backspace",
					"Delete",
					"Tab",
					"Escape",
					"Enter",
					"ArrowLeft",
					"ArrowRight",
					"ArrowUp",
					"ArrowDown",
				].includes(e.key)
			) {
				return;
			}
			// Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
			if (
				(e.ctrlKey || e.metaKey) &&
				["a", "c", "v", "x"].includes(e.key.toLowerCase())
			) {
				return;
			}
			// Only allow digits 0-9
			if (!/^[0-9]$/.test(e.key)) {
				e.preventDefault();
			}
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			let newValue = e.target.value;

			// Only allow digits, remove any non-digit characters (for paste operations)
			newValue = newValue.replace(/\D/g, "");

			// Limit to 11 digits
			if (newValue.length > 11) {
				newValue = newValue.slice(0, 11);
			}

			setPhone(newValue);

			// Create a new event with the cleaned value
			const syntheticEvent = {
				...e,
				target: {
					...e.target,
					value: newValue,
				},
			} as React.ChangeEvent<HTMLInputElement>;

			onChange?.(syntheticEvent);

			// Real-time validation after focus
			if (hasFocused) {
				validatePhone(newValue);
			}
		};

		const handleFocus = () => {
			setHasFocused(true);
			// Validate immediately on focus
			validatePhone(phone);
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

		const getValidationMessage = () => {
			if (validationState === "invalid") {
				if (phone.length === 0) return "Phone number is required";
				if (phone.length < 11) return "Phone number must be 11 digits";
				if (!phone.startsWith("1")) return "Phone number must start with 1";
				if (!/[3-9]/.test(phone[1])) return "Invalid phone number format";
				return "Invalid phone number";
			}
			return "";
		};

		const hasError =
			showValidation && hasFocused && validationState === "invalid";

		return (
			<div className="space-y-2">
				<div className="relative">
					<Input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						className={cn("pr-10", getStatusColor(), className)}
						ref={ref}
						value={phone}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onFocus={handleFocus}
						placeholder="13812345678"
						maxLength={11}
						aria-invalid={hasError}
						aria-describedby={hasError ? errorId : undefined}
						{...props}
					/>
					<div
						className="absolute right-3 top-1/2 -translate-y-1/2"
						aria-hidden="true"
					>
						{showValidation && getStatusIcon()}
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
							{getValidationMessage()}
						</span>
					)}
				</div>
			</div>
		);
	},
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
