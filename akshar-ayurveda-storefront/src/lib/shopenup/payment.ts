import { getPaymentModule, getOrderModule, getCustomerModule } from "@lib/shopenup/init";

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
  private paymentModule!: unknown;
  private orderModule!: unknown;
  private customerModule!: unknown;

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

      this.paymentModule = null;
      this.orderModule = null;
      this.customerModule = null;
    }
  }

  private getPaymentModule(): {
    createPaymentIntent: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    processPayment: (intentId: string, args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    confirmPayment: (intentId: string) => Promise<Record<string, unknown>>;
    cancelPayment: (intentId: string) => Promise<Record<string, unknown>>;
    refundPayment: (intentId: string, args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    getPayment: (intentId: string) => Promise<Record<string, unknown>>;
    savePaymentMethod: (customerId: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    getPaymentMethods: (customerId: string) => Promise<Record<string, unknown>[]>;
    deletePaymentMethod: (customerId: string, methodId: string) => Promise<void>;
    setDefaultPaymentMethod: (customerId: string, methodId: string) => Promise<void>;
    validatePaymentMethod: (data: Record<string, unknown>) => Promise<{ is_valid: boolean }>;
    getPaymentHistory?: (customerId: string, args: { limit: number; offset: number }) => Promise<{ payments: unknown[]; total: number }>;
    getSupportedPaymentMethods?: (region: string) => Promise<unknown[]>;
  } {
    const mod = this.paymentModule as Record<string, unknown>;
    const requiredFns = [
      'createPaymentIntent',
      'processPayment',
      'confirmPayment',
      'cancelPayment',
      'refundPayment',
      'getPayment',
      'savePaymentMethod',
      'getPaymentMethods',
      'deletePaymentMethod',
      'setDefaultPaymentMethod',
      'validatePaymentMethod',
    ];
    for (const fn of requiredFns) {
      if (typeof mod?.[fn] !== 'function') {
        throw new Error('Payment module is not initialized correctly');
      }
    }
    return mod as unknown as ReturnType<ShopenupPaymentService['getPaymentModule']>;
  }

  private isOneOf<T extends readonly string[]>(list: T, value: string): value is T[number] {
    return (list as readonly string[]).includes(value);
  }

  private parsePaymentMethod(obj: unknown): PaymentMethod | undefined {
    if (!obj || typeof obj !== "object") return undefined;
    const r = obj as Record<string, unknown>;
    const allowed = ["card", "upi", "netbanking", "wallet"] as const;
    const rawType = String(r.type ?? "card");
    const type = (this.isOneOf(allowed, rawType) ? rawType : "card");
    return {
      id: String(r.id ?? ""),
      type,
      brand: r.brand != null ? String(r.brand) : undefined,
      last4: r.last4 != null ? String(r.last4) : undefined,
      expiryMonth: typeof r.expiry_month === "number" ? r.expiry_month : undefined,
      expiryYear: typeof r.expiry_year === "number" ? r.expiry_year : undefined,
      isDefault: Boolean(r.is_default),
    };
  }

  private parsePaymentIntent(obj: unknown): PaymentIntent {
    const r = (obj ?? {}) as Record<string, unknown>;
    const statusAllowed = ["pending", "processing", "succeeded", "failed", "canceled"] as const;
    const rawStatus = String(r.status ?? "pending");
    const status = (this.isOneOf(statusAllowed, rawStatus) ? rawStatus : "pending");
    return {
      id: String(r.id ?? ""),
      amount: typeof r.amount === "number" ? r.amount : 0,
      currency: String(r.currency ?? "inr"),
      status,
      paymentMethod: this.parsePaymentMethod(r.payment_method),
      clientSecret: r.client_secret != null ? String(r.client_secret) : undefined,
      createdAt: new Date(String(r.created_at ?? new Date().toISOString())),
      updatedAt: new Date(String(r.updated_at ?? new Date().toISOString())),
    };
  }

  // Create payment intent
  async createPaymentIntent(paymentData: PaymentData): Promise<PaymentIntent> {
    try {
      const pm = this.getPaymentModule();
      const intentData = await pm.createPaymentIntent({
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method_id: paymentData.paymentMethodId,
        customer_id: paymentData.customerId,
        order_id: paymentData.orderId,
        description: paymentData.description,
        metadata: paymentData.metadata,
      });

      return this.parsePaymentIntent(intentData);
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
      const pm = this.getPaymentModule();
      const paymentData = await pm.processPayment(
        paymentIntentId,
        {
          payment_method_id: paymentMethodId,
        }
      );

      return this.parsePaymentIntent(paymentData);
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const pm = this.getPaymentModule();
      const paymentData = await pm.confirmPayment(
        paymentIntentId
      );
      return this.parsePaymentIntent(paymentData);
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const pm = this.getPaymentModule();
      const paymentData = await pm.cancelPayment(
        paymentIntentId
      );
      return this.parsePaymentIntent(paymentData);
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
      const pm = this.getPaymentModule();
      const refundData = await pm.refundPayment(
        paymentIntentId,
        {
          amount,
          reason,
        }
      );

      const r = refundData as Record<string, unknown>;
      return {
        id: String(r.id ?? ""),
        amount: typeof r.amount === "number" ? r.amount : Number(r.amount ?? 0),
        currency: String(r.currency ?? "inr"),
        status: String(r.status ?? "pending"),
        reason: r.reason != null ? String(r.reason) : undefined,
      };
    } catch (error) {
      console.error("Failed to refund payment:", error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    try {
      const pm = this.getPaymentModule();
      const paymentData = await pm.getPayment(paymentIntentId);
      return String((paymentData as Record<string, unknown>).status ?? "pending");
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
      const pm = this.getPaymentModule();
      const paymentMethod = await pm.savePaymentMethod(
        customerId,
        paymentMethodData
      );

      const parsed = this.parsePaymentMethod(paymentMethod);
      if (!parsed) {
        throw new Error("Invalid payment method returned by module");
      }
      return parsed;
    } catch (error) {
      console.error("Failed to save payment method:", error);
      throw error;
    }
  }

  // Get customer payment methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const pm = this.getPaymentModule();
      const paymentMethods = await pm.getPaymentMethods(
        customerId
      );

      return paymentMethods.map((method: unknown) => {
        const parsed = this.parsePaymentMethod(method);
        return parsed ?? { id: "", type: "card", isDefault: false };
      });
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
      const pm = this.getPaymentModule();
      await pm.deletePaymentMethod(customerId, paymentMethodId);
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
      const pm = this.getPaymentModule();
      await pm.setDefaultPaymentMethod(
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
      const paymentModule = this.paymentModule as Record<string, unknown>;
      const getPaymentHistory = paymentModule.getPaymentHistory as
        | ((customerId: string, args: { limit: number; offset: number }) => Promise<{ payments: unknown[]; total: number }>)
        | undefined;

      if (!getPaymentHistory) {
        throw new Error("Payment module is not initialized correctly");
      }

      const history = await getPaymentHistory(customerId, {
        limit,
        offset,
      });

      return {
        payments: (history.payments as unknown[]).map((payment: unknown) => {
          const p = payment as Record<string, unknown>;

          const parsePaymentMethod = (obj: unknown): PaymentMethod | undefined => {
            if (!obj || typeof obj !== "object") return undefined;
            const r = obj as Record<string, unknown>;
            const typeStr = String(r.type ?? "card");
            const allowed = ["card", "upi", "netbanking", "wallet"] as const;
            const safeType = (this.isOneOf(allowed, typeStr) ? typeStr : "card");
            const last4 = r.last4 != null ? String(r.last4) : undefined;
            const expMonth = typeof r.expiry_month === "number" ? r.expiry_month : undefined;
            const expYear = typeof r.expiry_year === "number" ? r.expiry_year : undefined;
            const isDefault = Boolean(r.is_default);
            return {
              id: String(r.id ?? ""),
              type: safeType,
              brand: r.brand != null ? String(r.brand) : undefined,
              last4,
              expiryMonth: expMonth,
              expiryYear: expYear,
              isDefault,
            };
          };

          return {
            id: String(p.id ?? ""),
            amount: typeof p.amount === "number" ? p.amount : 0,
            currency: String(p.currency ?? "inr"),
            status: String(p.status ?? "pending") as PaymentIntent["status"],
            paymentMethod: parsePaymentMethod(p.payment_method),
            createdAt: new Date(String(p.created_at ?? new Date().toISOString())),
            updatedAt: new Date(String(p.updated_at ?? new Date().toISOString())),
          };
        }),
        total: Number((history as { total?: number }).total ?? 0),
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
      const pm = this.getPaymentModule();
      const validation = await pm.validatePaymentMethod(
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
      id: string;
      type: string;
      name: string;
      description: string;
      icon: string;
      enabled: boolean;
    }[]
  > {
    try {
      const paymentModule = this.paymentModule as Record<string, unknown>;
      const getSupportedPaymentMethods = paymentModule.getSupportedPaymentMethods as
        | ((region: string) => Promise<unknown[]>)
        | undefined;

      if (!getSupportedPaymentMethods) {
        throw new Error("Payment module is not initialized correctly");
      }

      const methods = await getSupportedPaymentMethods(region);

      return (methods as unknown[]).map((method: unknown) => {
        const m = method as Record<string, unknown>;
        return {
          id: String(m.id ?? m.type ?? ""),
          type: String(m.type ?? ""),
          name: String(m.name ?? ""),
          description: String(m.description ?? ""),
          icon: String(m.icon ?? ""),
          enabled: Boolean(m.enabled),
        };
      });
    } catch (error) {
      console.error("Failed to get supported payment methods:", error);
      // Return default payment methods
      return this.getDefaultPaymentMethods();
    }
  }
  private getDefaultPaymentMethods() {
    return [
      // {
      //   id: "pp_stripe_stripe",
      //   type: "pp_stripe_stripe",
      //   name: "Credit Card",
      //   description: "Pay with Visa, Mastercard, or other cards",
      //   icon: "credit-card",
      //   enabled: true,
      // },
      // {
      //   id: "pp_razorpay_razorpay",
      //   type: "pp_razorpay_razorpay",
      //   name: "Razorpay",
      //   description: "Pay using Razorpay payment gateway",
      //   icon: "credit-card",
      //   enabled: true,
      // },
      // {
      //   id: "pp_system_default",
      //   type: "pp_system_default",
      //   name: "Manual Payment",
      //   description: "Manual payment for testing purposes",
      //   icon: "manual",
      //   enabled: true,
      // }
    ];
  }
}



// Export singleton instance
export const paymentService = new ShopenupPaymentService();

// Export individual functions for backward compatibility
export const listCartPaymentMethods = async (regionId: string) => {
  try {
    const res = await (await import("@lib/config")).sdk.client
      .fetch<import("@shopenup/types").HttpTypes.StorePaymentProviderListResponse>(
        `/store/payment-providers`,
        {
          query: { region_id: regionId },
          next: { tags: ["payment_providers"] },
          cache: "no-cache",
        }
      )
      .then(({ payment_providers }) => payment_providers)
      .catch(() => [])

    return res
  } catch (error) {
    console.error('Failed to get cart payment methods:', error)
    return []
  }
};
