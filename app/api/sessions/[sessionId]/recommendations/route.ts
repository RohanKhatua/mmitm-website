import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

// API endpoint for generating session recommendations that proxies to the Rust backend
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { sessionId } = await params;
		const body = await request.json();
		const { user_id } = body;

		// Validate required fields
		if (!user_id) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Call the backend API
		const response = await makeBackendRequest(
			`/sessions/${sessionId}/recommendations`,
			{
				method: "POST",
				body: JSON.stringify({
					session_id: sessionId,
					user_id,
				}),
			}
		);

		const sessionData = await handleBackendResponse(response);
		return NextResponse.json(sessionData);
	} catch (error) {
		console.error("Error generating recommendations:", error);

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
