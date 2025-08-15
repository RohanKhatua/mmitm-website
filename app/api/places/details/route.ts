import { NextRequest, NextResponse } from "next/server";
import { GoogleApiCache } from "@/lib/cache";
import type { PlaceLocation, PlaceDetailsResponse } from "@/lib/types";

export async function POST(
	request: NextRequest
): Promise<NextResponse<PlaceDetailsResponse>> {
	try {
		const body = await request.json();
		const { placeId } = body;

		if (!placeId || typeof placeId !== "string") {
			return NextResponse.json(
				{ error: "Place ID is required" },
				{ status: 400 }
			);
		}

		// Check cache first
		const cachedResult = GoogleApiCache.getPlaceDetails(placeId);
		if (cachedResult) {
			console.log("Cache hit for place details:", placeId);
			return NextResponse.json(cachedResult);
		}

		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Google Maps API key not configured" },
				{ status: 500 }
			);
		}

		// Using the new Places API (New) Place Details endpoint
		const response = await fetch(
			`https://places.googleapis.com/v1/places/${placeId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": apiKey,
					"X-Goog-FieldMask": "location",
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Place Details API error:", response.status, errorText);

			if (response.status === 404) {
				return NextResponse.json({ error: "Place not found" }, { status: 404 });
			}

			throw new Error(`Place Details API error: ${response.status}`);
		}

		const data = await response.json();

		if (!data.location) {
			return NextResponse.json(
				{ error: "Location not found for this place" },
				{ status: 404 }
			);
		}

		// Transform the response to match expected format
		const location: PlaceLocation = {
			lat: data.location.latitude,
			lng: data.location.longitude,
		};

		const responseData = { location };

		// Cache the successful response
		GoogleApiCache.setPlaceDetails(placeId, responseData);
		console.log("Cached place details for:", placeId);

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Place details error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch place details" },
			{ status: 500 }
		);
	}
}
