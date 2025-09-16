# MMITM Website - Copilot Instructions

This document provides essential knowledge to help you be productive in this codebase.

## Project Overview

MMITM ("Meet Me In The Middle") is a Next.js application that helps users find optimal meeting locations. It features:

- Real-time session-based collaboration
- Google Maps/Places integration for location input and visualization
- Venue recommendations based on fairness algorithms
- React components with Tailwind CSS and Radix UI primitives

## Key Architecture

### Core Patterns

- **Client-Server Architecture**:

  - Next.js for frontend + API routes that proxy to a separate backend service
  - `/app/api/*` routes proxy to the backend defined in `lib/backend-config.ts`
  - Caching layer for Google API responses in `lib/cache.ts`

- **Component Structure**:

  - UI components in `/components/ui/*` (shadcn/ui pattern)
  - Feature components in `/components/*`
  - Pages in `/app/*` (Next.js App Router)

- **State Management**:
  - Server components for static content
  - Client components for interactive elements with React hooks
  - Session polling pattern (see `hooks/use-session-polling.ts`)

### Data Flow

1. Users create/join sessions with location input
2. Locations are geocoded via Google Places API
3. Backend generates venue recommendations based on fairness algorithms
4. Results are displayed with filtering/sorting options

## Development Workflow

### Essential Commands

```bash
# Development
bun install          # Install dependencies
bun run dev          # Start development server

# Build and Deployment
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

### Environment Setup

1. Copy `.env.example` to `.env.local` and add your API keys:

   - Required: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for Maps/Places functionality
   - Required: Backend URL configuration (see `GOOGLE_PLACES_SETUP.md`)

2. Enable Google APIs:
   - Places API (New)
   - Maps JavaScript API
   - Geocoding API

## Key Integration Points

1. **Google Maps/Places**:

   - `components/location-input.tsx` - Uses Places Autocomplete
   - `app/api/geocode/route.ts` - Server-side geocoding
   - Utilizes `@vis.gl/react-google-maps` for map components
   - See `GOOGLE_PLACES_SETUP.md` for complete setup instructions

2. **Backend Communication**:
   - `lib/api-client.ts` - Client-side API wrapper
   - `lib/backend-config.ts` - Backend configuration
   - WebSocket-style polling pattern via `hooks/use-session-polling.ts`

## Conventions & Patterns

- **Component Patterns**:

  - Use "use client" directive for interactive components
  - Props interfaces declared at top of components
  - Radix UI primitives wrapped with Tailwind CSS
  - Class Variance Authority for component variants

- **Styling**:

  - Tailwind CSS for all styling (no CSS modules)
  - 2-space indentation
  - Consistent component exports with named exports

- **TypeScript**:

  - Strict typing for all components and API interfaces
  - Type definitions in `lib/types.ts`
  - Use zod for form validation when applicable

- **Error Handling**:
  - API error handling in `lib/api-client.ts`
  - UI error states with proper fallbacks
  - Loading states for asynchronous operations

## Example Workflows

### Adding a New Feature Component

1. Create component in `/components/`
2. Import UI primitives from `/components/ui/`
3. Add types from `lib/types.ts` or define inline
4. For API data, use the `MMITMApi` client from `lib/api-client.ts`
5. Use proper loading/error states with Suspense if needed

### Modifying API Integration

1. Update types in `lib/types.ts` if needed
2. Add new methods to `MMITMApi` class in `lib/api-client.ts`
3. Create or modify API route handler in `/app/api/*`
4. Update components to use the new functionality
