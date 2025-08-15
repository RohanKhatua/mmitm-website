// Example component showing how to use the new API client
// This can serve as a reference for implementing features

"use client";

import { useState, useEffect } from "react";
import { api, getErrorMessage, isAPIError } from "@/lib/api-client";
import type {
	CreateSessionRequest,
	EnhancedVenueRecommendation,
	ParticipantInput,
} from "@/lib/types";

export function APIExamples() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);

	// Example: Check backend health
	const checkHealth = async () => {
		setLoading(true);
		setError(null);
		try {
			const health = await api.checkHealth();
			setResult(health);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	// Example: Get instant recommendations
	const getRecommendations = async () => {
		setLoading(true);
		setError(null);
		try {
			const recommendations = await api.getInstantRecommendations({
				participants: [
					{ lat: 34.0522, lng: -118.2437 },
					{ address: "Santa Monica, CA" },
				],
				categories: ["restaurant", "cafe"],
				transport_mode: "DRIVE",
				limit: 5,
			});
			setResult(recommendations);
		} catch (err) {
			if (isAPIError(err)) {
				if (err.status === 504) {
					setError("Backend is taking too long to respond. Please try again.");
				} else if (err.status === 502) {
					setError("Backend service is currently unavailable.");
				} else {
					setError(err.message);
				}
			} else {
				setError(getErrorMessage(err));
			}
		} finally {
			setLoading(false);
		}
	};

	// Example: Create a session
	const createSession = async () => {
		setLoading(true);
		setError(null);
		try {
			const sessionRequest: CreateSessionRequest = {
				name: "Team Lunch",
				creator_name: "Alice Smith",
				settings: {
					categories: ["restaurant"],
					transport_mode: "DRIVE",
					limit: 10,
					auto_refresh: true,
					require_all_participants: false,
				},
			};

			const session = await api.createSession(sessionRequest);
			setResult(session);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	// Example: Join a session
	const joinSession = async () => {
		setLoading(true);
		setError(null);
		try {
			const joinResult = await api.joinSession({
				join_code: "ABC123",
				participant_name: "Bob Johnson",
			});
			setResult(joinResult);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">MMITM API Examples</h1>

			<div className="space-y-4 mb-6">
				<button
					onClick={checkHealth}
					disabled={loading}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
					Check Backend Health
				</button>

				<button
					onClick={getRecommendations}
					disabled={loading}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
					Get Instant Recommendations
				</button>

				<button
					onClick={createSession}
					disabled={loading}
					className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50">
					Create Session
				</button>

				<button
					onClick={joinSession}
					disabled={loading}
					className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50">
					Join Session (Demo)
				</button>
			</div>

			{loading && <div className="p-4 bg-gray-100 rounded">Loading...</div>}

			{error && (
				<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
					<strong>Error:</strong> {error}
				</div>
			)}

			{result && (
				<div className="p-4 bg-green-100 border border-green-400 rounded">
					<strong>Result:</strong>
					<pre className="mt-2 text-sm overflow-auto">
						{JSON.stringify(result, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}

// Example of using the API client in a React hook
export function useSessionPolling(sessionId: string | null) {
	const [session, setSession] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) return;

		const pollSession = async () => {
			try {
				// Use the lightweight health endpoint for frequent polling
				const health = await api.getSessionHealth(sessionId);

				// Only fetch full session if there are updates
				// (In a real app, you'd compare timestamps)
				const fullSession = await api.getSession(sessionId);
				setSession(fullSession);
				setError(null);
			} catch (err) {
				setError(getErrorMessage(err));
			}
		};

		// Poll every 3 seconds
		const interval = setInterval(pollSession, 3000);

		// Initial poll
		pollSession();

		return () => clearInterval(interval);
	}, [sessionId]);

	return { session, error };
}
