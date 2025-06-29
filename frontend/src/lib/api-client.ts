import { env } from "./env";

export class ApiError extends Error {
	status: number;
	details?: unknown;

	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Generic API client with authentication support
 */
export async function apiClient<T = unknown>(
	endpoint: string,
	options: RequestOptions = {},
): Promise<T> {
	const { params, headers = {}, ...fetchOptions } = options;

	// Build URL with query parameters
	const url = new URL(endpoint, env.VITE_API_BASE_URL);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined) {
				url.searchParams.append(key, String(value));
			}
		});
	}

	// Merge headers
	const requestHeaders: HeadersInit = {
		"Content-Type": "application/json",
		...headers,
	};

	// Better Auth handles authentication via cookies automatically
	// No need to manually add auth headers

	try {
		const response = await fetch(url.toString(), {
			...fetchOptions,
			headers: requestHeaders,
			// Include credentials for cookie-based auth
			credentials: "include",
		});

		// Handle non-OK responses
		if (!response.ok) {
			let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
			let errorDetails: unknown;

			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorMessage;
				errorDetails = errorData.details;
			} catch {
				// Failed to parse error response
			}

			throw new ApiError(response.status, errorMessage, errorDetails);
		}

		// Handle empty responses
		if (response.status === 204) {
			return undefined as T;
		}

		// Parse JSON response
		return await response.json();
	} catch (error) {
		// Re-throw ApiError instances
		if (error instanceof ApiError) {
			throw error;
		}

		// Wrap other errors
		if (error instanceof Error) {
			throw new ApiError(0, error.message);
		}

		throw new ApiError(0, "An unknown error occurred");
	}
}

// Convenience methods for common HTTP verbs
export const api = {
	get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
		apiClient<T>(endpoint, { ...options, method: "GET" }),

	post: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
		apiClient<T>(endpoint, {
			...options,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		}),

	patch: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
		apiClient<T>(endpoint, {
			...options,
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		}),

	put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
		apiClient<T>(endpoint, {
			...options,
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		}),

	delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
		apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};