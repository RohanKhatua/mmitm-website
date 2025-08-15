# Backend Integration Guide

This Next.js frontend has been updated to integrate with the MMITM Rust backend. All mock API routes have been replaced with actual backend calls.

## Setup

1. **Configure Backend URL**: Copy `.env.example` to `.env.local` and set your backend URL:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000
   ```

2. **Start the Backend**: Make sure your Rust backend is running on the configured port.

3. **Start the Frontend**:
   ```bash
   bun run dev
   ```

## Updated API Routes

All the following Next.js API routes now proxy to the Rust backend:

### Health & Status

- `GET /api/health` → `GET {backend}/health`

### Instant Recommendations

- `POST /api/recommendations` → `POST {backend}/recommendations`

### Session Management

- `POST /api/sessions` → `POST {backend}/sessions`
- `POST /api/sessions/join` → `POST {backend}/sessions/join`
- `GET /api/sessions/{sessionId}` → `GET {backend}/sessions/{sessionId}`
- `GET /api/sessions/{sessionId}/health` → `GET {backend}/sessions/{sessionId}/health`

### Participant Management

- `PUT /api/sessions/{sessionId}/participants/{userId}/location` → `PUT {backend}/sessions/{sessionId}/participants/{userId}/location`

### Recommendations

- `POST /api/sessions/{sessionId}/recommendations` → `POST {backend}/sessions/{sessionId}/recommendations`

## New Features

### Type Safety

- Complete TypeScript definitions in `lib/types.ts`
- Matches the backend API documentation exactly

### API Client

- Convenient client wrapper in `lib/api-client.ts`
- Built-in error handling and retry logic
- Usage example:

  ```typescript
  import { api } from "@/lib/api-client";

  const recommendations = await api.getInstantRecommendations({
  	participants: [
  		{ lat: 34.0522, lng: -118.2437 },
  		{ address: "Downtown LA" },
  	],
  	categories: ["restaurant", "cafe"],
  	transport_mode: "DRIVE",
  	limit: 10,
  });
  ```

### Error Handling

- Proper HTTP status codes (500, 502, 504)
- Timeout handling (30s default)
- Backend unavailability detection
- Detailed error messages from backend

### Configuration

- Environment-based backend URL configuration
- Configurable timeout settings
- Debug logging options

## Development Tips

1. **Backend Development**: The frontend will show specific error messages when the backend is unavailable, making development easier.

2. **Health Checks**: Use `/api/health` to verify backend connectivity.

3. **Error Testing**: The frontend gracefully handles:

   - Backend timeouts
   - Backend unavailability
   - Invalid responses
   - Network errors

4. **CORS**: Make sure your Rust backend allows requests from your frontend origin.

## Deployment

1. **Environment Variables**: Set `NEXT_PUBLIC_BACKEND_API_URL` to your production backend URL.

2. **Backend First**: Deploy your Rust backend before the frontend.

3. **Health Monitoring**: The `/api/health` endpoint can be used for monitoring both frontend and backend status.

## Troubleshooting

### "Backend request timed out" (504)

- Backend is taking too long to respond
- Check backend performance
- Consider increasing timeout in config

### "Backend request failed" (502)

- Backend returned an error
- Check backend logs
- Verify API compatibility

### "Backend request was aborted" (503)

- Network connectivity issues
- Check backend URL configuration
- Verify backend is running

### CORS Errors

Add these headers to your Rust backend:

```rust
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
