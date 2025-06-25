import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { consola } from "consola";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

const server = serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		consola.success(`🚀 Server is running on http://localhost:${info.port}`);
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
