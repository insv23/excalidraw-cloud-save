import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface NameInputProps {
	id?: string;
	name?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onValidationChange: (isValid: boolean) => void;
	onFocus?: () => void;
	focused?: boolean;
	placeholder?: string;
	autoComplete?: string;
	required?: boolean;
	className?: string;
}

export function NameInput({
	id = "name",
	name = "name",
	value,
	onChange,
	onValidationChange,
	onFocus,
	focused = false,
	placeholder = "Enter your full name",
	autoComplete = "name",
	required = false,
	className,
}: NameInputProps) {
	const isValid = value.trim().length >= 2;
	const errorId = `${id}-error`;
	const hasError = focused && !isValid;

	React.useEffect(() => {
		onValidationChange(isValid);
	}, [isValid, onValidationChange]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e);
	};

	const handleFocus = () => {
		onFocus?.();
	};

	const getValidationMessage = () => {
		if (value.length === 0) return "Name is required";
		return "Name must be at least 2 characters";
	};

	return (
		<div className="space-y-2">
			<div className="relative">
				<input
					id={id}
					name={name}
					type="text"
					placeholder={placeholder}
					autoComplete={autoComplete}
					required={required}
					value={value}
					onChange={handleChange}
					onFocus={handleFocus}
					aria-invalid={hasError}
					aria-describedby={hasError ? errorId : undefined}
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
						focused
							? isValid
								? "border-green-500 focus-visible:ring-green-500 pr-10"
								: "border-red-500 focus-visible:ring-red-500"
							: "",
						className,
					)}
				/>
				<div className="absolute right-0 top-0 h-full flex items-center">
					{focused && isValid && (
						<div className="px-3" aria-hidden="true">
							<Check className="h-4 w-4 text-green-500" />
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
						{getValidationMessage()}
					</span>
				)}
			</div>
		</div>
	);
}
