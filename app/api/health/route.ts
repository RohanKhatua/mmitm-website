import { NextResponse } from "next/server";
import {
	makeBackendRequest,
	handleBackendResponse,
} from "@/lib/backend-config";

// Health check endpoint that proxies to the Rust backend
export async function GET() {
	try {
		// Call the backend API health endpoint
		const response = await makeBackendRequest("/health", {
			method: "GET",
		});

		const healthData = await handleBackendResponse(response);
		return NextResponse.json(healthData);
	} catch (error) {
		console.error("Backend health check failed:", error);

		// Return our own health status if backend is unavailable
		return NextResponse.json(
			{
				status: "degraded",
				service: "mmitm-frontend",
				backend_status: "unavailable",
				error: error instanceof Error ? error.message : "Backend unreachable",
			},
			{ status: 503 }
		);
	}
}
