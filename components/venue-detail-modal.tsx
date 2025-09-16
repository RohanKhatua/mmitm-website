"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Star,
	Clock,
	Navigation,
	ExternalLink,
	MapPin,
	Users,
	Share,
	CheckCircle2,
	AlertCircle,
	Copy,
} from "lucide-react";
import type {
	EnhancedVenueRecommendation,
	ParticipantLocationWithId,
	VenueDetailModalProps,
} from "@/lib/types";
import { shareVenue, copyVenueToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function VenueDetailModal({
	venue,
	participants,
	isOpen,
	onClose,
}: VenueDetailModalProps) {
	const { toast } = useToast();
	if (!venue) return null;

	const getPriceLevelDisplay = (priceLevel?: string) => {
		switch (priceLevel) {
			case "PRICE_LEVEL_FREE":
				return { text: "Free", color: "bg-green-100 text-green-800" };
			case "PRICE_LEVEL_INEXPENSIVE":
				return { text: "$", color: "bg-green-100 text-green-800" };
			case "PRICE_LEVEL_MODERATE":
				return { text: "$$", color: "bg-yellow-100 text-yellow-800" };
			case "PRICE_LEVEL_EXPENSIVE":
				return { text: "$$$", color: "bg-orange-100 text-orange-800" };
			case "PRICE_LEVEL_VERY_EXPENSIVE":
				return { text: "$$$$", color: "bg-red-100 text-red-800" };
			default:
				return { text: "N/A", color: "bg-gray-100 text-gray-800" };
		}
	};

	const priceDisplay = getPriceLevelDisplay(venue.price_level);
	const avgTravelTime =
		venue.travel_times.reduce((sum, t) => sum + t.travel_time_minutes, 0) /
		venue.travel_times.length;
	const maxTravelTime = Math.max(
		...venue.travel_times.map((t) => t.travel_time_minutes)
	);
	const minTravelTime = Math.min(
		...venue.travel_times.map((t) => t.travel_time_minutes)
	);
	const fairnessScore = maxTravelTime - minTravelTime;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">{venue.name}</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Info */}
					<div className="space-y-3">
						<div className="flex items-start space-x-2">
							<MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
							<p className="text-gray-600">{venue.address}</p>
						</div>

						<div className="flex items-center space-x-4">
							{venue.rating && (
								<div className="flex items-center space-x-1">
									<Star className="h-4 w-4 text-yellow-400 fill-current" />
									<span className="font-medium">{venue.rating}</span>
									{venue.reviews && (
										<span className="text-gray-500">
											({venue.reviews.toLocaleString()} reviews)
										</span>
									)}
								</div>
							)}
							<Badge variant="secondary">{venue.category}</Badge>
							<Badge className={priceDisplay.color}>{priceDisplay.text}</Badge>
						</div>
					</div>

					<Separator />

					{/* Travel Analysis */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Travel Analysis</h3>

						<div className="grid grid-cols-3 gap-4">
							<Card>
								<CardContent className="p-4 text-center">
									<div className="text-2xl font-bold text-primary">
										{avgTravelTime.toFixed(1)}
									</div>
									<div className="text-sm text-gray-500">
										Avg Travel Time (min)
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4 text-center">
									<div className="text-2xl font-bold text-accent">
										{fairnessScore}
									</div>
									<div className="text-sm text-gray-500">
										Fairness Score (min)
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4 text-center">
									<div className="text-2xl font-bold text-gray-700">
										{minTravelTime}-{maxTravelTime}
									</div>
									<div className="text-sm text-gray-500">Time Range (min)</div>
								</CardContent>
							</Card>
						</div>

						<div className="space-y-3">
							<h4 className="font-medium">Individual Travel Times</h4>
							{venue.travel_times.map((travelTime) => {
								const participant = participants[travelTime.participant_index];
								const isMinTime =
									travelTime.travel_time_minutes === minTravelTime;
								const isMaxTime =
									travelTime.travel_time_minutes === maxTravelTime;

								return (
									<div
										key={travelTime.participant_index}
										className={`flex items-center justify-between p-3 rounded-lg border ${
											isMinTime
												? "bg-green-50 border-green-200"
												: isMaxTime
												? "bg-red-50 border-red-200"
												: "bg-gray-50"
										}`}>
										<div className="flex items-center space-x-3">
											<Users className="h-4 w-4 text-gray-400" />
											<span className="font-medium">
												{participant?.name ||
													`Participant ${travelTime.participant_index + 1}`}
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<div className="flex items-center space-x-1">
												<Clock className="h-4 w-4 text-gray-400" />
												<span className="font-medium">
													{travelTime.travel_time_minutes} min
												</span>
											</div>
											<Button
												size="sm"
												variant="ghost"
												onClick={() =>
													window.open(
														travelTime.google_maps_directions_url,
														"_blank"
													)
												}>
												<Navigation className="h-3 w-3" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<Separator />

					{/* Fairness Explanation */}
					<div className="bg-blue-50 p-4 rounded-lg">
						<h4 className="font-medium text-blue-900 mb-2">
							Fairness Score Explanation
						</h4>
						<p className="text-sm text-blue-800">
							The fairness score represents the difference between the longest
							and shortest travel times. A lower score means more equitable
							travel times for all participants.{" "}
							{fairnessScore <= 5 && "This venue has excellent fairness!"}
							{fairnessScore > 5 &&
								fairnessScore <= 10 &&
								"This venue has good fairness."}
							{fairnessScore > 10 &&
								"Consider if the travel time difference is acceptable for your group."}
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-3">
						<Button
							onClick={() => window.open(venue.google_maps_url, "_blank")}
							className="flex-1">
							<ExternalLink className="h-4 w-4 mr-2" />
							View on Google Maps
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								const coords = `${venue.lat},${venue.lng}`;
								const mapsUrl = `https://maps.google.com/?q=${coords}`;
								window.open(mapsUrl, "_blank");
							}}
							className="flex-1">
							<MapPin className="h-4 w-4 mr-2" />
							Get Directions
						</Button>
						<Button
							variant="outline"
							onClick={async () => {
								const success = await copyVenueToClipboard(venue);
								if (success) {
									toast({
										title: "Copied to clipboard",
										description:
											"Venue information has been copied to clipboard",
										variant: "default",
									});
								} else {
									toast({
										title: "Copy failed",
										description: "Unable to copy venue information",
										variant: "destructive",
									});
								}
							}}
							className="flex-1">
							<Copy className="h-4 w-4 mr-2" />
							Copy Info
						</Button>
						<Button
							variant="secondary"
							onClick={async () => {
								const success = await shareVenue(venue);
								if (success) {
									toast({
										title: "Venue shared",
										description: "Venue shared successfully",
										variant: "default",
									});
								} else {
									toast({
										title: "Share failed",
										description: "Unable to share venue information",
										variant: "destructive",
									});
								}
							}}
							className="flex-1">
							<Share className="h-4 w-4 mr-2" />
							Share Venue
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
