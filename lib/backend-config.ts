// Configuration for the MMITM backend API
export const config = {
	// Backend API base URL - update this to match your actual backend deployment
	BACKEND_API_URL:
		process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000",

	// Request timeout in milliseconds
	REQUEST_TIMEOUT: 30000,

	// Headers for API requests
	DEFAULT_HEADERS: {
		"Content-Type": "application/json",
	},
};

// Helper function to make API requests to the backend
export async function makeBackendRequest(
	endpoint: string,
	options: RequestInit = {}
): Promise<Response> {
	const url = `${config.BACKEND_API_URL}${endpoint}`;

	const requestOptions: RequestInit = {
		...options,
		headers: {
			...config.DEFAULT_HEADERS,
			...options.headers,
		},
		// Add timeout handling
		signal: AbortSignal.timeout(config.REQUEST_TIMEOUT),
	};

	try {
		const response = await fetch(url, requestOptions);
		return response;
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === "TimeoutError") {
				throw new Error("Backend request timed out");
			}
			if (error.name === "AbortError") {
				throw new Error("Backend request was aborted");
			}
		}
		throw error;
	}
}

// Helper function to handle backend API responses
export async function handleBackendResponse(response: Response) {
	if (!response.ok) {
		let errorMessage = "Backend request failed";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			// If response isn't JSON, use the status text
			errorMessage = response.statusText || errorMessage;
		}
		throw new Error(errorMessage);
	}

	return response.json();
}
