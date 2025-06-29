import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import SidebarLayout from "./pages/sidebar-layout";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ErrorPage from "./pages/error-page";

export default function App() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<Routes>
				<Route path="/" element={<SidebarLayout />} />
				<Route path="/:id" element={<SidebarLayout />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/error/:type" element={<ErrorPage />} />
			</Routes>
		</ThemeProvider>
	);
}
