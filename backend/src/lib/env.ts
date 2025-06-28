import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";

// Load environment-specific .env file only in development
// Production environment relies on Docker-passed environment variables
const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "development") {
	config({ path: `.env.${nodeEnv}` });
}

export const env = createEnv({
	server: {
		// Better Auth configuration
		BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
		BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

		// Database configuration
		DB_FILE_NAME: z.string().min(1, "DB_FILE_NAME is required"),

		// Node.js environment
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),

		// Server port
		PORT: z.coerce.number().positive().default(3000),

		// Better Auth trusted origins
		// backend/src/lib/auth.ts: trustedOrigins
		BETTER_AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:5173"),

		// CORS allowed origins
		// backend/src/index.ts: cors({
		// 		origin: ...
		// 	}),
		CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),

		// Email registration control
		// Controls whether new user email registration is allowed
		// Set to "true" to disable email registration, "false" or empty to allow email registration
		DISABLE_EMAIL_REGISTRATION: z
			.string()
			.transform((val) => val === "true")
			.default("false"),
	},

	/**
	 * What object holds the environment variables at runtime.
	 * For Node.js, this is usually `process.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
