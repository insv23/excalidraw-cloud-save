import * as React from "react";
import { OTPInput, REGEXP_ONLY_DIGITS, OTPInputContext } from "input-otp";
import { InputOTPGroup } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

export interface VerificationCodeInputProps {
	id?: string;
	maxLength?: 4 | 6;
	showValidation?: boolean;
	onValidationChange?: (isValid: boolean, code: string) => void;
	className?: string;
	containerClassName?: string;
}

export interface VerificationCodeInputRef {
	focus: () => void;
}

// Custom OTP Slot with validation state support
function CustomInputOTPSlot({
	index,
	className,
	isValid = false,
	hasFocused = false,
	...props
}: React.ComponentProps<"div"> & {
	index: number;
	isValid?: boolean;
	hasFocused?: boolean;
}) {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	const getSlotBorderColor = () => {
		if (!hasFocused) return "";
		if (isValid && char) return "border-green-500";
		if (hasFocused) return "border-red-500";
		return "";
	};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				"data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
				getSlotBorderColor(),
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
				</div>
			)}
		</div>
	);
}

const VerificationCodeInput = React.forwardRef<
	VerificationCodeInputRef,
	VerificationCodeInputProps
>(
	(
		{
			maxLength = 4,
			showValidation = true,
			onValidationChange,
			className,
			containerClassName,
			...props
		},
		ref,
	) => {
		const [code, setCode] = React.useState("");
		const [validationState, setValidationState] = React.useState<
			"idle" | "valid" | "invalid"
		>("idle");
		const [hasFocused, setHasFocused] = React.useState(false);
		const otpInputRef = React.useRef<HTMLDivElement>(null);

		// Generate unique IDs for accessibility
		const inputId = props.id || "verification-code";
		const errorId = `${inputId}-error`;

		// Expose focus method to parent components
		React.useImperativeHandle(
			ref,
			() => ({
				focus: () => {
					if (otpInputRef.current) {
						// Find the first input element inside the OTP container and focus it
						const firstInput = otpInputRef.current.querySelector("input");
						if (firstInput) {
							firstInput.focus();
						}
					}
				},
			}),
			[],
		);

		const validateCode = React.useCallback(
			(codeValue: string) => {
				if (!codeValue) {
					setValidationState("invalid"); // Empty is now invalid
					onValidationChange?.(false, codeValue);
					return;
				}

				if (codeValue.length === maxLength) {
					setValidationState("valid");
					onValidationChange?.(true, codeValue);
				} else {
					setValidationState("invalid");
					onValidationChange?.(false, codeValue);
				}
			},
			[maxLength, onValidationChange],
		);

		const handleChange = (value: string) => {
			setCode(value);

			// Real-time validation after focus
			if (hasFocused) {
				validateCode(value);
			}
		};

		const handleFocus = () => {
			setHasFocused(true);
			// Validate immediately on focus
			validateCode(code);
		};

		const getValidationMessage = () => {
			if (validationState === "invalid") {
				if (code.length === 0) return "Verification code is required";
				return `Please enter all ${maxLength} digits`;
			}
			return "";
		};

		const hasError = hasFocused && validationState === "invalid";

		return (
			<div className="space-y-2" ref={otpInputRef}>
				<OTPInput
					maxLength={maxLength}
					value={code}
					onChange={handleChange}
					onFocus={handleFocus}
					pattern={REGEXP_ONLY_DIGITS}
					inputMode="numeric"
					aria-invalid={hasError}
					aria-describedby={hasError ? errorId : undefined}
					aria-label={`Enter ${maxLength}-digit verification code`}
					containerClassName={cn(
						"group flex items-center justify-center gap-2 has-disabled:opacity-50",
						containerClassName,
					)}
					{...props}
				>
					<InputOTPGroup>
						{maxLength === 6 ? (
							<>
								<CustomInputOTPSlot
									key="slot-0"
									index={0}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-1"
									index={1}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-2"
									index={2}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-3"
									index={3}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-4"
									index={4}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-5"
									index={5}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
							</>
						) : (
							<>
								<CustomInputOTPSlot
									key="slot-0"
									index={0}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-1"
									index={1}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-2"
									index={2}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
								<CustomInputOTPSlot
									key="slot-3"
									index={3}
									isValid={validationState === "valid"}
									hasFocused={hasFocused}
								/>
							</>
						)}
					</InputOTPGroup>
				</OTPInput>

				{/* Validation message area */}
				<div className="flex items-center justify-center transition-all duration-200 ease-in-out">
					{showValidation && hasError && (
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

VerificationCodeInput.displayName = "VerificationCodeInput";

export { VerificationCodeInput };
