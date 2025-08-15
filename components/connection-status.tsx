"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from "lucide-react";
import { ConnectionStatusProps } from "@/lib/types";

export function ConnectionStatus({ status, onRetry }: ConnectionStatusProps) {
	if (status === "connected") {
		return null; // Don't show anything when connected
	}

	const getStatusConfig = () => {
		switch (status) {
			case "disconnected":
				return {
					icon: WifiOff,
					title: "Connection Lost",
					description: "Trying to reconnect to the session...",
					variant: "default" as const,
					showRetry: false,
				};
			case "error":
				return {
					icon: AlertTriangle,
					title: "Connection Error",
					description:
						"Unable to sync with the session. Click retry to reconnect.",
					variant: "destructive" as const,
					showRetry: true,
				};
			default:
				return {
					icon: Wifi,
					title: "Connected",
					description: "Session is up to date",
					variant: "default" as const,
					showRetry: false,
				};
		}
	};

	const config = getStatusConfig();
	const Icon = config.icon;

	return (
		<div className="sticky top-16 z-40 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				<Alert variant={config.variant} className="mb-4">
					<Icon className="h-4 w-4" />
					<AlertDescription className="flex items-center justify-between">
						<div>
							<strong>{config.title}:</strong> {config.description}
						</div>
						{config.showRetry && onRetry && (
							<Button
								onClick={onRetry}
								size="sm"
								variant="outline"
								className="ml-4 bg-transparent">
								<RefreshCw className="h-4 w-4 mr-2" />
								Retry
							</Button>
						)}
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}
