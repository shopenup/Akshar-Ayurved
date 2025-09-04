import React, { useState, useEffect } from 'react';
import { getCartService, getPaymentService, getUIComponents } from '../../lib/shopenup';
import { ShopenupButton, ShopenupInput, ShopenupCard, ShopenupBadge, ShopenupSpinner, ShopenupAlert } from '../../lib/shopenup/ui';

// Types for demo purposes
interface CartService {
  createCart: (region: string, currency: string) => Promise<Cart>;
  addToCart: (cartId: string, productId: string, quantity: number) => Promise<Cart>;
}

interface PaymentService {
  createPaymentIntent: (data: PaymentData) => Promise<PaymentIntent>;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
}

export default function ShopenupDemo() {
  const [cartService, setCartService] = useState<CartService | null>(null);
  const [paymentService, setPaymentService] = useState<PaymentService | null>(null);
  const [uiComponents, setUIComponents] = useState<unknown>(null);
  const [demoCart, setDemoCart] = useState<Cart | null>(null);
  const [demoPayment, setDemoPayment] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        const cart = await getCartService();
        const payment = await getPaymentService();
        const ui = await getUIComponents();
        
        setCartService(cart as CartService);
        setPaymentService(payment as PaymentService);
        setUIComponents(ui);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  const handleCreateCart = async () => {
    if (!cartService) return;
    
    setLoading(true);
    try {
      const cart = await cartService.createCart('in', 'INR');
      setDemoCart(cart);
      setMessage('Cart created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Failed to create cart: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!cartService || !demoCart) return;
    
    setLoading(true);
    try {
      const updatedCart = await cartService.addToCart(demoCart.id, 'demo-product-1', 1);
      setDemoCart(updatedCart);
      setMessage('Item added to cart!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Failed to add item: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentService) return;
    
    setLoading(true);
    try {
      const payment = await paymentService.createPaymentIntent({
        amount: 1000,
        currency: 'INR',
        description: 'Demo payment'
      });
      setDemoPayment(payment);
      setMessage('Payment intent created!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Failed to create payment: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ShopenupSpinner size="xl" color="primary" />
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <ShopenupAlert variant="warning" title="Not Initialized">
        Shopenup is not initialized yet.
      </ShopenupAlert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shopenup Integration Demo
        </h1>
        <p className="text-gray-600">
          This demonstrates the integration of all 65 Shopenup packages with the Ayurveda eCommerce application.
        </p>
      </div>

      {message && (
        <ShopenupAlert 
          variant={message.includes('Failed') ? 'error' : 'success'}
          onClose={() => setMessage('')}
        >
          {message}
        </ShopenupAlert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cart Service Demo */}
        <ShopenupCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cart Service</h2>
            <ShopenupBadge variant="primary">Active</ShopenupBadge>
          </div>
          
          <div className="space-y-4">
            <ShopenupButton 
              onClick={handleCreateCart}
              loading={loading}
              disabled={!cartService}
              icon="ShoppingCartIcon"
              fullWidth
            >
              Create Cart
            </ShopenupButton>
            
            <ShopenupButton 
              onClick={handleAddToCart}
              loading={loading}
              disabled={!cartService || !demoCart}
              variant="outline"
              icon="PlusIcon"
              fullWidth
            >
              Add Demo Item
            </ShopenupButton>
            
            {demoCart && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Current Cart:</h3>
                <p className="text-sm text-gray-600">ID: {demoCart.id}</p>
                <p className="text-sm text-gray-600">Items: {demoCart.items.length}</p>
                <p className="text-sm text-gray-600">Total: ₹{demoCart.total}</p>
              </div>
            )}
          </div>
        </ShopenupCard>

        {/* Payment Service Demo */}
        <ShopenupCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Payment Service</h2>
            <ShopenupBadge variant="success">Ready</ShopenupBadge>
          </div>
          
          <div className="space-y-4">
            <ShopenupButton 
              onClick={handleCreatePayment}
              loading={loading}
              disabled={!paymentService}
              icon="CreditCardIcon"
              fullWidth
            >
              Create Payment Intent
            </ShopenupButton>
            
            {demoPayment && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Payment Intent:</h3>
                <p className="text-sm text-gray-600">ID: {demoPayment.id}</p>
                <p className="text-sm text-gray-600">Amount: ₹{demoPayment.amount}</p>
                <p className="text-sm text-gray-600">Status: {demoPayment.status}</p>
              </div>
            )}
          </div>
        </ShopenupCard>
      </div>

      {/* UI Components Demo */}
      <ShopenupCard variant="elevated">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">UI Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Buttons</h3>
            <div className="space-y-2">
              <ShopenupButton size="sm" variant="primary">Primary</ShopenupButton>
              <ShopenupButton size="sm" variant="secondary">Secondary</ShopenupButton>
              <ShopenupButton size="sm" variant="outline">Outline</ShopenupButton>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Inputs</h3>
            <div className="space-y-2">
              <ShopenupInput placeholder="Enter text..." />
              <ShopenupInput leftIcon="MailIcon" placeholder="Email" />
              <ShopenupInput rightIcon="EyeIcon" placeholder="Password" type="password" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Badges</h3>
            <div className="space-y-2">
              <ShopenupBadge variant="primary">Primary</ShopenupBadge>
              <ShopenupBadge variant="success">Success</ShopenupBadge>
              <ShopenupBadge variant="warning">Warning</ShopenupBadge>
              <ShopenupBadge variant="error">Error</ShopenupBadge>
            </div>
          </div>
        </div>
      </ShopenupCard>

      {/* Service Status */}
      <ShopenupCard variant="outline">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <ShopenupBadge variant={cartService ? 'success' : 'error'}>
              {cartService ? 'Active' : 'Inactive'}
            </ShopenupBadge>
            <p className="text-sm text-gray-600 mt-1">Cart Service</p>
          </div>
          
          <div className="text-center">
            <ShopenupBadge variant={paymentService ? 'success' : 'error'}>
              {paymentService ? 'Active' : 'Inactive'}
            </ShopenupBadge>
            <p className="text-sm text-gray-600 mt-1">Payment Service</p>
          </div>
          
          <div className="text-center">
            <ShopenupBadge variant={uiComponents ? 'success' : 'error'}>
              {uiComponents ? 'Active' : 'Inactive'}
            </ShopenupBadge>
            <p className="text-sm text-gray-600 mt-1">UI Components</p>
          </div>
          
          <div className="text-center">
            <ShopenupBadge variant="success">Ready</ShopenupBadge>
            <p className="text-sm text-gray-600 mt-1">Integration</p>
          </div>
        </div>
      </ShopenupCard>
    </div>
  );
}
