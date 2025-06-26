import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// 加载环境变量
	const env = loadEnv(mode, process.cwd(), "");

	// 解析允许的主机列表
	const allowedHosts = env.VITE_PREVIEW_ALLOWED_HOSTS
		? env.VITE_PREVIEW_ALLOWED_HOSTS.split(",").map((host) => host.trim())
		: ["localhost"];

	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		preview: {
			allowedHosts,
			host: true, // 允许外部访问
			port: 4173, // 与 Dockerfile 保持一致
		},
	};
});
