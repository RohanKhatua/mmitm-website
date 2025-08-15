// Client-side API wrapper for MMITM backend calls
// This provides a convenient interface for React components to interact with the API

import type {
	CreateSessionRequest,
	CreateSessionResponse,
	JoinSessionRequest,
	JoinSessionResponse,
	UpdateLocationRequest,
	SessionStatusResponse,
	GenerateRecommendationsRequest,
	InstantRecommendationsRequest,
	EnhancedVenueRecommendation,
	SessionHealthResponse,
	HealthResponse,
	APIError as APIErrorType,
} from "./types";

class APIError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = "APIError";
	}
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			// If response isn't JSON, use the status text
		}
		throw new APIError(response.status, errorMessage);
	}

	return response.json();
}

export class MMITMApi {
	private baseUrl: string;

	constructor(baseUrl: string = "/api") {
		this.baseUrl = baseUrl;
	}

	// Health check
	async checkHealth(): Promise<HealthResponse> {
		const response = await fetch(`${this.baseUrl}/health`);
		return handleResponse<HealthResponse>(response);
	}

	// Instant recommendations (no session required)
	async getInstantRecommendations(
		request: InstantRecommendationsRequest
	): Promise<EnhancedVenueRecommendation[]> {
		const response = await fetch(`${this.baseUrl}/recommendations`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(request),
		});
		return handleResponse<EnhancedVenueRecommendation[]>(response);
	}

	// Session management
	async createSession(
		request: CreateSessionRequest
	): Promise<CreateSessionResponse> {
		const response = await fetch(`${this.baseUrl}/sessions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(request),
		});
		return handleResponse<CreateSessionResponse>(response);
	}

	async joinSession(request: JoinSessionRequest): Promise<JoinSessionResponse> {
		const response = await fetch(`${this.baseUrl}/sessions/join`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(request),
		});
		return handleResponse<JoinSessionResponse>(response);
	}

	async getSession(sessionId: string): Promise<SessionStatusResponse> {
		const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);
		return handleResponse<SessionStatusResponse>(response);
	}

	async getSessionHealth(sessionId: string): Promise<SessionHealthResponse> {
		const response = await fetch(
			`${this.baseUrl}/sessions/${sessionId}/health`
		);
		return handleResponse<SessionHealthResponse>(response);
	}

	// Participant management
	async updateParticipantLocation(
		sessionId: string,
		userId: string,
		request: UpdateLocationRequest
	): Promise<SessionStatusResponse> {
		const response = await fetch(
			`${this.baseUrl}/sessions/${sessionId}/participants/${userId}/location`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
			}
		);
		return handleResponse<SessionStatusResponse>(response);
	}

	// Recommendations
	async generateSessionRecommendations(
		sessionId: string,
		request: GenerateRecommendationsRequest
	): Promise<SessionStatusResponse> {
		const response = await fetch(
			`${this.baseUrl}/sessions/${sessionId}/recommendations`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
			}
		);
		return handleResponse<SessionStatusResponse>(response);
	}
}

// Default API instance
export const api = new MMITMApi();

// Error handling utilities
export { APIError };

// Utility function to check if an error is an API error
export function isAPIError(error: unknown): error is APIError {
	return error instanceof APIError;
}

// Utility function to get error message from unknown error
export function getErrorMessage(error: unknown): string {
	if (isAPIError(error)) {
		return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "An unexpected error occurred";
}

// Utility function to check if backend is available
export async function checkBackendHealth(): Promise<boolean> {
	try {
		await api.checkHealth();
		return true;
	} catch {
		return false;
	}
}
