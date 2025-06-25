import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";

// Load environment-specific .env file
const nodeEnv = process.env.NODE_ENV || "development";
config({ path: `.env.${nodeEnv}` });

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
