import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { consola } from "consola";
import { env } from "./lib/env";
import { auth } from "./lib/auth";
import drawingsRouter from "./routes/drawings";
import drawingContentRouter from "./routes/drawing-content";

const app = new Hono();

// General request logging middleware
app.use("*", async (c, next) => {
	const start = Date.now();
	const method = c.req.method;
	const path = c.req.path;

	if (!path.startsWith("/api/auth")) {
		consola.debug(`📥 ${method} ${path}`);
	}

	await next();

	const duration = Date.now() - start;
	if (!path.startsWith("/api/auth")) {
		consola.debug(`📤 ${method} ${path} - ${c.res.status} (${duration}ms)`);
	}
});

// CORS configuration options
const corsOptions = {
	origin: [env.CORS_ALLOWED_ORIGINS],
	credentials: true,
	allowHeaders: ["Content-Type", "Authorization"],
	allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// Enable CORS for auth routes
app.use("/api/auth/**", cors(corsOptions));

// Enable CORS for drawings routes
app.use("/api/drawings", cors(corsOptions));
app.use("/api/drawings/*", cors(corsOptions));
// Better-Auth route handler with logging
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
	const request = c.req.raw;
	const url = new URL(request.url);
	const method = request.method;
	const path = url.pathname;
	const userAgent = request.headers.get("user-agent");
	const origin = request.headers.get("origin");

	// Log incoming request
	consola.info(`🔐 Auth Request: ${method} ${path}`);
	consola.debug(`📍 Origin: ${origin || "unknown"}`);
	consola.debug(
		`🌐 User-Agent: ${userAgent?.substring(0, 50) || "unknown"}...`,
	);

	try {
		const response = await auth.handler(request);
		const status = response.status;

		// Log response status
		if (status >= 200 && status < 300) {
			consola.success(`✅ Auth Response: ${method} ${path} - ${status}`);
		} else if (status >= 400 && status < 500) {
			consola.warn(`⚠️  Auth Response: ${method} ${path} - ${status}`);
		} else if (status >= 500) {
			consola.error(`❌ Auth Response: ${method} ${path} - ${status}`);
		}

		// Log specific auth actions
		if (path.includes("/sign-up")) {
			consola.info("👤 User registration attempt");
		} else if (path.includes("/sign-in")) {
			consola.info("🔑 User login attempt");
		} else if (path.includes("/sign-out")) {
			consola.info("👋 User logout");
		} else if (path.includes("/session")) {
			consola.debug("🔍 Session check");
		}

		return response;
	} catch (error) {
		consola.error(`💥 Auth Handler Error: ${method} ${path}`, error);
		throw error;
	}
});

// Mount drawing routes
app.route("/api/drawings", drawingsRouter);
app.route("/api/drawings", drawingContentRouter);

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
