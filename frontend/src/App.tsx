import { Routes, Route, useLocation } from "react-router-dom";
import DashboardPage from "./pages/dashboard";

export default function App() {
	const location = useLocation();

	return (
		<>
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<DashboardPage />} />
			</Routes>
		</>
	);
}
