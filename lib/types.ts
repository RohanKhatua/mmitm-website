// Type definitions for MMITM backend API responses
// Based on the backend documentation

export type SessionStatus =
	| "waiting_for_participants"
	| "ready_for_recommendations"
	| "generating_recommendations"
	| "recommendations_ready"
	| "expired";

export type TransportMode = "DRIVE" | "WALK" | "TRANSIT" | "BICYCLE";

export type PriceLevel =
	| "PRICE_LEVEL_FREE"
	| "PRICE_LEVEL_INEXPENSIVE"
	| "PRICE_LEVEL_MODERATE"
	| "PRICE_LEVEL_EXPENSIVE"
	| "PRICE_LEVEL_VERY_EXPENSIVE";

export type PlaceCategory =
	| "restaurant"
	| "cafe"
	| "bar"
	| "bakery"
	| "meal_takeaway"
	| "meal_delivery"
	| "movie_theater"
	| "museum"
	| "art_gallery"
	| "night_club"
	| "park"
	| "zoo"
	| "stadium"
	| "gym"
	| "shopping_mall"
	| "store"
	| "book_store"
	| "clothing_store"
	| "library"
	| "tourist_attraction";

export interface ParticipantLocation {
	lat: number;
	lng: number;
}

export interface ParticipantAddress {
	address: string;
}

export type ParticipantInput = ParticipantLocation | ParticipantAddress;

export interface Participant {
	user_id: string;
	name: string;
	location: ParticipantInput | null;
	joined_at: string;
	is_ready: boolean;
}

export interface SessionSettings {
	categories: PlaceCategory[];
	transport_mode: TransportMode;
	limit: number;
	auto_refresh: boolean;
	require_all_participants: boolean;
}

export interface Session {
	id: string;
	name: string;
	creator_id: string;
	participants: Record<string, Participant>;
	settings: SessionSettings;
	status: SessionStatus;
	created_at: string;
	updated_at: string;
	expires_at: string;
}

export interface TravelTimeInfo {
	participant_index: number;
	travel_time_minutes: number;
	transport_mode: string;
	google_maps_directions_url: string;
}

export interface EnhancedVenueRecommendation {
	name: string;
	address: string;
	lat: number;
	lng: number;
	rating?: number;
	reviews?: number;
	google_maps_url: string;
	travel_times: TravelTimeInfo[];
	category: string;
	price_level?: PriceLevel;
}

export interface SessionStatusResponse {
	session: Session;
	recommendations: EnhancedVenueRecommendation[] | null;
}

export interface CreateSessionRequest {
	name: string;
	creator_name: string;
	settings: SessionSettings;
}

export interface CreateSessionResponse {
	session_id: string;
	join_code: string;
	session: Session;
}

export interface JoinSessionRequest {
	join_code: string;
	participant_name: string;
}

export interface JoinSessionResponse {
	user_id: string;
	session: Session;
}

export interface UpdateLocationRequest {
	session_id: string;
	user_id: string;
	location: ParticipantInput;
	is_ready: boolean;
}

export interface GenerateRecommendationsRequest {
	session_id: string;
	user_id: string;
}

export interface InstantRecommendationsRequest {
	participants: ParticipantInput[];
	categories: PlaceCategory[];
	transport_mode?: TransportMode;
	limit?: number;
}

export interface SessionHealthResponse {
	session_id: string;
	status: SessionStatus;
	participant_count: number;
	ready_count: number;
	updated_at: string;
}

export interface HealthResponse {
	status: string;
	service: string;
	version?: string;
}

export interface APIError {
	error: string;
	status?: number;
}

// Location and Place related types
export interface LocationData {
	lat: number;
	lng: number;
	address: string;
	placeId?: string;
}

export interface PlacePrediction {
	place_id: string;
	description: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
}

export interface ParticipantLocationWithId {
	id: string;
	name: string;
	location: ParticipantInput | null;
}

// API Response types
export interface GeocodeResponse {
	lat?: number;
	lng?: number;
	address?: string;
	error?: string;
}

export interface AutocompleteResponse {
	predictions?: PlacePrediction[];
	error?: string;
}

export interface PlaceLocation {
	lat: number;
	lng: number;
}

export interface PlaceDetailsResponse {
	name?: string;
	address?: string;
	location?: PlaceLocation;
	rating?: number;
	reviews?: number;
	price_level?: string;
	google_maps_url?: string;
	error?: string;
}

export interface CacheStatsResponse {
	stats?: any;
	message?: string;
	error?: string;
}

// UI Component types
export type ViewMode = "list" | "map";

export interface LocationInputProps {
	onLocationSelect?: (location: LocationData) => void;
	placeholder?: string;
	className?: string;
}

export interface EmbedMapViewRecommendationsProps {
	recommendations: EnhancedVenueRecommendation[];
	participants: ParticipantLocationWithId[];
	isLoading: boolean;
	className?: string;
}

export interface RecommendationDisplayProps {
	recommendations: EnhancedVenueRecommendation[];
	participants: ParticipantLocationWithId[];
	isLoading: boolean;
}

export interface VenueDetailModalProps {
	venue: EnhancedVenueRecommendation | null;
	participants: ParticipantLocationWithId[];
	isOpen: boolean;
	onClose: () => void;
}

export interface Preferences {
	categories: PlaceCategory[];
	transportMode: TransportMode;
	limit: number;
}

export interface PreferencesFormProps {
	preferences: Preferences;
	onPreferencesChange: (preferences: Preferences) => void;
}

export interface ConnectionStatusProps {
	status: "connected" | "disconnected" | "error";
	onRetry?: () => void;
}

export interface FilterOptions {
	sortBy: "fairness" | "rating" | "travel_time" | "reviews";
	sortOrder: "asc" | "desc";
	categoryFilter: string[];
	priceFilter: string[];
	minRating: number;
	maxTravelTime: number;
}

export interface RecommendationFiltersProps {
	onFiltersChange: (filters: FilterOptions) => void;
	categories: string[];
	priceRange: [number, number];
	ratingRange: [number, number];
}

export interface RecommendationResultsProps {
	recommendations: EnhancedVenueRecommendation[];
	participants: ParticipantLocationWithId[];
	isLoading: boolean;
	filters: FilterOptions;
}

// Session types for hooks
export interface SessionHealth {
	session_id: string;
	status: string;
	participant_count: number;
	ready_count: number;
	updated_at: string;
	has_recommendations: boolean;
}

export interface UseSessionPollingProps {
	sessionId: string;
	userId: string;
	enabled?: boolean;
	onStatusChange?: (status: SessionStatus) => void;
	onRecommendationsReady?: (
		recommendations: EnhancedVenueRecommendation[]
	) => void;
}

export interface UseSessionPollingHookProps {
	sessionId: string;
	onSessionUpdate: (session: Session) => void;
	pollingInterval?: number;
}

export interface SessionLobbyProps {
	session: Session;
	currentUserId: string | null;
	onSessionUpdate: (session: Session) => void;
}
