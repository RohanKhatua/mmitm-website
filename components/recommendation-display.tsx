"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	MapPin,
	List,
	LayoutGrid,
	ScrollText,
	AlertCircle,
} from "lucide-react";
import { RecommendationResults } from "@/components/recommendation-results";
import { EmbedMapViewRecommendations } from "@/components/embed-map-view-recommendations";
import type {
	EnhancedVenueRecommendation,
	ParticipantInput,
	ParticipantLocationWithId,
	RecommendationDisplayProps,
	ViewMode,
} from "@/lib/types";

export function RecommendationDisplay({
	recommendations,
	participants,
	isLoading,
	sessionId,
}: RecommendationDisplayProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("card");

	return (
		<div className="w-full flex flex-col">
			{/* View Mode Toggle */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Button
						onClick={() => setViewMode("card")}
						variant={viewMode === "card" ? "default" : "outline"}
						size="sm">
						<LayoutGrid className="h-4 w-4 mr-2" />
						Card Deck
					</Button>
					<Button
						onClick={() => setViewMode("list")}
						variant={viewMode === "list" ? "default" : "outline"}
						size="sm">
						<ScrollText className="h-4 w-4 mr-2" />
						List View
					</Button>
					<Button
						onClick={() => setViewMode("map")}
						variant={viewMode === "map" ? "default" : "outline"}
						size="sm">
						<MapPin className="h-4 w-4 mr-2" />
						Map View
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1">
				{viewMode === "card" && (
					<RecommendationResults
						recommendations={recommendations}
						participants={participants}
						isLoading={isLoading}
						sessionId={sessionId}
						viewMode="card"
					/>
				)}
				{viewMode === "list" && (
					<RecommendationResults
						recommendations={recommendations}
						participants={participants}
						isLoading={isLoading}
						sessionId={sessionId}
						viewMode="list"
					/>
				)}
				{viewMode === "map" && (
					<EmbedMapViewRecommendations
						recommendations={recommendations}
						participants={participants}
						isLoading={isLoading}
						className="h-[70vh]"
					/>
				)}
			</div>
		</div>
	);
}
