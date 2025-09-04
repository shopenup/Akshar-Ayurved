# 🔍 Middleware Analysis: Why Your Old Code Worked

## **The Issue Explained**

Your old code worked because it likely had a **region-based API key system** or **different middleware configuration**. The new ShopenUp framework has stricter validation.

## **What the Middleware is Checking**

The `ensurePublishableApiKeyMiddleware` validates requests by checking:

### **1. Header Validation**
```javascript
const publishableApiKey = req.get("x-publishable-api-key");
if (!publishableApiKey) {
  throw new Error("Publishable API key required in the request header: x-publishable-api-key");
}
```

### **2. Database Validation**
```javascript
const { data } = await query.graph({
  entity: "api_key",
  fields: ["id", "token", "sales_channels_link.sales_channel_id"],
  filters: {
    token: publishableApiKey,           // Your key: pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f
    type: "publishable",                // Must be publishable type
    $or: [
      { revoked_at: { $eq: null } },    // Not revoked
      { revoked_at: { $gt: new Date() } }, // Or revoked in the future
    ],
  },
});
```

### **3. Sales Channel Linking**
```javascript
if (!apiKey) {
  throw new Error("A valid publishable key is required to proceed with the request");
}

// Must be linked to sales channels
req.publishable_key_context = {
  key: apiKey.token,
  sales_channel_ids: apiKey.sales_channels_link.map((link) => link.sales_channel_id),
};
```

## **Why Your Old Code Worked**

### **Possible Reasons:**

1. **Region-Based Keys**: Old code might have used region-specific API keys
2. **Different Middleware**: Less strict validation
3. **Direct Database Access**: Bypassed middleware entirely
4. **Different Framework Version**: Older versions had different requirements

## **What's Missing Now**

### **Current Status:**
- ✅ **Frontend Environment**: `NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY` set
- ✅ **Backend Environment**: `PUBLISHABLE_API_KEY` set  
- ❌ **Database**: API key not stored
- ❌ **Sales Channel Link**: No connection between key and sales channel

## **The Solution**

### **Step 1: Create API Key in Database**
```sql
INSERT INTO api_key (id, token, type, title, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f',
  'publishable',
  'Frontend Publishable Key',
  NOW(),
  NOW()
);
```

### **Step 2: Link to Sales Channel**
```sql
INSERT INTO api_key_sales_channel_link (api_key_id, sales_channel_id)
VALUES ('API_KEY_UUID', 'SALES_CHANNEL_UUID');
```

### **Step 3: Verify Setup**
```sql
SELECT 
  ak.id,
  ak.token,
  ak.type,
  ak.title,
  COUNT(aksl.sales_channel_id) as linked_channels
FROM api_key ak
LEFT JOIN api_key_sales_channel_link aksl ON ak.id = aksl.api_key_id
WHERE ak.token = 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f'
GROUP BY ak.id;
```

## **Why This Happens**

### **Framework Design:**
1. **Security**: API keys must be stored securely in database
2. **Sales Channel Isolation**: Keys are tied to specific sales channels
3. **Validation**: Middleware ensures proper key usage
4. **Audit Trail**: Database tracks key usage and permissions

### **Environment Variables vs Database:**
- **Environment Variables**: For configuration (like Twilio credentials)
- **Database**: For runtime validation and permissions

## **Next Steps**

1. **Run the fix script**: `node fix-api-key.js`
2. **Test the connection**: Place an order to verify SMS works
3. **Check logs**: Verify backend receives requests properly

## **Alternative: Keep Development Mode**

If you prefer not to fix the database:
- ✅ **SMS works** via local API
- ✅ **No backend configuration** needed
- ❌ **SMS is simulated** (not real Twilio)
- ❌ **Limited functionality**

**Your choice: Fix the database for full functionality, or keep development mode for testing.**

