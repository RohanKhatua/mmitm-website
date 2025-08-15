import { useState, useEffect, useCallback, useRef } from "react";
import {
	SessionStatus,
	EnhancedVenueRecommendation,
	SessionHealth,
	UseSessionPollingHookProps,
	Session,
} from "@/lib/types";

export function useSessionPolling({
	sessionId,
	onSessionUpdate,
	pollingInterval = 3000,
}: UseSessionPollingHookProps) {
	const [lastKnownUpdate, setLastKnownUpdate] = useState<string>("");
	const [isPolling, setIsPolling] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<
		"connected" | "disconnected" | "error"
	>("connected");

	const fetchFullSession = useCallback(async () => {
		try {
			const response = await fetch(`/api/sessions/${sessionId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch session");
			}
			const data = await response.json();
			onSessionUpdate(data.session);
			setLastKnownUpdate(data.session.updated_at);
			setConnectionStatus("connected");
		} catch (error) {
			console.error("Error fetching full session:", error);
			setConnectionStatus("error");
		}
	}, [sessionId, onSessionUpdate]);

	const checkSessionHealth = useCallback(async () => {
		try {
			const response = await fetch(`/api/sessions/${sessionId}/health`);
			if (!response.ok) {
				throw new Error("Health check failed");
			}
			const health: SessionHealth = await response.json();

			// If there are meaningful changes, fetch the full session
			if (health.updated_at > lastKnownUpdate) {
				await fetchFullSession();
			}

			setConnectionStatus("connected");
		} catch (error) {
			console.error("Error checking session health:", error);
			setConnectionStatus("error");
		}
	}, [sessionId, lastKnownUpdate, fetchFullSession]);

	useEffect(() => {
		if (!isPolling) return;

		const interval = setInterval(checkSessionHealth, pollingInterval);
		return () => clearInterval(interval);
	}, [checkSessionHealth, pollingInterval, isPolling]);

	const startPolling = useCallback(() => setIsPolling(true), []);
	const stopPolling = useCallback(() => setIsPolling(false), []);

	return {
		isPolling,
		connectionStatus,
		startPolling,
		stopPolling,
		refreshSession: fetchFullSession,
	};
}
