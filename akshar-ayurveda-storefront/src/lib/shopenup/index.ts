// Main Shopenup integration exports
export * from './init';
export * from './cart';
export * from './payment';
export * from './ui';

// Re-export core services for easy access
export { cartService } from './cart';
export { paymentService } from './payment';
export { productService } from './product';
export { initializeShopenupUI, shopenupUIComponents } from './ui';

// Export types for use in components
export type { Cart, CartItem } from './cart';
export type { PaymentIntent, PaymentMethod, PaymentData } from './payment';
export type { ShopenupUIComponents } from './ui';

// Main integration class
export class ShopenupIntegration {
  private static instance: ShopenupIntegration;
  private initialized = false;

  private constructor() {}

  static getInstance(): ShopenupIntegration {
    if (!ShopenupIntegration.instance) {
      ShopenupIntegration.instance = new ShopenupIntegration();
    }
    return ShopenupIntegration.instance;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize Shopenup framework
      await import('./init').then(({ getShopenupApp }) => getShopenupApp());
      
      // Initialize UI components
      await import('./ui').then(({ initializeShopenupUI }) => initializeShopenupUI());
      
      this.initialized = true;
      console.log('Shopenup integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Shopenup integration:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const shopenupIntegration = ShopenupIntegration.getInstance();

// Convenience functions for common operations
export async function initializeShopenup() {
  return shopenupIntegration.initialize();
}

export async function getCartService() {
  const { cartService } = await import('./cart');
  return cartService;
}

export async function getPaymentService() {
  const { paymentService } = await import('./payment');
  return paymentService;
}

export async function getUIComponents() {
  const { shopenupUIComponents } = await import('./ui');
  return shopenupUIComponents;
}

// Export for use in _app.tsx
export { default as ShopenupProvider } from './provider';
