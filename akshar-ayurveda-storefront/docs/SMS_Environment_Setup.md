# SMS Service Environment Setup

## Required Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# ShopenUp Backend Configuration
NEXT_PUBLIC_SHOPENUP_BACKEND_URL=http://localhost:9000

# ShopenUp API Keys
NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY=pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f

# Environment
NODE_ENV=development
```

## What Each Variable Does

### `NEXT_PUBLIC_SHOPENUP_BACKEND_URL`
- **Development**: `http://localhost:9000` (your local backend)
- **Production**: `https://your-production-backend.com`

### `NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY`
- **Required**: Your ShopenUp publishable API key
- **Current Value**: `pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f`
- **Purpose**: Authenticates requests to your backend

### `NODE_ENV`
- **Development**: `development` (uses local API routes)
- **Production**: `production` (uses SDK client with backend)

## Setup Steps

1. **Create `.env.local`** in your project root
2. **Copy the variables above** into the file
3. **Update the backend URL** to match your setup
4. **Verify the API key** is correct
5. **Restart your development server**

## How It Works

### Development Mode (`NODE_ENV=development`)
- SMS requests go to `/api/send-sms` (local API route)
- No backend authentication needed
- Perfect for testing and development

### Production Mode (`NODE_ENV=production`)
- SMS requests use SDK client
- Automatically includes all required headers:
  - `authorization`: JWT token from cookies
  - `x-publishable-api-key`: Your publishable key
  - `Content-Type`: application/json

## Testing

After setup:

1. **Check console logs** for SMS-related messages
2. **Place an order** to test the full flow
3. **Visit `/test-sms`** to test independently

## Troubleshooting

### "Publishable API key required"
- Ensure `.env.local` exists with correct variable names
- Check that `NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY` is set
- Restart your development server

### "API route not found"
- Ensure `NODE_ENV=development` for local testing
- Check that `/api/send-sms` route exists
- Verify environment variables are loaded

### "SDK client error"
- Check `NEXT_PUBLIC_SHOPENUP_BACKEND_URL` is correct
- Verify backend is running and accessible
- Check network requests in browser dev tools

## Important Notes

- **Variable names must match exactly** (use `NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY`)
- **Restart server** after changing environment variables
- **Development mode** uses local API routes (no backend needed)
- **Production mode** uses SDK client with full authentication

