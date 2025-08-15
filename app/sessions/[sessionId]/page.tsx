"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { SessionLobby } from "@/components/session-lobby";
import { ConnectionStatus } from "@/components/connection-status";
import { useSessionPolling } from "@/hooks/use-session-polling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Session, Participant, SessionSettings } from "@/lib/types";

export default function SessionPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const sessionId = params.sessionId as string;
	const userId = searchParams.get("userId");

	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { connectionStatus, refreshSession } = useSessionPolling({
		sessionId,
		onSessionUpdate: (updatedSession: Session) => setSession(updatedSession),
		pollingInterval: 3000, // Poll every 3 seconds
	});

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const response = await fetch(`/api/sessions/${sessionId}`);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to fetch session");
				}
				const data = await response.json();
				setSession(data.session);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		if (sessionId) {
			fetchSession();
		}
	}, [sessionId]);

	if (isLoading) {
		return (
			<main className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
								<p className="text-gray-600">Loading session...</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	if (error || !session) {
		return (
			<main className="min-h-screen bg-gray-50">
				<Navigation />
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Card>
						<CardHeader>
							<CardTitle>Session Not Found</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600">
								{error || "The session you're looking for doesn't exist."}
							</p>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50">
			<Navigation />
			<ConnectionStatus status={connectionStatus} onRetry={refreshSession} />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<SessionLobby
					session={session}
					currentUserId={userId}
					onSessionUpdate={setSession}
				/>
			</div>
		</main>
	);
}
