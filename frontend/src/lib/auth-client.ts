import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";
import { env } from "./env";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: env.VITE_API_BASE_URL,
	plugins: [phoneNumberClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
