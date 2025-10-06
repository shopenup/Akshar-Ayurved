// Main Shopenup integration exports
export * from './init';
export * from './cart';
export * from './payment';
export * from './ui';

// Re-export core services for easy access
export * from './cart';
export * from './payment';
export * from './product';
export { initializeShopenupUI, shopenupUIComponents } from './ui';  

// Export types for use in components
export type { PaymentIntent, PaymentMethod, PaymentData } from './payment';
export type { ShopenupUIComponents } from './ui';
export type { Product, ProductVariant, ProductCategory, ProductCollection, ProductFilter, ProductSearchParams } from './product';

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
    } catch (error) {
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
  return await import('./cart');
}

export async function getPaymentService() {
  return await import('./payment');
}

export async function getProductService() {
  const { productService } = await import('./product');
  return productService;
}

export async function getUIComponents() {
  const { shopenupUIComponents } = await import('./ui');
  return shopenupUIComponents;
}

// Export for use in _app.tsx
export { default as ShopenupProvider } from './provider';
