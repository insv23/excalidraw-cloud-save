import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	banned: integer("banned", { mode: "boolean" }),
	banReason: text("ban_reason"),
	banExpires: integer("ban_expires", { mode: "timestamp" }),
	username: text("username").unique(),
	displayUsername: text("display_username"),
	isAnonymous: integer("is_anonymous", { mode: "boolean" }),
	phoneNumber: text("phone_number").unique(),
	phoneNumberVerified: integer("phone_number_verified", { mode: "boolean" }),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const apikey = sqliteTable("apikey", {
	id: text("id").primaryKey(),
	name: text("name"),
	start: text("start"),
	prefix: text("prefix"),
	key: text("key").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: integer("last_refill_at", { mode: "timestamp" }),
	enabled: integer("enabled", { mode: "boolean" }).default(true),
	rateLimitEnabled: integer("rate_limit_enabled", { mode: "boolean" }).default(
		true,
	),
	rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
	rateLimitMax: integer("rate_limit_max").default(10),
	requestCount: integer("request_count"),
	remaining: integer("remaining"),
	lastRequest: integer("last_request", { mode: "timestamp" }),
	expiresAt: integer("expires_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	permissions: text("permissions"),
	metadata: text("metadata"),
});
