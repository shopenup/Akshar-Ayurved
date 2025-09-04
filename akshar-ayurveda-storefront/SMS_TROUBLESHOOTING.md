# SMS Troubleshooting Guide

If you're not receiving SMS messages, follow these steps to diagnose and fix the issue.

## 🔍 **Step 1: Check Browser Console**

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Place an order or test SMS
4. Look for these log messages:

### ✅ **Expected Console Output:**
```
🚀 Attempting to send SMS: {
  to: "+917801806153",
  template: "order-confirmation-sms",
  data: {...},
  endpoint: "/api/send-sms"
}
📡 SMS API Response status: 200
✅ SMS sent successfully: {...}
```

### ❌ **If You See Errors:**
- **Network errors**: Check if the API endpoint is accessible
- **CORS errors**: Backend configuration issue
- **404 errors**: API route not found

## 🔧 **Step 2: Test the SMS API Directly**

### **Option A: Use the Test Page**
1. Navigate to `/test-sms` in your browser
2. Enter a phone number
3. Click "Send Test SMS"
4. Check the result message

### **Option B: Test API Endpoint**
1. Open your browser
2. Go to `http://localhost:3000/api/send-sms`
3. You should see a "Method not allowed" message (this is correct for GET requests)

### **Option C: Use Browser Console**
```javascript
// Test SMS API directly
fetch('/api/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+917801806153',
    template: 'order-confirmation-sms',
    data: { order_id: 'TEST123' }
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 🚨 **Step 3: Common Issues & Solutions**

### **Issue 1: "Cannot find module" errors**
**Solution:** Install missing packages
```bash
npm install react-razorpay @paypal/paypal-js @stripe/react-stripe-js
```

### **Issue 2: API endpoint not found (404)**
**Solution:** Ensure the API route exists
- Check if `src/pages/api/send-sms.ts` exists
- Restart your development server

### **Issue 3: CORS errors**
**Solution:** The local API route should not have CORS issues

### **Issue 4: Phone number format issues**
**Solution:** Ensure phone numbers include country code
- ✅ Correct: `+917801806153`
- ❌ Incorrect: `7801806153`

## 📱 **Step 4: Verify SMS Integration Points**

### **Checkout Page**
- Phone number is collected in the form
- SMS is sent after order placement
- Check console for SMS service logs

### **Payment Buttons**
- Stripe, PayPal, Razorpay buttons all call SMS service
- SMS is sent after successful payment
- Check payment completion logs

### **Test Page**
- `/test-sms` page for independent testing
- Bypasses order flow for direct SMS testing

## 🔐 **Step 5: Environment Variables**

Ensure these are set in your `.env.local`:
```env
# For production, set your actual backend URL
NEXT_PUBLIC_SHOPENUP_BACKEND_URL=http://localhost:9000

# Twilio credentials (if using backend service)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

## 🧪 **Step 6: Debug Mode**

Enable detailed logging by adding this to your SMS service:
```typescript
// In sms-service.ts
console.log('🔍 Debug: SMS Service initialized with baseUrl:', this.baseUrl);
console.log('🔍 Debug: Notification data:', notification);
```

## 📊 **Step 7: Check Network Tab**

1. Open Developer Tools → Network tab
2. Place an order or send test SMS
3. Look for the `/api/send-sms` request
4. Check request/response details

## 🚀 **Step 8: Production Deployment**

When deploying to production:
1. Update `baseUrl` in SMS service to your backend URL
2. Ensure backend Twilio service is properly configured
3. Test with real phone numbers
4. Monitor backend logs for SMS delivery

## 📞 **Step 9: Get Help**

If issues persist:
1. Check all console logs
2. Verify API endpoint accessibility
3. Test with the `/test-sms` page
4. Check network requests in browser
5. Review this troubleshooting guide again

## 🎯 **Quick Test Checklist**

- [ ] Development server is running (`npm run dev`)
- [ ] API route exists (`/api/send-sms`)
- [ ] Browser console shows SMS logs
- [ ] Test page works (`/test-sms`)
- [ ] Network requests are successful
- [ ] No JavaScript errors in console

## 🔄 **Reset & Retry**

If all else fails:
1. Stop development server
2. Clear browser cache
3. Restart development server
4. Test SMS functionality again
5. Check console for fresh logs
