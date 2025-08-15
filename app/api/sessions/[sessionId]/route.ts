import { type NextRequest, NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

// API endpoint for getting session details that proxies to the Rust backend
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { sessionId } = await params;

		// Call the backend API
		const response = await makeBackendRequest(`/sessions/${sessionId}`, {
			method: "GET",
		});

		const sessionData = await handleBackendResponse(response);
		return NextResponse.json(sessionData);
	} catch (error) {
		console.error("Error fetching session:", error);

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
