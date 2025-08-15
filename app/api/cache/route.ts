import { NextRequest, NextResponse } from "next/server";
import { GoogleApiCache } from "@/lib/cache";
import type { CacheStatsResponse } from "@/lib/types";

export async function GET(
	request: NextRequest
): Promise<NextResponse<CacheStatsResponse>> {
	try {
		const stats = GoogleApiCache.getStats();

		return NextResponse.json({
			stats,
			message: "Cache statistics retrieved successfully",
		});
	} catch (error) {
		console.error("Cache stats error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve cache statistics" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest
): Promise<NextResponse<CacheStatsResponse>> {
	try {
		GoogleApiCache.clearAll();

		return NextResponse.json({
			message: "All caches cleared successfully",
		});
	} catch (error) {
		console.error("Cache clear error:", error);
		return NextResponse.json(
			{ error: "Failed to clear caches" },
			{ status: 500 }
		);
	}
}
