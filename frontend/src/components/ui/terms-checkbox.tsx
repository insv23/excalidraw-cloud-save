import { Checkbox } from "@/components/ui/checkbox";

export interface TermsCheckboxProps {
	id: string;
	name: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	termsUrl?: string;
	privacyUrl?: string;
	className?: string;
}

export function TermsCheckbox({
	id,
	name,
	checked,
	onCheckedChange,
	termsUrl = "/terms",
	privacyUrl = "/privacy",
	className,
}: TermsCheckboxProps) {
	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			<Checkbox
				id={id}
				name={name}
				checked={checked}
				onCheckedChange={(checkedValue) =>
					onCheckedChange(checkedValue === true)
				}
			/>
			<label
				htmlFor={id}
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				I agree to the{" "}
				<a
					href={termsUrl}
					className="underline underline-offset-4 hover:text-primary"
				>
					Terms of Service
				</a>{" "}
				and{" "}
				<a
					href={privacyUrl}
					className="underline underline-offset-4 hover:text-primary"
				>
					Privacy Policy
				</a>
			</label>
		</div>
	);
}
