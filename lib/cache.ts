import { LRUCache } from "lru-cache";

// Cache configuration
const CACHE_TTL = {
	AUTOCOMPLETE: 5 * 60 * 1000, // 5 minutes for autocomplete suggestions
	PLACE_DETAILS: 30 * 60 * 1000, // 30 minutes for place details (locations rarely change)
	GEOCODING: 60 * 60 * 1000, // 1 hour for reverse geocoding (addresses rarely change)
	RECOMMENDATIONS: 10 * 60 * 1000, // 10 minutes for recommendations
} as const;

const CACHE_MAX_SIZE = {
	AUTOCOMPLETE: 500, // Keep up to 500 autocomplete queries
	PLACE_DETAILS: 1000, // Keep up to 1000 place details
	GEOCODING: 200, // Keep up to 200 geocoding results
	RECOMMENDATIONS: 100, // Keep up to 100 recommendation sets
} as const;

// Create separate caches for different API types
const autocompleteCache = new LRUCache<string, any>({
	max: CACHE_MAX_SIZE.AUTOCOMPLETE,
	ttl: CACHE_TTL.AUTOCOMPLETE,
});

const placeDetailsCache = new LRUCache<string, any>({
	max: CACHE_MAX_SIZE.PLACE_DETAILS,
	ttl: CACHE_TTL.PLACE_DETAILS,
});

const geocodingCache = new LRUCache<string, any>({
	max: CACHE_MAX_SIZE.GEOCODING,
	ttl: CACHE_TTL.GEOCODING,
});

const recommendationsCache = new LRUCache<string, any>({
	max: CACHE_MAX_SIZE.RECOMMENDATIONS,
	ttl: CACHE_TTL.RECOMMENDATIONS,
});

export class GoogleApiCache {
	/**
	 * Cache autocomplete results
	 */
	static getAutocomplete(input: string): any | null {
		const key = `autocomplete:${input.toLowerCase().trim()}`;
		return autocompleteCache.get(key) || null;
	}

	static setAutocomplete(input: string, data: any): void {
		const key = `autocomplete:${input.toLowerCase().trim()}`;
		autocompleteCache.set(key, data);
	}

	/**
	 * Cache place details results
	 */
	static getPlaceDetails(placeId: string): any | null {
		const key = `place_details:${placeId}`;
		return placeDetailsCache.get(key) || null;
	}

	static setPlaceDetails(placeId: string, data: any): void {
		const key = `place_details:${placeId}`;
		placeDetailsCache.set(key, data);
	}

	/**
	 * Cache geocoding results
	 */
	static getGeocoding(lat: number, lng: number): any | null {
		// Round to 6 decimal places for consistent caching (about 0.1m precision)
		const roundedLat = Math.round(lat * 1000000) / 1000000;
		const roundedLng = Math.round(lng * 1000000) / 1000000;
		const key = `geocoding:${roundedLat},${roundedLng}`;
		return geocodingCache.get(key) || null;
	}

	static setGeocoding(lat: number, lng: number, data: any): void {
		// Round to 6 decimal places for consistent caching
		const roundedLat = Math.round(lat * 1000000) / 1000000;
		const roundedLng = Math.round(lng * 1000000) / 1000000;
		const key = `geocoding:${roundedLat},${roundedLng}`;
		geocodingCache.set(key, data);
	}

	/**
	 * Cache recommendations results
	 */
	static getRecommendations(key: string): any | null {
		return recommendationsCache.get(key) || null;
	}

	static setRecommendations(key: string, data: any): void {
		recommendationsCache.set(key, data);
	}

	/**
	 * Clear all caches (useful for debugging or manual cache invalidation)
	 */
	static clearAll(): void {
		autocompleteCache.clear();
		placeDetailsCache.clear();
		geocodingCache.clear();
		recommendationsCache.clear();
	}

	/**
	 * Get cache statistics
	 */	static getStats() {
		return {
			autocomplete: {
				size: autocompleteCache.size,
				maxSize: CACHE_MAX_SIZE.AUTOCOMPLETE,
				ttl: CACHE_TTL.AUTOCOMPLETE,
			},
			placeDetails: {
				size: placeDetailsCache.size,
				maxSize: CACHE_MAX_SIZE.PLACE_DETAILS,
				ttl: CACHE_TTL.PLACE_DETAILS,
			},
			geocoding: {
				size: geocodingCache.size,
				maxSize: CACHE_MAX_SIZE.GEOCODING,
				ttl: CACHE_TTL.GEOCODING,
			},
			recommendations: {
				size: recommendationsCache.size,
				maxSize: CACHE_MAX_SIZE.RECOMMENDATIONS,
				ttl: CACHE_TTL.RECOMMENDATIONS,
			},
		};
	}

	/**
	 * Get cache contents
	 */
	static getAutocompleteContents(): Array<[string, any]> {
		return autocompleteCache.dump();
	}

	static getPlaceDetailsContents(): Array<[string, any]> {
		return placeDetailsCache.dump();
	}

	static getGeocodingContents(): Array<[string, any]> {
		return geocodingCache.dump();
	}

	static getRecommendationsContents(): Array<[string, any]> {
		return recommendationsCache.dump();
	}
}
