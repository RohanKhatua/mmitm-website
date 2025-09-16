"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { LocationInput } from "@/components/location-input";
import { PreferencesBar } from "@/components/preferences-bar";
import { RecommendationDisplay } from "@/components/recommendation-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Plus, Trash2 } from "lucide-react";
import {
	EnhancedVenueRecommendation,
	TransportMode,
	PlaceCategory,
	ParticipantLocationWithId,
	Preferences,
} from "@/lib/types";

export default function InstantRecommendationsPage() {
	const [participants, setParticipants] = useState<ParticipantLocationWithId[]>(
		[
			{ id: "1", name: "Participant 1", location: null },
			{ id: "2", name: "Participant 2", location: null },
		]
	);
	const [preferences, setPreferences] = useState<Preferences>({
		categories: ["restaurant" as PlaceCategory],
		transportMode: "DRIVE",
		limit: 10,
	});
	const [recommendations, setRecommendations] = useState<
		EnhancedVenueRecommendation[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const addParticipant = () => {
		const newId = (participants.length + 1).toString();
		setParticipants([
			...participants,
			{ id: newId, name: `Participant ${newId}`, location: null },
		]);
	};

	const removeParticipant = (id: string) => {
		if (participants.length > 2) {
			setParticipants(participants.filter((p) => p.id !== id));
		}
	};

	const updateParticipant = (
		id: string,
		updates: Partial<ParticipantLocationWithId>
	) => {
		setParticipants(
			participants.map((p) => (p.id === id ? { ...p, ...updates } : p))
		);
	};

	const canGetRecommendations = participants.every((p) => p.location !== null);

	const getRecommendations = async () => {
		if (!canGetRecommendations) return;

		setIsLoading(true);
		setError(null);

		try {
			// Transform participants to API format
			const participantLocations = participants.map((p) => p.location!);

			const response = await fetch("/api/recommendations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					participants: participantLocations,
					categories: preferences.categories,
					transport_mode: preferences.transportMode,
					limit: preferences.limit,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to get recommendations");
			}

			const data = await response.json();
			setRecommendations(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-gray-50">
			<Navigation />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Instant Recommendations
					</h1>
					<p className="text-xl text-gray-600">
						Get venue recommendations instantly by adding participant locations
						and preferences.
					</p>
				</div>

				{/* Preferences Bar */}
				<PreferencesBar
					preferences={preferences}
					onPreferencesChangeAction={setPreferences}
				/>

				<div className="grid lg:grid-cols-2 gap-8">
					{/* Input Section */}
					<div className="space-y-6">
						{/* Participants */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Participants</span>
									<Button onClick={addParticipant} size="sm" variant="outline">
										<Plus className="h-4 w-4 mr-2" />
										Add Participant
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{participants.map((participant) => (
									<div key={participant.id} className="border rounded-lg p-4">
										<div className="flex items-center justify-between mb-3">
											<input
												type="text"
												value={participant.name}
												onChange={(e) =>
													updateParticipant(participant.id, {
														name: e.target.value,
													})
												}
												className="font-medium text-gray-900 bg-transparent border-none outline-none"
											/>
											{participants.length > 2 && (
												<Button
													onClick={() => removeParticipant(participant.id)}
													size="sm"
													variant="ghost"
													className="text-red-600 hover:text-red-700">
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
										<LocationInput
											onLocationSelected={(location) =>
												updateParticipant(participant.id, { location })
											}
											currentLocation={participant.location}
										/>
									</div>
								))}
							</CardContent>
						</Card>

						{/* Get Recommendations Button */}
						<Button
							onClick={getRecommendations}
							disabled={!canGetRecommendations || isLoading}
							size="lg"
							className="w-full bg-primary hover:bg-primary/90">
							<Zap className="h-5 w-5 mr-2" />
							{isLoading ? "Finding Venues..." : "Get Recommendations"}
						</Button>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<p className="text-red-800">{error}</p>
							</div>
						)}
					</div>

					{/* Results Section */}
					<div>
						<RecommendationDisplay
							recommendations={recommendations}
							participants={participants}
							isLoading={isLoading}
							sessionId={undefined}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
