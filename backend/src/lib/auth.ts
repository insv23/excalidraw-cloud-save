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

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite", // or "mysql", "pg"
	}),

	// enable email and password authentication
	emailAndPassword: {
		enabled: true,
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
