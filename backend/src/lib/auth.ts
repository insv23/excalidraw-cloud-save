import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import consola from "consola";
import {
	admin,
	apiKey,
	username,
	anonymous,
	phoneNumber,
} from "better-auth/plugins";
import { db } from "@/db";
import { env } from "./env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite", // or "mysql", "pg"
	}),

	// trusted origins for CORS
	trustedOrigins: [env.CORS_ALLOWED_ORIGINS],

	// enable email and password authentication
	emailAndPassword: {
		enabled: true,
	},

	// session configuration - controls remember me duration
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days for remember me (in seconds)
		updateAge: 60 * 60 * 24 * 7, // 7 days (session expiration is updated every 1 day)
	},

	// enable plugins
	plugins: [
		admin(),
		apiKey(),
		username(),
		anonymous(),
		phoneNumber({
			sendOTP: async ({ phoneNumber, code }) => {
				// development: print to server console, not send OTP
				consola.box(`Sending OTP to ${phoneNumber}: ${code}`);
				return Promise.resolve();

				// TODO: production: use a real OTP service
				// await smsService.send(phoneNumber, `Your OTP is ${code}`)
			},
			otpLength: 4, // 4 digits, default is 6
			expiresIn: 60 * 5, // 5 minutes
			requireVerification: true, // require verification code to be checked
		}),
	],

	// optional: social login (can be added later)
	// socialProviders: {
	//   github: {
	//     clientId: process.env.GITHUB_CLIENT_ID as string,
	//     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
	//   },
	// },
});
