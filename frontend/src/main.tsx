import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: root element is defined in index.html
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
				<Toaster />
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>,
);
