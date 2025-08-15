# Google Places API (New) Setup

This project uses the new Google Places API for enhanced location input functionality. Here's how to set it up:

## Prerequisites

1. **Google Cloud Project**: You'll need a Google Cloud project with billing enabled.
2. **Google Maps API Key**: Create an API key with the required permissions.

## Setup Instructions

### 1. Enable Required APIs

In your Google Cloud Console, enable these APIs:

- **Places API (New)** (for autocomplete and place details)
- **Maps JavaScript API** (for map display)
- **Geocoding API** (for reverse geocoding)

**Enable APIs:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable each API listed above

**Important**: Make sure to enable the **"Places API (New)"** specifically, not the legacy Places API.

### 2. Create an API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

### 3. Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. Click on your API key in the credentials list
2. Under "Application restrictions":
   - For development: Choose "HTTP referrers" and add `localhost:3000/*`
   - For production: Add your domain(s)
3. Under "API restrictions":
   - Select "Restrict key"
   - Select: Places API (New), Maps JavaScript API, Geocoding API

### 4. Add API Key to Your Project

1. Create a `.env.local` file in your project root (if it doesn't exist):

2. Edit `.env.local` and add your API key:

   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server to load the new environment variable

## Features

Your location input component now includes:

- **Places Autocomplete**: Real-time address suggestions using Google Places API (New)
- **Current Location**: GPS-based location detection with reverse geocoding
- **Place Details**: Automatic lat/lng resolution for selected places
- **Fallback Support**: Works without API key (manual address entry only)
- **Modern API**: Uses the latest Google Places API (New) for better performance and features

## API Endpoints Created

This setup includes three new API endpoints:

1. **`/api/places/autocomplete`** - Provides place predictions as user types
2. **`/api/places/details`** - Gets lat/lng coordinates for selected places
3. **`/api/geocode`** - Reverse geocodes GPS coordinates to addresses

## Pricing Information

Google Places API (New) usage is charged per request:

- **Autocomplete (per session)**: ~$0.017 per session
- **Place Details**: $0.017 per request
- **Geocoding**: $0.005 per request

**Cost Optimization Tips:**

- Use session tokens for autocomplete to reduce costs
- Implement debouncing to reduce API calls
- Consider caching frequently requested places

## Troubleshooting

**Autocomplete not working:**

- Check that your API key is correctly set in `.env.local`
- Verify that the Places API (New), Maps JavaScript API, and Geocoding API are enabled
- Check browser console for any JavaScript errors
- Ensure you're using the new Places API (New), not the legacy version

**"No predictions" or API errors:**

- Ensure Places API (New) is enabled in your Google Cloud project
- Check API key restrictions aren't blocking requests
- Verify your domain is allowed in API key restrictions

## Security Notes

- Never commit your API key to version control
- Use environment variables for API keys
- Restrict your API key to specific domains/IPs
- Monitor API usage regularly
- Consider implementing rate limiting

## Migration from Basic Input

The enhanced component is backward compatible. No changes needed to existing code that uses the LocationInput component.
