import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

// API endpoint for updating participant location that proxies to the Rust backend
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string; userId: string }> }
) {
	try {
		const { sessionId, userId } = await params;
		const body = await request.json();
		const { location, is_ready } = body;

		// Validate required fields
		if (!location) {
			return NextResponse.json(
				{ error: "Location is required" },
				{ status: 400 }
			);
		}

		// Call the backend API
		const response = await makeBackendRequest(
			`/sessions/${sessionId}/participants/${userId}/location`,
			{
				method: "PUT",
				body: JSON.stringify({
					session_id: sessionId,
					user_id: userId,
					location,
					is_ready: is_ready ?? true,
				}),
			}
		);

		const sessionData = await handleBackendResponse(response);
		return NextResponse.json(sessionData);
	} catch (error) {
		console.error("Error updating participant location:", error);

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
