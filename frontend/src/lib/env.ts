import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		// API Base URL for Better Auth
		VITE_API_BASE_URL: z
			.string()
			.url("VITE_API_BASE_URL must be a valid URL")
			.default("http://localhost:3000"),

		// App environment
		VITE_APP_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},

	/**
	 * What object holds the environment variables at runtime.
	 * For Vite, this is `import.meta.env`.
	 */
	runtimeEnv: import.meta.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `VITE_PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type-mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `VITE_API_URL=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
