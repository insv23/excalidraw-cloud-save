import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "@/lib/env";
import { user, session, account, verification } from "./auth.schema";
import { drawings, drawingContents } from "./drawing.schema";

const client = createClient({ url: env.DB_FILE_NAME });

export const db = drizzle(client, {
	schema: { user, session, account, verification, drawings, drawingContents },
});
