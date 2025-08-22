import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";
import { GoogleApiCache } from "@/lib/cache";

// API endpoint that proxies to the Rust backend for instant recommendations
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { participants, categories, transport_mode, limit } = body;

		// Validate required fields
		if (
			!participants ||
			!Array.isArray(participants) ||
			participants.length === 0
		) {
			return NextResponse.json(
				{ error: "Participants are required" },
				{ status: 400 }
			);
		}

		if (!categories || !Array.isArray(categories) || categories.length === 0) {
			return NextResponse.json(
				{ error: "Categories are required" },
				{ status: 400 }
			);
		}

		// Create a consistent cache key from the request parameters
		const cacheKey = JSON.stringify({
			participants: participants.sort((a: any, b: any) => {
				// Sort participants for consistent cache key
				if (a.lat && b.lat) return a.lat - b.lat;
				return 0;
			}),
			categories: categories.sort(), // Sort categories for consistent cache key
			transport_mode: transport_mode || "DRIVE",
			limit: limit || 10,
		});

		// Check cache first
		const cachedResult = GoogleApiCache.getRecommendations(cacheKey);
		if (cachedResult) {
			console.log("Cache hit for recommendations");
			return NextResponse.json(cachedResult);
		}

		// Call the backend API
		const response = await makeBackendRequest("/recommendations", {
			method: "POST",
			body: JSON.stringify({
				participants,
				categories,
				transport_mode: transport_mode || "DRIVE",
				limit: limit || 10,
			}),
		});

		const recommendations = await handleBackendResponse(response);

		// Cache the successful response
		GoogleApiCache.setRecommendations(cacheKey, recommendations);
		console.log("Cached recommendations");

		return NextResponse.json(recommendations);
	} catch (error) {
		console.error("Error processing recommendations request:", error);

		// Handle specific error types
		if (error instanceof Error) {
			if (error.message.includes("timed out")) {
				return NextResponse.json(
					{ error: "Backend request timed out" },
					{ status: 504 }
				);
			}
			if (error.message.includes("Backend request failed")) {
				return NextResponse.json({ error: error.message }, { status: 502 });
			}
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
