"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { RecommendationFiltersProps, FilterOptions } from "@/lib/types";

const PRICE_LEVELS = [
	{ value: "PRICE_LEVEL_FREE", label: "Free" },
	{ value: "PRICE_LEVEL_INEXPENSIVE", label: "$" },
	{ value: "PRICE_LEVEL_MODERATE", label: "$$" },
	{ value: "PRICE_LEVEL_EXPENSIVE", label: "$$$" },
	{ value: "PRICE_LEVEL_VERY_EXPENSIVE", label: "$$$$" },
];

const SORT_OPTIONS = [
	{ value: "fairness", label: "Fairness Score" },
	{ value: "rating", label: "Rating" },
	{ value: "travel_time", label: "Average Travel Time" },
	{ value: "reviews", label: "Number of Reviews" },
];

export function RecommendationFilters({
	onFiltersChange,
	categories,
	priceRange,
	ratingRange,
}: RecommendationFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		sortBy: "fairness",
		sortOrder: "asc",
		categoryFilter: [],
		priceFilter: [],
		minRating: ratingRange[0],
		maxTravelTime: 60,
	});

	const updateFilters = (newFilters: Partial<FilterOptions>) => {
		const updatedFilters = { ...filters, ...newFilters };
		setFilters(updatedFilters);
		onFiltersChange(updatedFilters);
	};

	const clearFilters = () => {
		const defaultFilters: FilterOptions = {
			sortBy: "fairness",
			sortOrder: "asc",
			categoryFilter: [],
			priceFilter: [],
			minRating: ratingRange[0],
			maxTravelTime: 60,
		};
		setFilters(defaultFilters);
		onFiltersChange(defaultFilters);
	};

	const hasActiveFilters =
		filters.categoryFilter.length > 0 ||
		filters.priceFilter.length > 0 ||
		filters.minRating > ratingRange[0] ||
		filters.maxTravelTime < 60;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center space-x-2">
						<Filter className="h-5 w-5" />
						<span>Filters & Sorting</span>
					</CardTitle>
					<div className="flex items-center space-x-2">
						{hasActiveFilters && (
							<Button onClick={clearFilters} variant="ghost" size="sm">
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						)}
						<Button
							onClick={() => setIsExpanded(!isExpanded)}
							variant="outline"
							size="sm">
							{isExpanded ? "Hide" : "Show"} Filters
						</Button>
					</div>
				</div>
			</CardHeader>

			{isExpanded && (
				<CardContent className="space-y-6">
					{/* Sort Options */}
					<div className="grid md:grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium mb-2 block">Sort By</label>
							<Select
								value={filters.sortBy}
								onValueChange={(value) =>
									updateFilters({ sortBy: value as any })
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SORT_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">Order</label>
							<Select
								value={filters.sortOrder}
								onValueChange={(value) =>
									updateFilters({ sortOrder: value as any })
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="asc">
										{filters.sortBy === "fairness" ||
										filters.sortBy === "travel_time"
											? "Best First"
											: "Low to High"}
									</SelectItem>
									<SelectItem value="desc">
										{filters.sortBy === "fairness" ||
										filters.sortBy === "travel_time"
											? "Worst First"
											: "High to Low"}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Category Filter */}
					<div>
						<label className="text-sm font-medium mb-2 block">Categories</label>
						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<Badge
									key={category}
									variant={
										filters.categoryFilter.includes(category)
											? "default"
											: "outline"
									}
									className="cursor-pointer"
									onClick={() => {
										const newCategories = filters.categoryFilter.includes(
											category
										)
											? filters.categoryFilter.filter((c) => c !== category)
											: [...filters.categoryFilter, category];
										updateFilters({ categoryFilter: newCategories });
									}}>
									{category}
								</Badge>
							))}
						</div>
					</div>

					{/* Price Filter */}
					<div>
						<label className="text-sm font-medium mb-2 block">
							Price Range
						</label>
						<div className="flex flex-wrap gap-2">
							{PRICE_LEVELS.map((price) => (
								<Badge
									key={price.value}
									variant={
										filters.priceFilter.includes(price.value)
											? "default"
											: "outline"
									}
									className="cursor-pointer"
									onClick={() => {
										const newPrices = filters.priceFilter.includes(price.value)
											? filters.priceFilter.filter((p) => p !== price.value)
											: [...filters.priceFilter, price.value];
										updateFilters({ priceFilter: newPrices });
									}}>
									{price.label}
								</Badge>
							))}
						</div>
					</div>

					{/* Rating Filter */}
					<div>
						<label className="text-sm font-medium mb-2 block">
							Minimum Rating: {filters.minRating.toFixed(1)}
						</label>
						<Slider
							value={[filters.minRating]}
							onValueChange={([value]) => updateFilters({ minRating: value })}
							min={ratingRange[0]}
							max={ratingRange[1]}
							step={0.1}
							className="w-full"
						/>
					</div>

					{/* Max Travel Time */}
					<div>
						<label className="text-sm font-medium mb-2 block">
							Max Travel Time: {filters.maxTravelTime} minutes
						</label>
						<Slider
							value={[filters.maxTravelTime]}
							onValueChange={([value]) =>
								updateFilters({ maxTravelTime: value })
							}
							min={5}
							max={120}
							step={5}
							className="w-full"
						/>
					</div>
				</CardContent>
			)}
		</Card>
	);
}
