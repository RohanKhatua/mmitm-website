import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function shareVenue(venue: {
	name: string;
	address: string;
	google_maps_url: string;
}): Promise<boolean> {
	// Create sharing text
	const shareText = `Check out ${venue.name} at ${venue.address}!`;

	// Try to use the Web Share API if available
	if (navigator.share) {
		try {
			await navigator.share({
				title: `MMITM: ${venue.name}`,
				text: shareText,
				url: venue.google_maps_url,
			});
			return true;
		} catch (error) {
			console.error("Error sharing:", error);
			return fallbackShare(shareText, venue.google_maps_url);
		}
	} else {
		return fallbackShare(shareText, venue.google_maps_url);
	}
}

function fallbackShare(text: string, url: string): boolean {
	// Create a share URL with text and link
	const shareData = `${text} ${url}`;

	// Create a temporary textarea to copy text to clipboard
	const textarea = document.createElement("textarea");
	textarea.value = shareData;
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
