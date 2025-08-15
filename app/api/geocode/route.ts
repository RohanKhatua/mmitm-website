import { NextRequest, NextResponse } from "next/server";
import { GoogleApiCache } from "@/lib/cache";
import type { GeocodeResponse } from "@/lib/types";

export async function GET(
	request: NextRequest
): Promise<NextResponse<GeocodeResponse>> {
	try {
		const { searchParams } = new URL(request.url);
		const lat = searchParams.get("lat");
		const lng = searchParams.get("lng");

		if (!lat || !lng) {
			return NextResponse.json(
				{ error: "Latitude and longitude are required" },
				{ status: 400 }
			);
		}

		const latNum = parseFloat(lat);
		const lngNum = parseFloat(lng);

		if (isNaN(latNum) || isNaN(lngNum)) {
			return NextResponse.json(
				{ error: "Invalid latitude or longitude values" },
				{ status: 400 }
			);
		}

		// Check cache first
		const cachedResult = GoogleApiCache.getGeocoding(latNum, lngNum);
		if (cachedResult) {
			console.log("Cache hit for geocoding:", `${latNum},${lngNum}`);
			return NextResponse.json(cachedResult);
		}

		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Google Maps API key not configured" },
				{ status: 500 }
			);
		}

		// Using the new Google Places API Geocoding endpoint
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latNum},${lngNum}&key=${apiKey}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Geocoding API error: ${response.status}`);
		}

		const data = await response.json();

		if (data.status !== "OK" || !data.results || data.results.length === 0) {
			return NextResponse.json(
				{ error: "No address found for the given coordinates" },
				{ status: 404 }
			);
		}

		// Return the formatted address from the first result
		const address = data.results[0].formatted_address;

		const responseData = { address };

		// Cache the successful response
		GoogleApiCache.setGeocoding(latNum, lngNum, responseData);
		console.log("Cached geocoding result for:", `${latNum},${lngNum}`);

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Geocoding error:", error);
		return NextResponse.json(
			{ error: "Failed to reverse geocode coordinates" },
			{ status: 500 }
		);
	}
}
