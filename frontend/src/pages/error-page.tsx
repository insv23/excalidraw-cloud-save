import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Lock, Trash2, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ErrorType } from "@/types/drawing";

const errorConfig = {
	"not-found": {
		icon: FileX,
		title: "Drawing not found",
		description:
			"The drawing you're looking for doesn't exist or has been removed.",
	},
	private: {
		icon: Lock,
		title: "This drawing is private",
		description:
			"You need to log in to view this drawing, or it may belong to another user.",
	},
	deleted: {
		icon: Trash2,
		title: "This drawing has been deleted",
		description:
			"This drawing has been moved to trash and is no longer accessible.",
	},
	forbidden: {
		icon: AlertCircle,
		title: "Access denied",
		description: "You don't have permission to view this drawing.",
	},
};

export default function ErrorPage() {
	const { type } = useParams<{ type: string }>();
	const navigate = useNavigate();

	const errorType = (type as ErrorType) || "not-found";
	const config = errorConfig[errorType] || errorConfig["not-found"];
	const IconComponent = config.icon;

	const handleGoHome = () => {
		navigate("/");
	};

	const handleLogin = () => {
		navigate("/login");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="max-w-md mx-auto text-center space-y-6">
				<div className="flex justify-center">
					<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
						<IconComponent className="w-8 h-8 text-muted-foreground" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold">{config.title}</h1>
					<p className="text-muted-foreground">{config.description}</p>
				</div>

				<div className="space-y-3">
					<Button onClick={handleGoHome} className="w-full">
						Go to Home
					</Button>

					{errorType === "private" && (
						<Button variant="outline" onClick={handleLogin} className="w-full">
							Sign In
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
