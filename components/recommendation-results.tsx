"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VenueDetailModal } from "@/components/venue-detail-modal";
import { RecommendationFilters } from "@/components/recommendation-filters";
import {
	MapPin,
	Star,
	Clock,
	ExternalLink,
	TrendingUp,
	Award,
	Share,
	CheckCircle2,
	AlertCircle,
	Copy,
} from "lucide-react";
import {
	ParticipantLocationWithId,
	EnhancedVenueRecommendation,
	FilterOptions,
	ViewMode,
} from "@/lib/types";
import {
	shareVenue,
	shareRecommendationSet,
	copyRecommendationSetToClipboard,
	copyVenueToClipboard,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RecommendationResultsProps {
	recommendations: EnhancedVenueRecommendation[];
	participants: ParticipantLocationWithId[];
	isLoading: boolean;
	sessionId?: string;
	viewMode?: ViewMode;
}

export function RecommendationResults({
	recommendations,
	participants,
	isLoading,
	sessionId,
	viewMode = "list",
}: RecommendationResultsProps) {
	const { toast } = useToast();
	const [selectedVenue, setSelectedVenue] =
		useState<EnhancedVenueRecommendation | null>(null);
	const [filters, setFilters] = useState<FilterOptions>({
		sortBy: "fairness",
		sortOrder: "asc",
		categoryFilter: [],
		priceFilter: [],
		minRating: 0,
		maxTravelTime: 60,
	});

	const { filteredRecommendations, categories, priceRange, ratingRange } =
		useMemo(() => {
			if (recommendations.length === 0) {
				return {
					filteredRecommendations: [],
					categories: [],
					priceRange: [0, 5] as [number, number],
					ratingRange: [0, 5] as [number, number],
				};
			}

			// Extract unique categories and ranges
			const uniqueCategories = [
				...new Set(recommendations.map((r) => r.category)),
			];
			const ratings = recommendations
				.filter((r) => r.rating)
				.map((r) => r.rating!);
			const ratingRange: [number, number] =
				ratings.length > 0
					? [Math.min(...ratings), Math.max(...ratings)]
					: [0, 5];

			// Filter recommendations
			const filtered = recommendations.filter((venue) => {
				// Category filter
				if (
					filters.categoryFilter.length > 0 &&
					!filters.categoryFilter.includes(venue.category)
				) {
					return false;
				}

				// Price filter
				if (
					filters.priceFilter.length > 0 &&
					(!venue.price_level ||
						!filters.priceFilter.includes(venue.price_level))
				) {
					return false;
				}

				// Rating filter
				if (venue.rating && venue.rating < filters.minRating) {
					return false;
				}

				// Max travel time filter
				const maxTravelTime = Math.max(
					...venue.travel_times.map((t) => t.travel_time_minutes)
				);
				if (maxTravelTime > filters.maxTravelTime) {
					return false;
				}

				return true;
			});

			// Sort recommendations
			filtered.sort((a, b) => {
				let aValue: number, bValue: number;

				switch (filters.sortBy) {
					case "fairness":
						aValue =
							Math.max(...a.travel_times.map((t) => t.travel_time_minutes)) -
							Math.min(...a.travel_times.map((t) => t.travel_time_minutes));
						bValue =
							Math.max(...b.travel_times.map((t) => t.travel_time_minutes)) -
							Math.min(...b.travel_times.map((t) => t.travel_time_minutes));
						break;
					case "rating":
						aValue = a.rating || 0;
						bValue = b.rating || 0;
						break;
					case "travel_time":
						aValue =
							a.travel_times.reduce(
								(sum, t) => sum + t.travel_time_minutes,
								0
							) / a.travel_times.length;
						bValue =
							b.travel_times.reduce(
								(sum, t) => sum + t.travel_time_minutes,
								0
							) / b.travel_times.length;
						break;
					case "reviews":
						aValue = a.reviews || 0;
						bValue = b.reviews || 0;
						break;
					default:
						return 0;
				}

				return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
			});

			return {
				filteredRecommendations: filtered,
				categories: uniqueCategories,
				priceRange: [0, 4] as [number, number],
				ratingRange,
			};
		}, [recommendations, filters]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Finding Venues...</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (recommendations.length === 0) {
		return (
			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Venue Recommendations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8 text-gray-500">
							<MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p>
								Add participant locations and click &quot;Get
								Recommendations&quot; to see venues.&rdquo;
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

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
				return null;
		}
	};

	const getFairnessScore = (venue: EnhancedVenueRecommendation) => {
		const times = venue.travel_times.map((t) => t.travel_time_minutes);
		return Math.max(...times) - Math.min(...times);
	};

	const getFairnessColor = (score: number) => {
		if (score <= 5) return "text-green-600";
		if (score <= 10) return "text-yellow-600";
		return "text-red-600";
	};

	// Import carousel components
	const {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
	} = require("@/components/ui/carousel");

	const renderVenueCard = (
		venue: EnhancedVenueRecommendation,
		index: number
	) => {
		const fairnessScore = getFairnessScore(venue);
		const avgTravelTime =
			venue.travel_times.reduce((sum, t) => sum + t.travel_time_minutes, 0) /
			venue.travel_times.length;
		const priceDisplay = getPriceLevelDisplay(venue.price_level);

		return (
			<Card
				key={index}
				className="border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full transform will-change-transform card-carousel-effect w-full min-w-0">
				<CardContent className="p-6 overflow-hidden">
					<div className="flex justify-between items-start mb-4">
						<div className="flex-1">
							<h3 className="font-semibold text-lg text-gray-900 mb-1">
								{venue.name}
							</h3>
							<p className="text-gray-600 text-sm mb-2">{venue.address}</p>
							<div className="flex flex-wrap items-center gap-2 mt-2">
								<Badge variant="secondary">{venue.category}</Badge>
								{priceDisplay && (
									<Badge className={priceDisplay.color}>
										{priceDisplay.text}
									</Badge>
								)}
								{fairnessScore <= 5 && (
									<Badge className="bg-green-100 text-green-800">
										<Award className="h-3 w-3 mr-1" />
										Fair Choice
									</Badge>
								)}
							</div>
						</div>
						<div className="text-right">
							{venue.rating && (
								<div className="flex items-center space-x-1 mb-2">
									<Star className="h-4 w-4 text-yellow-400 fill-current" />
									<span className="font-medium">{venue.rating}</span>
									{venue.reviews && (
										<span className="text-xs text-gray-500">
											({venue.reviews})
										</span>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Travel Metrics */}
					<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg overflow-hidden">
						<div className="text-center min-w-0">
							<div className="text-lg font-semibold text-primary truncate">
								{avgTravelTime.toFixed(1)} min
							</div>
							<div className="text-xs text-gray-500">Avg Travel Time</div>
						</div>
						<div className="text-center min-w-0">
							<div
								className={`text-lg font-semibold ${getFairnessColor(
									fairnessScore
								)} truncate`}>
								{fairnessScore} min
							</div>
							<div className="text-xs text-gray-500">Fairness Score</div>
						</div>
						<div className="text-center md:block hidden min-w-0">
							<div className="text-lg font-semibold text-gray-700 truncate">
								{Math.min(
									...venue.travel_times.map((t) => t.travel_time_minutes)
								)}
								-
								{Math.max(
									...venue.travel_times.map((t) => t.travel_time_minutes)
								)}{" "}
								min
							</div>
							<div className="text-xs text-gray-500">Time Range</div>
						</div>
					</div>

					{/* Travel Times Preview */}
					<div className="space-y-2 mb-4">
						<h4 className="text-sm font-medium text-gray-700">Travel Times:</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{venue.travel_times.slice(0, 4).map((travelTime) => (
								<div
									key={travelTime.participant_index}
									className="flex items-center justify-between text-sm overflow-hidden">
									<span className="text-gray-600 truncate mr-1">
										{participants[travelTime.participant_index]?.name ||
											`Participant ${travelTime.participant_index + 1}`}
									</span>
									<div className="flex items-center gap-1 flex-shrink-0">
										<Clock className="h-3 w-3 text-gray-400" />
										<span className="font-medium">
											{travelTime.travel_time_minutes} min
										</span>
									</div>
								</div>
							))}
							{venue.travel_times.length > 4 && (
								<div className="text-sm text-gray-500 col-span-full">
									+{venue.travel_times.length - 4} more participants
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={() => setSelectedVenue(venue)}
							variant="outline"
							size="sm">
							<TrendingUp className="h-4 w-4 mr-1" />
							<span className="truncate">Details</span>
						</Button>
						<Button
							size="sm"
							onClick={() => window.open(venue.google_maps_url, "_blank")}>
							<ExternalLink className="h-4 w-4 mr-1" />
							<span className="truncate">Maps</span>
						</Button>
						<Button
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
							variant="outline"
							size="sm">
							<Copy className="h-4 w-4 mr-1" />
							<span className="truncate">Copy</span>
						</Button>
						<Button
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
							variant="secondary"
							size="sm">
							<Share className="h-4 w-4 mr-1" />
							<span className="truncate">Share</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			{/* Filters */}
			<RecommendationFilters
				onFiltersChange={setFilters}
				categories={categories}
				priceRange={priceRange}
				ratingRange={ratingRange}
			/>

			{/* Results */}
			<Card>
				<CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between md:space-x-2 space-y-4 md:space-y-0">
					<CardTitle>
						Venue Recommendations ({filteredRecommendations.length}
						{filteredRecommendations.length !== recommendations.length &&
							` of ${recommendations.length}`}
						)
					</CardTitle>
					{filteredRecommendations.length > 0 && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={async () => {
									const success = await copyRecommendationSetToClipboard(
										filteredRecommendations,
										sessionId
									);
									if (success) {
										toast({
											title: "Copied to clipboard",
											description:
												"The list of recommendations has been copied to clipboard",
											variant: "default",
										});
									} else {
										toast({
											title: "Copy failed",
											description: "Unable to copy recommendations",
											variant: "destructive",
										});
									}
								}}
								className="flex items-center gap-1 whitespace-nowrap">
								<Copy className="h-4 w-4 mr-1" />
								<span className="md:inline hidden">Copy List</span>
								<span className="md:hidden inline">Copy</span>
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={async () => {
									const success = await shareRecommendationSet(
										filteredRecommendations,
										sessionId
									);
									if (success) {
										toast({
											title: "Recommendations shared",
											description: "Recommendations shared successfully",
											variant: "default",
										});
									} else {
										toast({
											title: "Share failed",
											description: "Unable to share recommendations",
											variant: "destructive",
										});
									}
								}}
								className="flex items-center gap-1 whitespace-nowrap">
								<Share className="h-4 w-4 mr-1" />
								<span className="md:inline hidden">Share All</span>
								<span className="md:hidden inline">Share</span>
							</Button>
						</div>
					)}
				</CardHeader>
				<CardContent>
					{viewMode === "card" && filteredRecommendations.length > 0 ? (
						<div className="py-4">
							<Carousel
								opts={{
									loop: filteredRecommendations.length > 3,
									align: "center",
									containScroll: "trimSnaps",
								}}
								className="w-full">
								<CarouselContent className="-ml-4 flex-nowrap">
									{filteredRecommendations.map((venue, index) => (
										<CarouselItem
											key={index}
											className="pl-4 md:basis-full lg:basis-1/2 xl:basis-1/2 perspective-1000 min-w-[320px] w-auto">
											<div className="group h-full">
												{renderVenueCard(venue, index)}
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<div className="flex justify-center mt-6 gap-2">
									<CarouselPrevious className="static transform-none position-static" />
									<CarouselNext className="static transform-none position-static" />
								</div>
							</Carousel>
						</div>
					) : (
						<div className="space-y-4">
							{filteredRecommendations.map((venue, index) =>
								renderVenueCard(venue, index)
							)}
							{filteredRecommendations.length === 0 && (
								<div className="text-center py-8 text-gray-500">
									<MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
									<p>
										No venues match your current filters. Try adjusting your
										criteria.
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Venue Detail Modal */}
			<VenueDetailModal
				venue={selectedVenue}
				participants={participants}
				isOpen={!!selectedVenue}
				onClose={() => setSelectedVenue(null)}
			/>
		</div>
	);
}
