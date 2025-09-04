import { getPaymentModule, getOrderModule, getCustomerModule } from "./init";

export interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "netbanking" | "wallet";
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "canceled";
  paymentMethod?: PaymentMethod;
  clientSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  customerId?: string;
  orderId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class ShopenupPaymentService {
  private paymentModule!: any;
  private orderModule!: any;
  private customerModule!: any;

  constructor() {
    this.initializeModules();
  }

  private async initializeModules() {
    try {
      this.paymentModule = await getPaymentModule();
      this.orderModule = await getOrderModule();
      this.customerModule = await getCustomerModule();
    } catch (error) {
      console.error("Failed to initialize payment modules:", error);
    }
  }

  // Create payment intent
  async createPaymentIntent(paymentData: PaymentData): Promise<PaymentIntent> {
    try {
      const intentData = await this.paymentModule.createPaymentIntent({
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method_id: paymentData.paymentMethodId,
        customer_id: paymentData.customerId,
        order_id: paymentData.orderId,
        description: paymentData.description,
        metadata: paymentData.metadata,
      });

      return {
        id: intentData.id,
        amount: intentData.amount,
        currency: intentData.currency,
        status: intentData.status,
        clientSecret: intentData.client_secret,
        createdAt: new Date(intentData.created_at),
        updatedAt: new Date(intentData.updated_at),
      };
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      throw error;
    }
  }

  // Process payment
  async processPayment(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<PaymentIntent> {
    try {
      const paymentData = await this.paymentModule.processPayment(
        paymentIntentId,
        {
          payment_method_id: paymentMethodId,
        }
      );

      return {
        id: paymentData.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        paymentMethod: paymentData.payment_method
          ? {
              id: paymentData.payment_method.id,
              type: paymentData.payment_method.type,
              brand: paymentData.payment_method.brand,
              last4: paymentData.payment_method.last4,
              expiryMonth: paymentData.payment_method.expiry_month,
              expiryYear: paymentData.payment_method.expiry_year,
              isDefault: paymentData.payment_method.is_default,
            }
          : undefined,
        createdAt: new Date(paymentData.created_at),
        updatedAt: new Date(paymentData.updated_at),
      };
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentData = await this.paymentModule.confirmPayment(
        paymentIntentId
      );

      return {
        id: paymentData.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        paymentMethod: paymentData.payment_method
          ? {
              id: paymentData.payment_method.id,
              type: paymentData.payment_method.type,
              brand: paymentData.payment_method.brand,
              last4: paymentData.payment_method.last4,
              expiryMonth: paymentData.payment_method.expiry_month,
              expiryYear: paymentData.payment_method.expiry_year,
              isDefault: paymentData.payment_method.is_default,
            }
          : undefined,
        createdAt: new Date(paymentData.created_at),
        updatedAt: new Date(paymentData.updated_at),
      };
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentData = await this.paymentModule.cancelPayment(
        paymentIntentId
      );

      return {
        id: paymentData.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        createdAt: new Date(paymentData.created_at),
        updatedAt: new Date(paymentData.updated_at),
      };
    } catch (error) {
      console.error("Failed to cancel payment:", error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    reason?: string;
  }> {
    try {
      const refundData = await this.paymentModule.refundPayment(
        paymentIntentId,
        {
          amount,
          reason,
        }
      );

      return {
        id: refundData.id,
        amount: refundData.amount,
        currency: refundData.currency,
        status: refundData.status,
        reason: refundData.reason,
      };
    } catch (error) {
      console.error("Failed to refund payment:", error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    try {
      const paymentData = await this.paymentModule.getPayment(paymentIntentId);
      return paymentData.status;
    } catch (error) {
      console.error("Failed to get payment status:", error);
      throw error;
    }
  }

  // Save payment method
  async savePaymentMethod(
    customerId: string,
    paymentMethodData: {
      type: string;
      token: string;
      isDefault?: boolean;
    }
  ): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.paymentModule.savePaymentMethod(
        customerId,
        paymentMethodData
      );

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        brand: paymentMethod.brand,
        last4: paymentMethod.last4,
        expiryMonth: paymentMethod.expiry_month,
        expiryYear: paymentMethod.expiry_year,
        isDefault: paymentMethod.is_default,
      };
    } catch (error) {
      console.error("Failed to save payment method:", error);
      throw error;
    }
  }

  // Get customer payment methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.paymentModule.getPaymentMethods(
        customerId
      );

      return paymentMethods.map((method: Record<string, unknown>) => ({
        id: method.id,
        type: method.type,
        brand: method.brand,
        last4: method.last4,
        expiryMonth: method.expiry_month,
        expiryYear: method.expiry_year,
        isDefault: method.is_default,
      }));
    } catch (error) {
      console.error("Failed to get payment methods:", error);
      throw error;
    }
  }

  // Delete payment method
  async deletePaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      await this.paymentModule.deletePaymentMethod(customerId, paymentMethodId);
    } catch (error) {
      console.error("Failed to delete payment method:", error);
      throw error;
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      await this.paymentModule.setDefaultPaymentMethod(
        customerId,
        paymentMethodId
      );
    } catch (error) {
      console.error("Failed to set default payment method:", error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(
    customerId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    payments: PaymentIntent[];
    total: number;
  }> {
    try {
      const history = await this.paymentModule.getPaymentHistory(customerId, {
        limit,
        offset,
      });

      return {
        payments: history.payments.map((payment: Record<string, unknown>) => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.payment_method
            ? {
                id: (payment.payment_method as any).id,
                type: (payment.payment_method as any).type,
                brand: (payment.payment_method as any).brand,
                last4: (payment.payment_method as any).last4 || '',
                expiryMonth: (payment.payment_method as any).expiry_month,
                expiryYear: (payment.payment_method as any).expiry_year,
                isDefault: (payment.payment_method as any).is_default,
              }
            : undefined,
          createdAt: new Date(payment.created_at as string),
          updatedAt: new Date(payment.updated_at as string),
        })),
        total: history.total,
      };
    } catch (error) {
      console.error("Failed to get payment history:", error);
      throw error;
    }
  }

  // Validate payment method
  async validatePaymentMethod(paymentMethodData: {
    type: string;
    number?: string;
    expMonth?: number;
    expYear?: number;
    cvc?: string;
  }): Promise<boolean> {
    try {
      const validation = await this.paymentModule.validatePaymentMethod(
        paymentMethodData
      );
      return validation.is_valid;
    } catch (error) {
      console.error("Failed to validate payment method:", error);
      return false;
    }
  }

  // Get supported payment methods
  async getSupportedPaymentMethods(region: string = "IN"): Promise<
    {
      id: any;
      type: string;
      name: string;
      description: string;
      icon: string;
      enabled: boolean;
    }[]
  > {
    try {
      const methods = await this.paymentModule.getSupportedPaymentMethods(
        region
      );

      return methods.map((method: Record<string, unknown>) => ({
        type: method.type,
        name: method.name,
        description: method.description,
        icon: method.icon,
        enabled: method.enabled,
      }));
    } catch (error) {
      console.error("Failed to get supported payment methods:", error);
      // Return default payment methods
      return [
        {
          id: "card",
          type: "card",
          name: "Credit/Debit Card",
          description: "Pay with Visa, Mastercard, or other cards",
          icon: "credit-card",
          enabled: true,
        },
        {
          id: "upi",
          type: "upi",
          name: "UPI",
          description: "Pay using UPI apps like Google Pay, PhonePe",
          icon: "mobile",
          enabled: true,
        }
      ];
    }
  }
}

// Export singleton instance
export const paymentService = new ShopenupPaymentService();

// Export individual functions for backward compatibility
export const listCartPaymentMethods = async (regionId: string) => {
  try {
    const methods = await paymentService.getSupportedPaymentMethods(regionId);
    return methods;
  } catch (error) {
    console.error('Failed to get cart payment methods:', error);
    return [];
  }
};
