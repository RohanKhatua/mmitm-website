import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Google Maps API key not configured" },
				{ status: 500 }
			);
		}

		// Get parameters from query string
		const size = searchParams.get("size") || "800x400";
		const maptype = searchParams.get("maptype") || "roadmap";
		const markers = searchParams.getAll("markers");
		const center = searchParams.get("center");
		const zoom = searchParams.get("zoom");

		const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
		const params = new URLSearchParams({
			key: apiKey,
			size,
			maptype,
		});

		// Add markers if provided
		if (markers.length > 0) {
			markers.forEach((marker) => params.append("markers", marker));
		} else if (center && zoom) {
			// Fallback when no markers - use manual center and zoom
			params.append("center", center);
			params.append("zoom", zoom);
		}

		const staticMapUrl = `${baseUrl}?${params.toString()}`;

		return NextResponse.json({ url: staticMapUrl });
	} catch (error) {
		console.error("Error generating static map URL:", error);
		return NextResponse.json(
			{ error: "Failed to generate static map URL" },
			{ status: 500 }
		);
	}
}
