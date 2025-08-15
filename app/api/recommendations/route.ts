import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

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
