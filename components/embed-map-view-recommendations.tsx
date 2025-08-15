"use client";

import React, {
	useState,
	useCallback,
	useMemo,
	useRef,
	useEffect,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VenueDetailModal } from "@/components/venue-detail-modal";
import {
	MapPin,
	Star,
	Clock,
	ExternalLink,
	ChevronLeft,
	ChevronRight,
	Navigation2,
	Award,
	Users,
	TrendingUp,
	RotateCcw,
	Map,
} from "lucide-react";
import type {
	EnhancedVenueRecommendation,
	ParticipantInput,
	ParticipantLocationWithId,
	EmbedMapViewRecommendationsProps,
} from "@/lib/types";

export function EmbedMapViewRecommendations({
	recommendations,
	participants,
	isLoading,
	className = "",
}: EmbedMapViewRecommendationsProps) {
	const [selectedVenueIndex, setSelectedVenueIndex] = useState<number | null>(
		null
	);
	const [selectedVenue, setSelectedVenue] =
		useState<EnhancedVenueRecommendation | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [carouselPosition, setCarouselPosition] = useState(0);
	const [mapMode, setMapMode] = useState<"overview" | "interactive">(
		"overview"
	);

	// Calculate fallback map center (used for interactive mode and when no markers)
	const mapCenter = useMemo(() => {
		const allCoordinates: { lat: number; lng: number }[] = [];

		// Add venue coordinates
		recommendations.forEach((venue) => {
			allCoordinates.push({ lat: venue.lat, lng: venue.lng });
		});

		// Add participant coordinates
		participants.forEach((participant) => {
			if (
				participant.location &&
				"lat" in participant.location &&
				"lng" in participant.location
			) {
				allCoordinates.push({
					lat: participant.location.lat,
					lng: participant.location.lng,
				});
			}
		});

		if (allCoordinates.length === 0) {
			return { lat: 37.4419, lng: -122.143 }; // Default to Palo Alto
		}

		// Calculate average center
		const avgLat =
			allCoordinates.reduce((sum, coord) => sum + coord.lat, 0) /
			allCoordinates.length;
		const avgLng =
			allCoordinates.reduce((sum, coord) => sum + coord.lng, 0) /
			allCoordinates.length;

		return { lat: avgLat, lng: avgLng };
	}, [recommendations, participants]);

	// Calculate appropriate zoom level for interactive mode
	const mapZoom = useMemo(() => {
		if (recommendations.length <= 1) return 14;

		const lats = recommendations.map((venue) => venue.lat);
		const lngs = recommendations.map((venue) => venue.lng);

		const latSpread = Math.max(...lats) - Math.min(...lats);
		const lngSpread = Math.max(...lngs) - Math.min(...lngs);
		const maxSpread = Math.max(latSpread, lngSpread);

		// Rough zoom level calculation for interactive mode fallback
		if (maxSpread > 1) return 8;
		if (maxSpread > 0.1) return 10;
		if (maxSpread > 0.01) return 12;
		return 14;
	}, [recommendations]);

	// State for map URLs
	const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);
	const [embedUrl, setEmbedUrl] = useState<string | null>(null);
	const [mapUrlsLoading, setMapUrlsLoading] = useState(false);

	// Effect to fetch static map URL
	useEffect(() => {
		const fetchStaticMapUrl = async () => {
			setMapUrlsLoading(true);
			try {
				const params = new URLSearchParams({
					size: "800x400",
					maptype: "roadmap",
				});

				const allMarkers: string[] = [];

				// Add venue markers (red color)
				if (recommendations.length > 0) {
					const venueLocations = recommendations
						.map((venue, index) => {
							const label = String.fromCharCode(65 + (index % 26)); // A, B, C, etc.
							return `${venue.lat},${venue.lng}`;
						})
						.join("|");

					allMarkers.push(`color:red|label:V|${venueLocations}`);
				}

				// Add participant markers (blue color)
				const participantLocations: string[] = [];
				participants.forEach((participant, index) => {
					if (participant.location) {
						if (
							"lat" in participant.location &&
							"lng" in participant.location
						) {
							participantLocations.push(
								`${participant.location.lat},${participant.location.lng}`
							);
						}
						// Note: Address-based locations would need geocoding first
					}
				});

				if (participantLocations.length > 0) {
					allMarkers.push(
						`color:blue|label:P|${participantLocations.join("|")}`
					);
				}

				// Highlight selected venue with different style (overwrites venue marker)
				if (
					selectedVenueIndex !== null &&
					recommendations[selectedVenueIndex]
				) {
					const venue = recommendations[selectedVenueIndex];
					allMarkers.push(
						`color:green|size:mid|label:S|${venue.lat},${venue.lng}`
					);
				}

				// Add markers to params
				if (allMarkers.length > 0) {
					allMarkers.forEach((marker) => params.append("markers", marker));
				} else {
					// Fallback when no markers - use manual center and zoom
					params.append("center", `${mapCenter.lat},${mapCenter.lng}`);
					params.append("zoom", mapZoom.toString());
				}

				const response = await fetch(`/api/maps/static?${params.toString()}`);
				if (response.ok) {
					const data = await response.json();
					setStaticMapUrl(data.url);
				} else {
					setStaticMapUrl(null);
				}
			} catch (error) {
				console.error("Error fetching static map URL:", error);
				setStaticMapUrl(null);
			} finally {
				setMapUrlsLoading(false);
			}
		};

		fetchStaticMapUrl();
	}, [recommendations, participants, mapCenter, mapZoom, selectedVenueIndex]);

	// Effect to fetch embed URL
	useEffect(() => {
		const fetchEmbedUrl = async () => {
			try {
				let params: URLSearchParams;

				if (
					selectedVenueIndex !== null &&
					recommendations[selectedVenueIndex]
				) {
					const venue = recommendations[selectedVenueIndex];
					// Use place mode to show specific venue
					params = new URLSearchParams({
						mode: "place",
						q: `${venue.lat},${venue.lng}`,
						zoom: "15",
						maptype: "roadmap",
					});
				} else {
					// Use view mode to show overview of all venues
					params = new URLSearchParams({
						mode: "view",
						center: `${mapCenter.lat},${mapCenter.lng}`,
						zoom: mapZoom.toString(),
						maptype: "roadmap",
					});
				}

				const response = await fetch(`/api/maps/embed?${params.toString()}`);
				if (response.ok) {
					const data = await response.json();
					setEmbedUrl(data.url);
				} else {
					setEmbedUrl(null);
				}
			} catch (error) {
				console.error("Error fetching embed URL:", error);
				setEmbedUrl(null);
			}
		};

		fetchEmbedUrl();
	}, [selectedVenueIndex, recommendations, mapCenter, mapZoom]);

	const handleVenueSelect = useCallback((index: number) => {
		setSelectedVenueIndex(index);
		setCarouselPosition(index);
	}, []);

	const nextVenue = useCallback(() => {
		if (recommendations.length === 0) return;
		const nextIndex = (carouselPosition + 1) % recommendations.length;
		handleVenueSelect(nextIndex);
	}, [carouselPosition, recommendations.length, handleVenueSelect]);

	const prevVenue = useCallback(() => {
		if (recommendations.length === 0) return;
		const prevIndex =
			carouselPosition === 0
				? recommendations.length - 1
				: carouselPosition - 1;
		handleVenueSelect(prevIndex);
	}, [carouselPosition, recommendations.length, handleVenueSelect]);

	const resetView = useCallback(() => {
		setSelectedVenueIndex(null);
		setCarouselPosition(0);
	}, []);

	const formatTravelTime = useCallback((minutes: number) => {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0
			? `${hours}h ${remainingMinutes}m`
			: `${hours}h`;
	}, []);

	const getPriceDisplay = useCallback((priceLevel?: string) => {
		if (!priceLevel) return "Price not available";
		const priceMap = {
			PRICE_LEVEL_FREE: "Free",
			PRICE_LEVEL_INEXPENSIVE: "💰",
			PRICE_LEVEL_MODERATE: "💰💰",
			PRICE_LEVEL_EXPENSIVE: "💰💰💰",
			PRICE_LEVEL_VERY_EXPENSIVE: "💰💰💰💰",
		};
		return (
			priceMap[priceLevel as keyof typeof priceMap] || "Price not available"
		);
	}, []);

	if (mapUrlsLoading) {
		return (
			<div
				className={`w-full h-full bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
				<div className="text-center p-8">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading map...</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div
				className={`w-full h-full bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
				<div className="text-center p-8">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Finding the perfect venues...</p>
				</div>
			</div>
		);
	}

	if (recommendations.length === 0) {
		return (
			<div
				className={`w-full h-full bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
				<div className="text-center p-8">
					<MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No Venues Found
					</h3>
					<p className="text-gray-600">
						Try adjusting your preferences or location.
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={`w-full h-full flex flex-col gap-4 ${className}`}>
				{/* Map Container */}
				<div className="w-full h-[400px] relative">
					{mapMode === "overview" && staticMapUrl ? (
						// Static map showing venues and participants with markers
						<img
							src={staticMapUrl}
							alt="Map showing venue recommendations and participant locations"
							className="w-full h-full object-cover rounded-lg"
							style={{ border: 0 }}
						/>
					) : (
						// Interactive embed map
						embedUrl && (
							<iframe
								src={embedUrl}
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								className="rounded-lg"
								title="Google Maps showing venue recommendations"
							/>
						)
					)}

					{/* Map Controls */}
					<div className="absolute top-4 right-4 flex flex-col gap-2">
						<Button
							onClick={() =>
								setMapMode(mapMode === "overview" ? "interactive" : "overview")
							}
							variant="secondary"
							size="sm"
							className="bg-white/90 backdrop-blur-sm hover:bg-white">
							{mapMode === "overview" ? (
								<>
									<Navigation2 className="h-4 w-4 mr-2" />
									Interactive
								</>
							) : (
								<>
									<Map className="h-4 w-4 mr-2" />
									Overview
								</>
							)}
						</Button>

						{selectedVenueIndex !== null && (
							<Button
								onClick={resetView}
								variant="secondary"
								size="sm"
								className="bg-white/90 backdrop-blur-sm hover:bg-white">
								<RotateCcw className="h-4 w-4 mr-2" />
								Reset
							</Button>
						)}
					</div>

					{/* Map Legend */}
					{mapMode === "overview" && (
						<div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
							<div className="text-sm font-medium mb-2">Map Legend</div>
							<div className="space-y-1 text-xs">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<span>Venue Recommendations ({recommendations.length})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
									<span>
										Participant Locations (
										{
											participants.filter(
												(p) => p.location && "lat" in p.location
											).length
										}
										)
									</span>
								</div>
								{selectedVenueIndex !== null && (
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-green-500 rounded-full"></div>
										<span>Selected Venue</span>
									</div>
								)}
								{participants.some(
									(p) => p.location && "address" in p.location
								) && (
									<div className="text-xs text-amber-600 mt-1">
										* Address-only locations not shown
									</div>
								)}
							</div>
						</div>
					)}

					{/* Selected Venue Info Overlay */}
					{selectedVenueIndex !== null &&
						recommendations[selectedVenueIndex] && (
							<div className="absolute bottom-4 right-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold text-lg">
											{recommendations[selectedVenueIndex].name}
										</h3>
										<p className="text-gray-600 text-sm">
											{recommendations[selectedVenueIndex].address}
										</p>
										{recommendations[selectedVenueIndex].rating && (
											<div className="flex items-center mt-1">
												<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
												<span className="text-sm font-medium ml-1">
													{recommendations[selectedVenueIndex].rating}
												</span>
											</div>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Button
											onClick={(e) => {
												e.stopPropagation();
												setSelectedVenue(recommendations[selectedVenueIndex]);
												setIsModalOpen(true);
											}}
											variant="outline"
											size="sm">
											<Users className="h-3 w-3 mr-1" />
											Details
										</Button>
										<Button
											onClick={(e) => {
												e.stopPropagation();
												window.open(
													recommendations[selectedVenueIndex].google_maps_url,
													"_blank"
												);
											}}
											variant="outline"
											size="sm">
											<Navigation2 className="h-3 w-3 mr-1" />
											Directions
										</Button>
									</div>
								</div>
							</div>
						)}
				</div>

				{/* Venue Carousel */}
				<div className="w-full flex flex-col max-h-[500px]">
					{/* Participants Summary */}
					{participants.length > 0 && (
						<div className="mb-4">
							<Card className="p-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4 text-blue-600" />
										<span className="font-medium">
											Participants ({participants.length})
										</span>
									</div>
									<Badge variant="secondary" className="text-xs">
										{participants.filter((p) => p.location).length} with
										locations
									</Badge>
								</div>
								<div className="mt-2 text-xs text-gray-600">
									{participants.map((participant, index) => {
										let locationStatus = "";
										if (participant.location) {
											if (
												"lat" in participant.location &&
												"lng" in participant.location
											) {
												locationStatus = " 📍"; // Has coordinates
											} else if ("address" in participant.location) {
												locationStatus = " 📝"; // Has address only
											}
										} else {
											locationStatus = " ⏳"; // No location yet
										}

										return (
											<span key={participant.id}>
												{participant.name}
												{locationStatus}
												{index < participants.length - 1 ? " • " : ""}
											</span>
										);
									})}
								</div>
								{participants.some(
									(p) => p.location && "address" in p.location
								) && (
									<div className="mt-1 text-xs text-amber-600 flex items-center">
										<span>
											📝 Some locations are addresses and may not appear on map
										</span>
									</div>
								)}
							</Card>
						</div>
					)}

					{/* Carousel Header */}
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">
							Recommended Venues ({recommendations.length})
						</h3>
						<div className="flex items-center gap-2">
							<Button
								onClick={prevVenue}
								variant="outline"
								size="sm"
								disabled={recommendations.length <= 1}>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm text-gray-600">
								{carouselPosition + 1} of {recommendations.length}
							</span>
							<Button
								onClick={nextVenue}
								variant="outline"
								size="sm"
								disabled={recommendations.length <= 1}>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Scrollable Venue Cards */}
					<ScrollArea className="flex-1">
						<div className="space-y-4 pr-4">
							{recommendations.map((venue, index) => (
								<Card
									key={`${venue.name}-${index}`}
									className={`cursor-pointer transition-all duration-200 ${
										selectedVenueIndex === index
											? "ring-2 ring-blue-500 bg-blue-50"
											: "hover:shadow-md"
									}`}
									onClick={() => handleVenueSelect(index)}>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
														selectedVenueIndex === index
															? "bg-blue-600"
															: "bg-red-500"
													}`}>
													{index + 1}
												</div>
												<div className="flex-1">
													<CardTitle className="text-base leading-tight">
														{venue.name}
													</CardTitle>
													<p className="text-sm text-gray-600 mt-1 flex items-center">
														<MapPin className="h-3 w-3 mr-1" />
														{venue.address}
													</p>
												</div>
											</div>
										</div>
									</CardHeader>

									<CardContent className="pt-0">
										{/* Rating and Reviews */}
										{venue.rating && (
											<div className="flex items-center gap-2 mb-3">
												<div className="flex items-center">
													<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
													<span className="text-sm font-medium ml-1">
														{venue.rating}
													</span>
												</div>
												{venue.reviews && (
													<span className="text-sm text-gray-500">
														({venue.reviews} reviews)
													</span>
												)}
												<Badge variant="secondary" className="text-xs">
													{venue.category}
												</Badge>
											</div>
										)}

										{/* Travel Times */}
										{venue.travel_times && venue.travel_times.length > 0 && (
											<div className="space-y-2 mb-3">
												<div className="flex items-center text-xs text-gray-600">
													<Clock className="h-3 w-3 mr-1" />
													Travel Times to {venue.name}
												</div>
												<div className="grid grid-cols-1 gap-1">
													{venue.travel_times.slice(0, 3).map((travel, idx) => {
														const participant =
															participants[travel.participant_index];
														const participantName =
															participant?.name ||
															`Participant ${travel.participant_index + 1}`;
														return (
															<div
																key={idx}
																className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
																<span className="text-gray-700 truncate flex items-center">
																	<div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
																	{participantName}
																</span>
																<div className="flex items-center gap-1">
																	<span className="font-medium text-gray-900">
																		{formatTravelTime(
																			travel.travel_time_minutes
																		)}
																	</span>
																	<span className="text-gray-500 text-xs">
																		{travel.transport_mode?.toLowerCase()}
																	</span>
																</div>
															</div>
														);
													})}
													{venue.travel_times.length > 3 && (
														<div className="text-xs text-gray-500 text-center">
															+{venue.travel_times.length - 3} more participants
														</div>
													)}
												</div>
											</div>
										)}

										{/* Price Level */}
										{venue.price_level && (
											<div className="flex items-center justify-between text-xs mb-3">
												<span className="text-gray-600">Price Range</span>
												<span>{getPriceDisplay(venue.price_level)}</span>
											</div>
										)}

										{/* Travel Time Metrics */}
										{venue.travel_times && venue.travel_times.length > 0 && (
											<div className="grid grid-cols-2 gap-2 mb-3">
												<div className="text-center p-2 bg-blue-50 rounded">
													<TrendingUp className="h-3 w-3 mx-auto mb-1 text-blue-600" />
													<div className="text-xs font-medium text-blue-900">
														{formatTravelTime(
															venue.travel_times.reduce(
																(sum, travel) =>
																	sum + travel.travel_time_minutes,
																0
															)
														)}
													</div>
													<div className="text-xs text-blue-600">
														Total Time
													</div>
												</div>
												<div className="text-center p-2 bg-green-50 rounded">
													<Award className="h-3 w-3 mx-auto mb-1 text-green-600" />
													<div className="text-xs font-medium text-green-900">
														{formatTravelTime(
															Math.round(
																venue.travel_times.reduce(
																	(sum, travel) =>
																		sum + travel.travel_time_minutes,
																	0
																) / venue.travel_times.length
															)
														)}
													</div>
													<div className="text-xs text-green-600">Avg Time</div>
												</div>
											</div>
										)}

										{/* Action Buttons */}
										<div className="flex gap-2">
											<Button
												onClick={(e) => {
													e.stopPropagation();
													setSelectedVenue(venue);
													setIsModalOpen(true);
												}}
												variant="outline"
												size="sm"
												className="flex-1">
												<Users className="h-3 w-3 mr-1" />
												Details
											</Button>
											<Button
												onClick={(e) => {
													e.stopPropagation();
													window.open(venue.google_maps_url, "_blank");
												}}
												variant="outline"
												size="sm"
												className="flex-1">
												<Navigation2 className="h-3 w-3 mr-1" />
												Directions
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</ScrollArea>
				</div>
			</div>

			{/* Venue Detail Modal */}
			{selectedVenue && (
				<VenueDetailModal
					venue={selectedVenue}
					participants={participants}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</>
	);
}
