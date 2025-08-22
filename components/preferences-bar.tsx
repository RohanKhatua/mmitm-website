"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
	PlaceCategory,
	TransportMode,
 
	PreferencesFormProps,
} from "@/lib/types";

const VENUE_CATEGORIES: { value: PlaceCategory; label: string }[] = [
	{ value: "restaurant", label: "Restaurant" },
	{ value: "cafe", label: "Cafe" },
	{ value: "bar", label: "Bar" },
	{ value: "bakery", label: "Bakery" },
	{ value: "movie_theater", label: "Movie Theater" },
	{ value: "museum", label: "Museum" },
	{ value: "art_gallery", label: "Art Gallery" },
	{ value: "park", label: "Park" },
	{ value: "shopping_mall", label: "Shopping Mall" },
	{ value: "gym", label: "Gym" },
	{ value: "library", label: "Library" },
	{ value: "tourist_attraction", label: "Tourist Attraction" },
];

const TRANSPORT_MODES: { value: TransportMode; label: string }[] = [
	{ value: "DRIVE", label: "Driving" },
	{ value: "WALK", label: "Walking" },
	{ value: "TRANSIT", label: "Public Transit" },
	{ value: "BICYCLE", label: "Bicycle" },
];

export function PreferencesBar({
	preferences,
	onPreferencesChangeAction,
}: PreferencesFormProps) {
	const [limitInputValue, setLimitInputValue] = useState(
		preferences.limit.toString()
	);

	// Sync local state when preferences change from outside
	useEffect(() => {
		setLimitInputValue(preferences.limit.toString());
	}, [preferences.limit]);

	const updateCategories = (category: PlaceCategory, checked: boolean) => {
		const newCategories = checked
			? [...preferences.categories, category]
			: preferences.categories.filter((c) => c !== category);

		onPreferencesChangeAction({
			...preferences,
			categories: newCategories,
		});
	};

	const removeCategory = (category: PlaceCategory) => {
		updateCategories(category, false);
	};

	const addCategory = (category: PlaceCategory) => {
		if (!preferences.categories.includes(category)) {
			updateCategories(category, true);
		}
	};

	const availableCategories = VENUE_CATEGORIES.filter(
		(cat) => !preferences.categories.includes(cat.value)
	);

	return (
		<div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card rounded-xl shadow-lg">
			{/* Selected Categories */}
			<div className="flex items-center gap-2">
				<Label className="text-sm font-medium whitespace-nowrap">
					Venue Types:
				</Label>
				<div className="flex flex-wrap gap-2">
					{preferences.categories.length === 0 ? (
						<span className="text-sm text-gray-500">None selected</span>
					) : (
						preferences.categories.map((category) => {
							const categoryInfo = VENUE_CATEGORIES.find(
								(c) => c.value === category
							);
							return (
								<Badge
									key={category}
									variant="secondary"
									className="flex items-center gap-1">
									{categoryInfo?.label}
									<Button
										variant="ghost"
										size="sm"
										className="h-4 w-4 p-0 hover:bg-transparent"
										onClick={() => removeCategory(category)}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							);
						})
					)}
				</div>
			</div>

			{/* Add Category Dropdown */}
			{availableCategories.length > 0 && (
				<div className="flex items-center gap-2">
					<Select
						onValueChange={(value) => addCategory(value as PlaceCategory)}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Add venue type" />
						</SelectTrigger>
						<SelectContent>
							{availableCategories.map((category) => (
								<SelectItem key={category.value} value={category.value}>
									{category.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Transport Mode */}
			<div className="flex items-center gap-2">
				<Label className="text-sm font-medium whitespace-nowrap">
					Transport:
				</Label>
				<Select
					value={preferences.transportMode}
					onValueChange={(value) =>
						onPreferencesChangeAction({
							...preferences,
							transportMode: value as TransportMode,
						})
					}>
					<SelectTrigger className="w-36">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TRANSPORT_MODES.map((mode) => (
							<SelectItem key={mode.value} value={mode.value}>
								{mode.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Limit */}
			<div className="flex items-center gap-2">
				<Label
					htmlFor="limit"
					className="text-sm font-medium whitespace-nowrap">
					Limit:
				</Label>
				<Input
					id="limit"
					type="number"
					min="1"
					max="20"
					value={limitInputValue}
					onChange={(e) => {
						const value = e.target.value;
						setLimitInputValue(value);

						// Only update preferences if it's a valid number
						const numValue = Number.parseInt(value);
						if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
							onPreferencesChangeAction({
								...preferences,
								limit: numValue,
							});
						}
					}}
					onBlur={(e) => {
						const value = e.target.value;
						// If field is empty or invalid on blur, reset to current preference or 10
						if (value === "" || isNaN(Number.parseInt(value))) {
							const resetValue = preferences.limit || 10;
							setLimitInputValue(resetValue.toString());
							onPreferencesChangeAction({
								...preferences,
								limit: resetValue,
							});
						}
					}}
					className="w-20"
				/>
			</div>
		</div>
	);
}
