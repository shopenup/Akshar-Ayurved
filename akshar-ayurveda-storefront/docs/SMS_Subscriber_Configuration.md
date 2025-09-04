# SMS Subscriber Configuration Guide

## Overview
This guide explains how to configure the SMS subscriber system to send text messages after placing orders.

## What's Been Implemented

### 1. Frontend SMS Service (`src/lib/services/sms-service.ts`)
- **Smart Routing**: Automatically detects if using backend or local API
- **Subscriber Integration**: New `triggerOrderPlacedEvent()` method
- **Fallback System**: Falls back to direct SMS if subscriber fails
- **Environment-Based**: Uses `NEXT_PUBLIC_BACKEND_URL` for production

### 2. Updated Payment Buttons
All payment methods now trigger SMS through the subscriber system:
- ✅ **Stripe Payment Button**
- ✅ **PayPal Payment Button** 
- ✅ **Razorpay Payment Button**
- ✅ **Manual Test Payment Button**
- ✅ **Main Checkout Page**

### 3. Local API Route (`/api/send-sms`)
- **Testing Endpoint**: For development and testing
- **Logging**: Comprehensive logging for debugging
- **Simulation**: Simulates SMS sending without actual Twilio calls

## Configuration Steps

### Step 1: Environment Variables
Add to your `.env.local` file:

```bash
# For Production (Backend Integration)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# For Development (Local Testing)
NODE_ENV=development
```

### Step 2: Backend Subscriber Endpoints
Your backend should have these endpoints:

#### Option A: Event-Based (Recommended)
```
POST /events/order.placed
Body: {
  "event": "order.placed",
  "data": {
    "id": "order_id",
    "customer": {
      "phone": "+91XXXXXXXXXX",
      "email": "customer@email.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "total": 1500,
    "items": [...],
    "status": "processing"
  }
}
```

#### Option B: Order-Specific
```
POST /orders/{order_id}/notify
Body: {
  "event": "order.placed",
  "data": {
    "id": "order_id",
    "customer": { "phone": "+91XXXXXXXXXX" },
    "order": { ... }
  }
}
```

### Step 3: Subscriber Configuration
Your backend subscriber should:

1. **Listen for Events**: Subscribe to `order.placed` events
2. **Extract Phone**: Get phone from `data.customer.phone`
3. **Send SMS**: Use your existing Twilio service
4. **Handle Templates**: Use templates like `order-confirmation-sms`

## How It Works

### 1. Order Placement Flow
```
User Places Order → Payment Success → triggerOrderPlacedEvent() → Backend Subscriber → Twilio SMS
```

### 2. Fallback System
```
Subscriber Fails → Fallback to Direct SMS → Local API Route → Logging Only
```

### 3. Environment Detection
```
Production → Backend URL → Real Subscriber
Development → Local API → Test Mode
```

## Testing

### 1. Test SMS Service
Visit `/test-sms` to test the SMS service independently.

### 2. Test Order Flow
1. Place an order through any payment method
2. Check browser console for SMS logs
3. Verify subscriber triggers

### 3. Check Logs
Look for these console messages:
- 🎯 `Triggering order.placed event for subscriber`
- ✅ `Order placed event triggered successfully`
- 📱 `SMS Request Received` (local API)
- ✅ `SMS sent successfully`

## Troubleshooting

### Common Issues

#### 1. "Subscriber Not Found"
- Check backend URL in environment variables
- Verify subscriber endpoints exist
- Check network requests in browser dev tools

#### 2. "Phone Number Missing"
- Ensure phone is collected in checkout
- Check phone format (+91XXXXXXXXXX)
- Verify customer data structure

#### 3. "Template Not Found"
- Check backend SMS templates
- Verify template names match
- Check Twilio service configuration

### Debug Steps

1. **Check Console Logs**: Look for SMS-related messages
2. **Network Tab**: Verify API calls to subscriber endpoints
3. **Environment**: Confirm `NODE_ENV` and backend URL
4. **Phone Format**: Ensure phone numbers include country code

## Production Deployment

### 1. Update Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://your-production-backend.com
```

### 2. Remove Local API
The local `/api/send-sms` route is only for development.

### 3. Verify Subscriber
Ensure your backend subscriber is running and listening for events.

## Next Steps

1. **Configure Backend**: Set up the subscriber endpoints
2. **Test Integration**: Verify SMS sending through subscriber
3. **Monitor Logs**: Check for successful SMS delivery
4. **Customize Templates**: Modify SMS content as needed

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify network requests in dev tools
3. Check backend subscriber logs
4. Ensure Twilio credentials are configured

The system is designed to be robust with fallbacks, so orders will complete even if SMS fails.
