"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MapPin, Loader2, Navigation, X } from "lucide-react";
import type {
	ParticipantInput,
	LocationData,
	PlacePrediction,
} from "@/lib/types";

interface LocationInputProps {
	// New interface for compatibility with existing code
	onLocationSelected?: (location: ParticipantInput | null) => void;
	currentLocation?: ParticipantInput | null;
	// Optional new interface for more detailed data
	onLocationSelect?: (location: LocationData) => void;
	placeholder?: string;
	className?: string;
}

export function LocationInput({
	onLocationSelected,
	currentLocation,
	onLocationSelect,
	placeholder = "Search for a location...",
	className = "",
}: LocationInputProps) {
	const [query, setQuery] = useState("");
	const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
		null
	);
	const [isSettingQuery, setIsSettingQuery] = useState(false);
	const [hasSelectedPlace, setHasSelectedPlace] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Initialize query from currentLocation if provided
	useEffect(() => {
		if (currentLocation) {
			if ("address" in currentLocation) {
				setQuery(currentLocation.address);
				setSelectedLocation({
					lat: 0,
					lng: 0,
					address: currentLocation.address,
				});
			} else if ("lat" in currentLocation && "lng" in currentLocation) {
				// Try to reverse geocode coordinates to get a place name
				const reverseGeocode = async () => {
					try {
						const response = await fetch(
							`/api/geocode?lat=${currentLocation.lat}&lng=${currentLocation.lng}`
						);
						const data = await response.json();

						if (response.ok && data.address) {
							setQuery(data.address);
							setSelectedLocation({
								lat: currentLocation.lat,
								lng: currentLocation.lng,
								address: data.address,
							});
						} else {
							// Fallback to coordinates if reverse geocoding fails
							setQuery(
								`${currentLocation.lat.toFixed(
									6
								)}, ${currentLocation.lng.toFixed(6)}`
							);
							setSelectedLocation({
								lat: currentLocation.lat,
								lng: currentLocation.lng,
								address: `${currentLocation.lat.toFixed(
									6
								)}, ${currentLocation.lng.toFixed(6)}`,
							});
						}
					} catch (error) {
						console.error("Error reverse geocoding current location:", error);
						// Fallback to coordinates if reverse geocoding fails
						setQuery(
							`${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(
								6
							)}`
						);
						setSelectedLocation({
							lat: currentLocation.lat,
							lng: currentLocation.lng,
							address: `${currentLocation.lat.toFixed(
								6
							)}, ${currentLocation.lng.toFixed(6)}`,
						});
					}
				};

				reverseGeocode();
			}
		}
	}, [currentLocation]);

	// Helper function to call both callback types
	const notifyLocationSelect = (location: LocationData) => {
		// Call the new detailed callback
		onLocationSelect?.(location);

		// Call the legacy callback with ParticipantInput format
		if (onLocationSelected) {
			if (location.lat !== 0 && location.lng !== 0) {
				// If we have coordinates, prefer that
				onLocationSelected({ lat: location.lat, lng: location.lng });
			} else {
				// Otherwise use address
				onLocationSelected({ address: location.address });
			}
		}
	};

	// Get current GPS location
	const getCurrentLocation = async () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by this browser.");
			return;
		}

		setIsGettingLocation(true);

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				try {
					// Use our API endpoint for reverse geocoding
					const response = await fetch(
						`/api/geocode?lat=${latitude}&lng=${longitude}`
					);
					const data = await response.json();

					if (!response.ok) {
						throw new Error(data.error || "Failed to geocode location");
					}

					const locationData: LocationData = {
						lat: latitude,
						lng: longitude,
						address:
							data.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
					};

					setSelectedLocation(locationData);
					setIsSettingQuery(true);
					setQuery(locationData.address);
					setHasSelectedPlace(true);
					setShowDropdown(false);
					notifyLocationSelect(locationData);
				} catch (error) {
					console.error("Error reverse geocoding:", error);
					// Try to get a basic place name, fallback to coordinates only if necessary
					const fallbackAddress = `Location: ${latitude.toFixed(
						4
					)}°, ${longitude.toFixed(4)}°`;
					const locationData: LocationData = {
						lat: latitude,
						lng: longitude,
						address: fallbackAddress,
					};
					setSelectedLocation(locationData);
					setIsSettingQuery(true);
					setQuery(fallbackAddress);
					setHasSelectedPlace(true);
					setShowDropdown(false);
					notifyLocationSelect(locationData);
				}

				setIsGettingLocation(false);
			},
			(error) => {
				console.error("Error getting location:", error);
				alert(
					"Unable to retrieve your location. Please try again or search manually."
				);
				setIsGettingLocation(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000, // 5 minutes
			}
		);
	};

	// Fetch place predictions from our API endpoint
	const fetchPredictions = async (input: string) => {
		if (!input.trim()) {
			setPredictions([]);
			setShowDropdown(false);
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/places/autocomplete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ input }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch predictions");
			}

			setPredictions(data.predictions || []);
			if (!hasSelectedPlace) {
				setShowDropdown(true);
			}
		} catch (error) {
			console.error("Error fetching predictions:", error);
			setPredictions([]);
		}

		setIsLoading(false);
	};

	// Get place details (lat/lng) from place ID using our API endpoint
	const getPlaceDetails = async (placeId: string, description: string) => {
		setShowDropdown(false);
		setHasSelectedPlace(true);

		try {
			const response = await fetch("/api/places/details", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ placeId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to get place details");
			}

			if (data.location) {
				const locationData: LocationData = {
					lat: data.location.lat,
					lng: data.location.lng,
					address: description,
					placeId: placeId,
				};

				setSelectedLocation(locationData);
				setIsSettingQuery(true);
				setQuery(description);
				notifyLocationSelect(locationData);

				// Blur the input to prevent the dropdown from reopening
				if (inputRef.current) {
					inputRef.current.blur();
				}
			}
		} catch (error) {
			console.error("Error getting place details:", error);
		}
	};

	// Handle input change with debouncing
	useEffect(() => {
		if (isSettingQuery) {
			setIsSettingQuery(false);
			return;
		}

		const timeoutId = setTimeout(() => {
			fetchPredictions(query);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [query, isSettingQuery]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setQuery(newValue);

		// If user is typing something different from the selected location, reset the selection state
		if (selectedLocation && newValue !== selectedLocation.address) {
			setHasSelectedPlace(false);
		}
	};

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!inputRef.current?.contains(event.target as Node)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className={`relative w-full ${className}`}>
			<div className="flex gap-2 items-center">
				<div className="relative flex-1">
					<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						ref={inputRef}
						type="text"
						placeholder={placeholder}
						value={query}
						onChange={handleInputChange}
						onFocus={() => {
							if (query && !hasSelectedPlace && predictions.length > 0) {
								setShowDropdown(true);
							}
						}}
						className="pl-10 pr-4"
					/>
					{isLoading && (
						<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
					)}
					{showDropdown && predictions.length > 0 && (
						<div
							ref={dropdownRef}
							className="bg-white rounded-2xl border absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
							{predictions.map((prediction) => (
								<div
									key={prediction.place_id}
									className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
									onClick={() =>
										getPlaceDetails(prediction.place_id, prediction.description)
									}>
									<div className="font-medium text-sm">
										{prediction.structured_formatting.main_text}
									</div>
									<div className="text-xs text-muted-foreground">
										{prediction.structured_formatting.secondary_text}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				{(currentLocation || (query && hasSelectedPlace)) && (
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => {
							setQuery("");
							setSelectedLocation(null);
							setHasSelectedPlace(false);
							onLocationSelected?.(null);
						}}
						className="h-10 w-10 p-0 text-muted-foreground hover:bg-destructive hover:border-destructive">
						<X className="h-4 w-4" />
					</Button>
				)}
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={getCurrentLocation}
					disabled={isGettingLocation}
					title="Use current location">
					{isGettingLocation ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Navigation className="h-4 w-4" />
					)}
				</Button>
			</div>

			{selectedLocation && (
				<div className="mt-2 p-2 bg-muted rounded-md text-sm">
					<div className="font-medium">Selected Location:</div>
					<div className="text-muted-foreground">
						{selectedLocation.address}
					</div>
					<div className="text-xs text-muted-foreground">
						{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
					</div>
				</div>
			)}
		</div>
	);
}
