import { AuthGuard } from "@/components/auth-guard";

export default function DashboardPage() {
	return (
		<AuthGuard>
			<main className="flex min-h-svh items-center justify-center bg-muted/20">
				
			</main>
		</AuthGuard>
	);
}
