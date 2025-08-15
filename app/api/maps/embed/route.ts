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
		const mode = searchParams.get("mode") || "view"; // "place" or "view"
		const q = searchParams.get("q"); // for place mode
		const center = searchParams.get("center"); // for view mode
		const zoom = searchParams.get("zoom") || "15";
		const maptype = searchParams.get("maptype") || "roadmap";

		const baseUrl = "https://www.google.com/maps/embed/v1";
		let embedUrl: string;

		if (mode === "place" && q) {
			// Use place mode to show specific venue
			const params = new URLSearchParams({
				key: apiKey,
				q,
				zoom,
				maptype,
			});
			embedUrl = `${baseUrl}/place?${params.toString()}`;
		} else if (mode === "view" && center) {
			// Use view mode to show overview
			const params = new URLSearchParams({
				key: apiKey,
				center,
				zoom,
				maptype,
			});
			embedUrl = `${baseUrl}/view?${params.toString()}`;
		} else {
			return NextResponse.json(
				{ error: "Invalid parameters for embed URL" },
				{ status: 400 }
			);
		}

		return NextResponse.json({ url: embedUrl });
	} catch (error) {
		console.error("Error generating embed URL:", error);
		return NextResponse.json(
			{ error: "Failed to generate embed URL" },
			{ status: 500 }
		);
	}
}
