import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

// API endpoint for creating sessions that proxies to the Rust backend
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, creator_name, settings } = body;

		// Validate required fields
		if (!name || !creator_name || !settings) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Call the backend API
		const response = await makeBackendRequest("/sessions", {
			method: "POST",
			body: JSON.stringify({
				name,
				creator_name,
				settings,
			}),
		});

		const sessionData = await handleBackendResponse(response);
		return NextResponse.json(sessionData);
	} catch (error) {
		console.error("Error creating session:", error);

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
