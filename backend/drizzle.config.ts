import { env } from "@/lib/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: ["./src/db/auth.schema.ts"],
	dialect: "sqlite",
	dbCredentials: {
		url: env.DB_FILE_NAME,
	},
});
