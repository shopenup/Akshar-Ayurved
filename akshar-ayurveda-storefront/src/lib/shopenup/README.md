# Shopenup Integration Guide

This directory contains the integration layer for all 65 Shopenup packages with the Ayurveda eCommerce application.

## 🚀 Quick Start

### 1. Initialize Shopenup in your app

```tsx
// In _app.tsx
import { ShopenupProvider } from '../lib/shopenup';

function MyApp({ Component, pageProps }) {
  return (
    <ShopenupProvider>
      <Component {...pageProps} />
    </ShopenupProvider>
  );
}
```

### 2. Use Shopenup services in components

```tsx
// In any component
import { useShopenup, getCartService, getPaymentService } from '../lib/shopenup';

function MyComponent() {
  const { isInitialized, isLoading } = useShopenup();
  
  const handleAddToCart = async () => {
    const cartService = await getCartService();
    await cartService.addToCart('cart-id', 'product-id', 1);
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (!isInitialized) return <div>Initializing...</div>;
  
  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

## 📦 Available Services

### Cart Service
```tsx
import { getCartService } from '../lib/shopenup';

const cartService = await getCartService();

// Create cart
const cart = await cartService.createCart('in', 'INR');

// Add item to cart
await cartService.addToCart(cartId, productId, quantity);

// Get cart
const cart = await cartService.getCart(cartId);

// Update item quantity
await cartService.updateCartItem(cartId, itemId, quantity);

// Remove item
await cartService.removeFromCart(cartId, itemId);

// Calculate totals
const totals = await cartService.calculateTotals(cartId);
```

### Payment Service
```tsx
import { getPaymentService } from '../lib/shopenup';

const paymentService = await getPaymentService();

// Create payment intent
const intent = await paymentService.createPaymentIntent({
  amount: 1000,
  currency: 'INR',
  customerId: 'customer-id'
});

// Process payment
const payment = await paymentService.processPayment(intentId);

// Get payment methods
const methods = await paymentService.getPaymentMethods(customerId);

// Save payment method
await paymentService.savePaymentMethod(customerId, {
  type: 'card',
  token: 'token'
});
```

### UI Components
```tsx
import { getUIComponents } from '../lib/shopenup';

const { Button, Input, Card, Badge, Spinner, Alert } = await getUIComponents();

// Use enhanced components
<Button variant="primary" loading={isLoading}>
  Submit
</Button>

<Input label="Email" leftIcon="MailIcon" />

<Card variant="elevated">
  <h3>Product Card</h3>
</Card>

<Badge variant="success">In Stock</Badge>

<Spinner size="lg" color="primary" />

<Alert variant="success" title="Success">
  Payment processed successfully!
</Alert>
```

## 🎨 Theme Configuration

The Shopenup UI components use a custom theme that matches the Ayurveda brand:

```tsx
// Theme colors
primary: {
  50: '#f0fdf4',   // Light green
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',  // Main green
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',  // Dark green
}
```

## 🔧 Configuration

### Environment Variables
```env
# Shopenup Configuration
NEXT_PUBLIC_SHOPENUP_ENV=development
NEXT_PUBLIC_DOMAIN=localhost:3000

# Payment Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Analytics Configuration
POSTHOG_API_KEY=your_posthog_key
```

### Module Configuration
The integration supports the following Shopenup modules:

#### Core eCommerce
- ✅ Product Management
- ✅ Inventory Management
- ✅ Order Processing
- ✅ Payment Processing
- ✅ Customer Management
- ✅ Cart Management
- ✅ Pricing & Currency
- ✅ Tax Calculation
- ✅ Fulfillment
- ✅ Sales Channels
- ✅ Store Management
- ✅ Region Management
- ✅ Stock Location
- ✅ Promotions

#### Infrastructure
- ✅ Authentication
- ✅ File Management
- ✅ Notifications
- ✅ Analytics
- ✅ Event Bus
- ✅ Caching
- ✅ Workflow Engine
- ✅ Locking

#### Providers
- ✅ Stripe Payments
- ✅ Local Notifications
- ✅ Local Analytics
- ✅ Local File Storage
- ✅ Email/Password Auth

## 📁 File Structure

```
src/lib/shopenup/
├── init.ts              # Main initialization
├── cart.ts              # Cart service integration
├── payment.ts           # Payment service integration
├── ui.tsx               # UI components integration
├── provider.tsx         # React context provider
├── index.ts             # Main exports
└── README.md            # This file
```

## 🔄 Migration Guide

### From Mock Data to Shopenup

#### Before (Mock Cart)
```tsx
const mockCartItems = [
  {
    id: '1',
    name: 'Product Name',
    price: 299,
    quantity: 2,
  }
];
```

#### After (Shopenup Cart)
```tsx
import { getCartService } from '../lib/shopenup';

const cartService = await getCartService();
const cart = await cartService.getCart(cartId);
const cartItems = cart.items;
```

### From Static UI to Shopenup UI

#### Before (Basic Button)
```tsx
<button className="bg-green-600 text-white px-4 py-2 rounded">
  Add to Cart
</button>
```

#### After (Shopenup Button)
```tsx
import { getUIComponents } from '../lib/shopenup';

const { Button } = await getUIComponents();

<Button variant="primary" icon="ShoppingCartIcon">
  Add to Cart
</Button>
```

## 🚨 Error Handling

All Shopenup services include comprehensive error handling:

```tsx
try {
  const cartService = await getCartService();
  await cartService.addToCart(cartId, productId, quantity);
} catch (error) {
  console.error('Failed to add item to cart:', error);
  // Handle error appropriately
}
```

## 🔍 Debugging

Enable debug logging:

```tsx
// In development
localStorage.setItem('shopenup-debug', 'true');

// Check initialization status
const { isInitialized, isLoading, error } = useShopenup();
```

## 📚 API Reference

### Cart Service Methods
- `createCart(region, currency)` - Create new cart
- `getCart(cartId)` - Get cart by ID
- `addToCart(cartId, productId, quantity)` - Add item
- `updateCartItem(cartId, itemId, quantity)` - Update quantity
- `removeFromCart(cartId, itemId)` - Remove item
- `calculateTotals(cartId)` - Calculate cart totals
- `applyDiscount(cartId, code)` - Apply discount
- `getCartCount(cartId)` - Get item count
- `isCartEmpty(cartId)` - Check if empty

### Payment Service Methods
- `createPaymentIntent(data)` - Create payment intent
- `processPayment(intentId, methodId)` - Process payment
- `confirmPayment(intentId)` - Confirm payment
- `cancelPayment(intentId)` - Cancel payment
- `refundPayment(intentId, amount, reason)` - Refund payment
- `getPaymentMethods(customerId)` - Get saved methods
- `savePaymentMethod(customerId, data)` - Save method
- `validatePaymentMethod(data)` - Validate method

### UI Components
- `Button` - Enhanced button with variants
- `Input` - Input with icons and validation
- `Card` - Card with variants and shadows
- `Badge` - Badge with color variants
- `Spinner` - Loading spinner
- `Alert` - Alert with variants

## 🤝 Contributing

When adding new Shopenup integrations:

1. Create service file in `src/lib/shopenup/`
2. Add types and interfaces
3. Implement error handling
4. Add to main exports in `index.ts`
5. Update this README
6. Test with existing components

## 📞 Support

For Shopenup-specific issues:
- Check the [Shopenup documentation](https://docs.shopenup.com)
- Review package configuration in `config/packages.json`
- Verify all 65 packages are properly installed

For integration issues:
- Check initialization logs
- Verify environment variables
- Test with minimal example
