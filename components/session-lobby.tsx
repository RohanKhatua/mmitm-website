"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocationInput } from "@/components/location-input";
import { RecommendationDisplay } from "@/components/recommendation-display";
import { Copy, Users, Settings, MapPin, Zap, Clock } from "lucide-react";
import {
	Session,
	Participant,
	SessionSettings,
	SessionLobbyProps,
} from "@/lib/types";

export function SessionLobby({
	session,
	currentUserId,
	onSessionUpdate,
}: SessionLobbyProps) {
	const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
	const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
		useState(false);
	const [recentUpdates, setRecentUpdates] = useState<Set<string>>(new Set());
	const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
	const [recommendations, setRecommendations] = useState<any[]>([]);

	const participants = Object.values(session.participants);
	const currentUser = currentUserId
		? session.participants[currentUserId]
		: null;
	const readyCount = participants.filter((p) => p.is_ready).length;
	const totalCount = participants.length;

	useEffect(() => {
		if (session.updated_at !== lastUpdateTime) {
			setLastUpdateTime(session.updated_at);
			const updatedParticipants = new Set<string>();
			participants.forEach((p) => {
				if (new Date(p.joined_at).getTime() > Date.now() - 10000) {
					updatedParticipants.add(p.user_id);
				}
			});
			setRecentUpdates(updatedParticipants);

			setTimeout(() => setRecentUpdates(new Set()), 3000);
		}
	}, [session.updated_at, lastUpdateTime, participants]);

	const copyJoinCode = async () => {
		const joinCode = "ABC123";
		try {
			await navigator.clipboard.writeText(joinCode);
		} catch (err) {
			console.error("Failed to copy join code:", err);
		}
	};

	const updateLocation = async (
		location: { lat: number; lng: number } | { address: string }
	) => {
		if (!currentUserId) return;

		setIsUpdatingLocation(true);
		try {
			const response = await fetch(
				`/api/sessions/${session.id}/participants/${currentUserId}/location`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						session_id: session.id,
						user_id: currentUserId,
						location,
						is_ready: true,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update location");
			}

			const data = await response.json();
			onSessionUpdate(data.session);
		} catch (err) {
			console.error("Error updating location:", err);
		} finally {
			setIsUpdatingLocation(false);
		}
	};

	const generateRecommendations = async () => {
		if (!currentUserId) return;

		setIsGeneratingRecommendations(true);
		try {
			const response = await fetch(
				`/api/sessions/${session.id}/recommendations`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						session_id: session.id,
						user_id: currentUserId,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to generate recommendations");
			}

			const data = await response.json();
			onSessionUpdate(data.session);
			if (data.recommendations) {
				setRecommendations(data.recommendations);
			}
		} catch (err) {
			console.error("Error generating recommendations:", err);
		} finally {
			setIsGeneratingRecommendations(false);
		}
	};

	const getStatusDisplay = () => {
		switch (session.status) {
			case "waiting_for_participants":
				return {
					text: "Waiting for participants",
					color: "bg-yellow-100 text-yellow-800",
				};
			case "ready_for_recommendations":
				return {
					text: "Ready for recommendations",
					color: "bg-green-100 text-green-800",
				};
			case "generating_recommendations":
				return {
					text: "Generating recommendations",
					color: "bg-blue-100 text-blue-800",
				};
			case "recommendations_ready":
				return {
					text: "Recommendations ready",
					color: "bg-green-100 text-green-800",
				};
			default:
				return { text: session.status, color: "bg-gray-100 text-gray-800" };
		}
	};

	const statusDisplay = getStatusDisplay();

	return (
		<div className="space-y-6">
			{/* Session Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl">{session.name}</CardTitle>
							<div className="flex items-center space-x-4 mt-2">
								<Badge className={statusDisplay.color}>
									{statusDisplay.text}
								</Badge>
								<span className="text-sm text-gray-500">
									{readyCount}/{totalCount} participants ready
								</span>
								<div className="flex items-center space-x-1 text-xs text-gray-400">
									<Clock className="h-3 w-3" />
									<span>
										Updated {new Date(session.updated_at).toLocaleTimeString()}
									</span>
								</div>
							</div>
						</div>
						<Button onClick={copyJoinCode} variant="outline" size="sm">
							<Copy className="h-4 w-4 mr-2" />
							Copy Join Code
						</Button>
					</div>
				</CardHeader>
			</Card>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Participants */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Users className="h-5 w-5" />
							<span>Participants ({totalCount})</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{participants.map((participant) => (
							<div
								key={participant.user_id}
								className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${
									recentUpdates.has(participant.user_id)
										? "bg-green-50 border-green-200 shadow-sm"
										: "bg-white border-gray-200"
								}`}>
								<div className="flex items-center space-x-3">
									<div
										className={`w-3 h-3 rounded-full transition-colors ${
											participant.is_ready ? "bg-green-500" : "bg-gray-300"
										}`}
									/>
									<div>
										<p className="font-medium">{participant.name}</p>
										{participant.user_id === currentUserId && (
											<p className="text-xs text-gray-500">(You)</p>
										)}
										{recentUpdates.has(participant.user_id) && (
											<p className="text-xs text-green-600">Recently joined</p>
										)}
									</div>
								</div>
								<div className="text-sm text-gray-500">
									{participant.is_ready ? "Ready" : "Setting location..."}
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Your Location */}
				{currentUser && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<MapPin className="h-5 w-5" />
								<span>Your Location</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<LocationInput
								onLocationSelect={updateLocation}
								currentLocation={currentUser.location}
							/>
							{isUpdatingLocation && (
								<div className="mt-3 text-sm text-gray-500">
									Updating location...
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>

			{/* Session Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Settings className="h-5 w-5" />
						<span>Session Settings</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-medium text-gray-700 mb-2">
								Venue Types
							</p>
							<div className="flex flex-wrap gap-2">
								{session.settings.categories.map((category) => (
									<Badge key={category} variant="secondary">
										{category}
									</Badge>
								))}
							</div>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-700 mb-2">
								Transport Mode
							</p>
							<Badge variant="outline">{session.settings.transport_mode}</Badge>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-700 mb-2">
								Max Recommendations
							</p>
							<Badge variant="outline">{session.settings.limit}</Badge>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-700 mb-2">Settings</p>
							<div className="space-y-1">
								{session.settings.auto_refresh && (
									<Badge variant="secondary">Auto-refresh</Badge>
								)}
								{session.settings.require_all_participants && (
									<Badge variant="secondary">Require all</Badge>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Generate Recommendations */}
			{session.status === "ready_for_recommendations" && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<Button
								onClick={generateRecommendations}
								disabled={isGeneratingRecommendations}
								size="lg"
								className="bg-primary hover:bg-primary/90">
								<Zap className="h-5 w-5 mr-2" />
								{isGeneratingRecommendations
									? "Generating..."
									: "Generate Recommendations"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{(session.status === "recommendations_ready" ||
				recommendations.length > 0) && (
				<RecommendationDisplay
					recommendations={recommendations}
					participants={Object.values(session.participants).map((p, index) => ({
						id: p.user_id,
						name: p.name,
						location: p.location,
					}))}
					isLoading={isGeneratingRecommendations}
					sessionId={session.id}
				/>
			)}
		</div>
	);
}
