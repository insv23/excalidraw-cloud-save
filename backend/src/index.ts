import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { consola } from "consola";
import { env } from "@/lib/env";
import { auth } from "@/lib/auth";

const app = new Hono();

// Enable CORS (optional)
app.use("/api/auth/**", cors());

// Better-Auth route handler
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

const server = serve(
	{
		fetch: app.fetch,
		port: env.PORT,
	},
	(info) => {
		consola.success(`🚀 Server is running on ${env.BETTER_AUTH_URL}`);
		consola.info(`📊 Environment: ${env.NODE_ENV}`);
		consola.info(`🗄️ Database: ${env.DB_FILE_NAME}`);
	},
);

// graceful shutdown
process.on("SIGINT", () => {
	consola.warn("🔄 Received SIGINT, shutting down gracefully...");
	server.close();
	consola.success("👋 Server closed gracefully");
	process.exit(0);
});

process.on("SIGTERM", () => {
	consola.warn("🔄 Received SIGTERM, shutting down gracefully...");
	server.close((err) => {
		if (err) {
			consola.error("❌ Error during shutdown:", err);
			process.exit(1);
		}
		consola.success("👋 Server closed gracefully");
		process.exit(0);
	});
});
