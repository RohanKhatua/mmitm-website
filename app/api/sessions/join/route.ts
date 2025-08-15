import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

// API endpoint for joining sessions that proxies to the Rust backend
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { join_code, participant_name } = body;

		// Validate required fields
		if (!join_code || !participant_name) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Call the backend API
		const response = await makeBackendRequest("/sessions/join", {
			method: "POST",
			body: JSON.stringify({
				join_code,
				participant_name,
			}),
		});

		const sessionData = await handleBackendResponse(response);
		return NextResponse.json(sessionData);
	} catch (error) {
		console.error("Error joining session:", error);

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
