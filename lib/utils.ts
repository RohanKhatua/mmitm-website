import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateVenueShareText(venue: {
	name: string;
	address: string;
	google_maps_url: string;
}): { shareText: string; shareUrl: string } {
	// Create sharing text
	const shareText = `Check out ${venue.name} at ${venue.address}!`;

	return {
		shareText,
		shareUrl: venue.google_maps_url,
	};
}

export async function copyVenueToClipboard(venue: {
	name: string;
	address: string;
	google_maps_url: string;
}): Promise<boolean> {
	const { shareText, shareUrl } = generateVenueShareText(venue);
	// Combine text and URL for the copy operation
	const fullText = `${shareText} ${shareUrl}`;

	return copyTextToClipboard(fullText);
}

export async function shareVenue(venue: {
	name: string;
	address: string;
	google_maps_url: string;
}): Promise<boolean> {
	const { shareText, shareUrl } = generateVenueShareText(venue);

	// Try to use the Web Share API if available
	if (navigator.share) {
		try {
			await navigator.share({
				title: `MMITM: ${venue.name}`,
				text: shareText,
				url: shareUrl,
			});
			return true;
		} catch (error) {
			console.error("Error sharing:", error);
			return fallbackShare(shareText, shareUrl);
		}
	} else {
		return fallbackShare(shareText, shareUrl);
	}
}

export function generateRecommendationShareText(
	recommendations: Array<{
		name: string;
		address: string;
		category: string;
	}>,
	sessionId?: string
): { shareText: string; shareUrl: string } {
	// Create share text with recommendations list
	let shareText = `Check out these venues I found with Meet Me In The Middle!\n\n`;

	// Add top 5 recommendations
	const topRecs = recommendations.slice(0, 5);
	topRecs.forEach((rec, index) => {
		shareText += `${index + 1}. ${rec.name} (${rec.category}) - ${
			rec.address
		}\n`;
	});

	if (recommendations.length > 5) {
		shareText += `\n... and ${recommendations.length - 5} more venues`;
	}

	// Add link to session if available
	let shareUrl = window.location.origin;
	if (sessionId) {
		shareUrl = `${window.location.origin}/sessions/${sessionId}`;
		shareText += `\n\nView all recommendations: ${shareUrl}`;
	}

	return { shareText, shareUrl };
}

export async function copyRecommendationSetToClipboard(
	recommendations: Array<{
		name: string;
		address: string;
		category: string;
	}>,
	sessionId?: string
): Promise<boolean> {
	const { shareText, shareUrl } = generateRecommendationShareText(
		recommendations,
		sessionId
	);

	// Combine text and URL for the copy operation
	const fullText = shareText + (shareUrl ? ` ${shareUrl}` : "");

	return copyTextToClipboard(fullText);
}

export async function shareRecommendationSet(
	recommendations: Array<{
		name: string;
		address: string;
		category: string;
	}>,
	sessionId?: string
): Promise<boolean> {
	const { shareText, shareUrl } = generateRecommendationShareText(
		recommendations,
		sessionId
	);

	// Try to use the Web Share API if available
	if (navigator.share) {
		try {
			await navigator.share({
				title: `MMITM: Venue Recommendations`,
				text: shareText,
				url: sessionId ? shareUrl : undefined,
			});
			return true;
		} catch (error) {
			console.error("Error sharing:", error);
			return fallbackShare(shareText, sessionId ? shareUrl : "");
		}
	} else {
		return fallbackShare(shareText, sessionId ? shareUrl : "");
	}
}

function copyTextToClipboard(text: string): boolean {
	// Create a temporary textarea to copy text to clipboard
	const textarea = document.createElement("textarea");
	textarea.value = text;
	document.body.appendChild(textarea);
	textarea.select();

	try {
		// Copy text to clipboard
		const success = document.execCommand("copy");
		return success;
	} catch (err) {
		console.error("Failed to copy:", err);
		return false;
	} finally {
		document.body.removeChild(textarea);
	}
}

function fallbackShare(text: string, url: string): boolean {
	// Create a share URL with text and link
	const shareData = `${text} ${url}`;

	return copyTextToClipboard(shareData);
}
