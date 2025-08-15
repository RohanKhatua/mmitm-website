"use client";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	PlaceCategory,
	TransportMode,
	Preferences,
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

export function PreferencesForm({
	preferences,
	onPreferencesChange,
}: PreferencesFormProps) {
	const updateCategories = (category: PlaceCategory, checked: boolean) => {
		const newCategories = checked
			? [...preferences.categories, category]
			: preferences.categories.filter((c) => c !== category);

		onPreferencesChange({
			...preferences,
			categories: newCategories,
		});
	};

	return (
		<div className="space-y-6">
			{/* Venue Categories */}
			<div>
				<Label className="text-base font-medium mb-3 block">Venue Types</Label>
				<div className="grid grid-cols-2 gap-3">
					{VENUE_CATEGORIES.map((category) => (
						<div key={category.value} className="flex items-center space-x-2">
							<Checkbox
								id={category.value}
								checked={preferences.categories.includes(category.value)}
								onCheckedChange={(checked) =>
									updateCategories(category.value, checked as boolean)
								}
							/>
							<Label htmlFor={category.value} className="text-sm font-normal">
								{category.label}
							</Label>
						</div>
					))}
				</div>
			</div>

			{/* Transport Mode */}
			<div>
				<Label className="text-base font-medium mb-3 block">
					Transport Mode
				</Label>
				<Select
					value={preferences.transportMode}
					onValueChange={(value) =>
						onPreferencesChange({
							...preferences,
							transportMode: value as TransportMode,
						})
					}>
					<SelectTrigger>
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
			<div>
				<Label htmlFor="limit" className="text-base font-medium mb-3 block">
					Number of Recommendations
				</Label>
				<Input
					id="limit"
					type="number"
					min="1"
					max="20"
					value={preferences.limit}
					onChange={(e) =>
						onPreferencesChange({
							...preferences,
							limit: Number.parseInt(e.target.value) || 10,
						})
					}
				/>
			</div>
		</div>
	);
}
