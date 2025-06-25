import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardPage from "./pages/dashboard";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

export default function App() {
	const location = useLocation();

	return (
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
			</Routes>
		</ThemeProvider>
	);
}
