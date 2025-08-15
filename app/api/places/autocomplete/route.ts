import { NextRequest, NextResponse } from "next/server";
import { GoogleApiCache } from "@/lib/cache";
import type { PlacePrediction, AutocompleteResponse } from "@/lib/types";

export async function POST(
	request: NextRequest
): Promise<NextResponse<AutocompleteResponse>> {
	try {
		const body = await request.json();
		const { input } = body;

		if (!input || typeof input !== "string") {
			return NextResponse.json(
				{ error: "Input text is required" },
				{ status: 400 }
			);
		}

		// Check cache first
		const cachedResult = GoogleApiCache.getAutocomplete(input);
		if (cachedResult) {
			console.log("Cache hit for autocomplete:", input);
			return NextResponse.json(cachedResult);
		}

		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Google Maps API key not configured" },
				{ status: 500 }
			);
		}

		// Using the new Places API (New) Autocomplete endpoint
		const response = await fetch(
			"https://places.googleapis.com/v1/places:autocomplete",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": apiKey,
					"X-Goog-FieldMask":
						"suggestions.placePrediction.placeId,suggestions.placePrediction.text",
				},
				body: JSON.stringify({
					input: input,
					includedPrimaryTypes: ["establishment", "geocode"],
					languageCode: "en",
				}),
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Places API error:", response.status, errorText);
			throw new Error(`Places API error: ${response.status}`);
		}

		const data = await response.json();

		// Transform the new API response format to match the expected format
		const predictions: PlacePrediction[] = [];

		if (data.suggestions) {
			for (const suggestion of data.suggestions) {
				if (suggestion.placePrediction) {
					const placePrediction = suggestion.placePrediction;
					const fullText = placePrediction.text?.text || "";
					const textParts = fullText.split(",");

					predictions.push({
						place_id: placePrediction.placeId,
						description: fullText,
						structured_formatting: {
							main_text: textParts[0]?.trim() || "",
							secondary_text: textParts.slice(1).join(",").trim() || "",
						},
					});
				}
			}
		}

		const responseData = { predictions };

		// Cache the successful response
		GoogleApiCache.setAutocomplete(input, responseData);
		console.log("Cached autocomplete result for:", input);

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Autocomplete error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch place predictions" },
			{ status: 500 }
		);
	}
}
