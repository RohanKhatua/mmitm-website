import { NextRequest, NextResponse } from "next/server";
import { GoogleApiCache } from "@/lib/cache";
import type { CacheStatsResponse } from "@/lib/types";

export async function GET(): Promise<NextResponse<CacheStatsResponse>> {
	try {
		const stats = GoogleApiCache.getStats();
		const autocompleteContents = GoogleApiCache.getAutocompleteContents();
		const placeDetailsContents = GoogleApiCache.getPlaceDetailsContents();
		const geocodingContents = GoogleApiCache.getGeocodingContents();
		const recommendationsContents = GoogleApiCache.getRecommendationsContents();

		return NextResponse.json({
			stats: {
				autocomplete: { ...stats.autocomplete, contents: autocompleteContents },
				placeDetails: { ...stats.placeDetails, contents: placeDetailsContents },
				geocoding: { ...stats.geocoding, contents: geocodingContents },
				recommendations: { ...stats.recommendations, contents: recommendationsContents },
			},
			message: "Cache statistics and contents retrieved successfully",
		});
	} catch (error) {
		console.error("Cache stats error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve cache statistics" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest
): Promise<NextResponse<CacheStatsResponse>> {
	try {
		GoogleApiCache.clearAll();

		return NextResponse.json({
			message: "All caches cleared successfully",
		});
	} catch (error) {
		console.error("Cache clear error:", error);
		return NextResponse.json(
			{ error: "Failed to clear caches" },
			{ status: 500 }
		);
	}
}
