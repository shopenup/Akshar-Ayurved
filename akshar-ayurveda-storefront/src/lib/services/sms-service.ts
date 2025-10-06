

import { sdk } from '@lib/config';
import { getAuthHeaders } from '@lib/shopenup/cookies';

export interface SMSNotificationData {
  phone: string;
  template: string;
  data: Record<string, unknown>;
}

export interface OrderSMSData {
  order_id: string;
  customer_name?: string;
  total_amount?: number;
  currency?: string;
  estimated_delivery?: string;
  tracking_number?: string;
}

/**
 * Frontend SMS service for sending notifications
 * This service integrates with the existing Twilio backend through subscribers
 */
export class SMSService {
  private static instance: SMSService;

  private constructor() {
    // Using SDK client from config
  }

  /**
   * Get complete headers including auth and publishable API key
   */
  private async getCompleteHeaders(): Promise<Record<string, string>> {
    const authHeaders = await getAuthHeaders();
    const publishableKey = process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f';

    const headers = {
      ...authHeaders,
      'x-publishable-api-key': publishableKey,
      'Content-Type': 'application/json',
    };


    return headers;
  }

  /**
   * Test method to verify headers generation
   */
  async testHeaders(): Promise<Record<string, string>> {
    return await this.getCompleteHeaders();
  }

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /**
   * Send SMS notification using the backend Twilio service
   * This will trigger the subscriber system
   */
  async sendSMS(notification: SMSNotificationData): Promise<boolean> {
    try {
     

      // Use SDK client for backend calls, fallback to local API for development
      if (process.env.NODE_ENV === 'production') {
        // Try SDK client first, fallback to direct fetch if needed
        try {
          const headers = await this.getCompleteHeaders();

          await sdk.client.fetch('/store/notifications/sms', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: notification.phone,
              template: notification.template,
              data: notification.data,
              channel: 'sms'
            }),
          });
          return true;
        } catch (sdkError) {
          // Handle SDK error silently

          // Fallback to direct fetch with proper headers
          const backendUrl = process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL || 'http://localhost:9000';
          const headers = await this.getCompleteHeaders();

          const response = await fetch(`${backendUrl}/store/notifications/sms`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: notification.phone,
              template: notification.template,
              data: notification.data,
              channel: 'sms'
            }),
          });

          if (!response.ok) {
            throw new Error(`Backend SMS failed: ${response.status} - ${await response.text()}`);
          }

          await response.json();
          return true;
        }
      } else {
        // Use local API for development
        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: notification.phone,
            template: notification.template,
            data: notification.data,
            channel: 'sms'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to send SMS: ${response.status} - ${errorText}`);
        }

        await response.json();
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Send order confirmation SMS through subscriber system
   * This is the main method that will be called after order placement
   */
  async sendOrderConfirmationSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    try {
      // First, try to send through the subscriber system
      if (process.env.NODE_ENV === 'production') {
        // If using backend, trigger the subscriber
        try {
          const headers = await this.getCompleteHeaders();

          await sdk.client.fetch(`/store/orders/${orderData.order_id}/notify`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: 'order.placed',
              data: {
                id: orderData.order_id,
                customer: {
                  phone: phone
                },
                order: orderData
              }
            }),
          });
          return true;
        } catch (subscriberError) {
          // Handle subscriber error silently

          // Try direct fetch as fallback
          try {
            const backendUrl = process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL || 'http://localhost:9000';
            const headers = await this.getCompleteHeaders();

            const response = await fetch(`${backendUrl}/store/orders/${orderData.order_id}/notify`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                event: 'order.placed',
                data: {
                  id: orderData.order_id,
                  customer: {
                    phone: phone
                  },
                  order: orderData
                }
              }),
            });

            if (response.ok) {
              return true;
            } else {
              throw new Error(`Direct fetch failed: ${response.status}`);
            }
          } catch (directError) {
            // Handle direct fetch error silently
            // Final fallback to direct SMS sending
            return this.sendSMS({
              phone,
              template: 'order-confirmation-sms',
              data: { ...orderData } as Record<string, unknown>
            });
          }
        }
      }

      // Fallback to direct SMS sending
      return this.sendSMS({
        phone,
        template: 'order-confirmation-sms',
        data: { ...orderData } as Record<string, unknown>
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Send order shipped SMS
   */
  async sendOrderShippedSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'order-shipped-sms',
      data: { ...orderData } as Record<string, unknown>
    });
  }

  /**
   * Send order delivered SMS
   */
  async sendOrderDeliveredSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'order-delivered-sms',
      data: { ...orderData } as Record<string, unknown>
    });
  }

  /**
   * Send order cancelled SMS
   */
  async sendOrderCancelledSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'order-cancelled-sms',
      data: { ...orderData } as Record<string, unknown>
    });
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'payment-confirmation-sms',
      data: { ...orderData } as Record<string, unknown>
    });
  }

  /**
   * Send delivery reminder SMS
   */
  async sendDeliveryReminderSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'delivery-reminder-sms',
      data: { ...orderData } as Record<string, unknown>
    });
  }

  /**
   * Trigger subscriber event for order placement
   * This method directly triggers the subscriber system
   */
  async triggerOrderPlacedEvent(orderData: {
    id: string;
    customer: { phone: string; email: string; firstName: string; lastName: string };
    total: number;
    items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
    }>;
    status: string;
  }): Promise<boolean> {
    try {

      // Use SDK client for backend calls, fallback to direct SMS for development
      if (process.env.NODE_ENV === 'production') {
        try {
          // Send to subscriber system via SDK
          const headers = await this.getCompleteHeaders();

          await sdk.client.fetch('/store/events/order.placed', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: 'order.placed',
              data: {
                id: orderData.id,
                customer: {
                  phone: orderData.customer.phone,
                  email: orderData.customer.email,
                  first_name: orderData.customer.firstName,
                  last_name: orderData.customer.lastName
                },
                total: orderData.total,
                items: orderData.items,
                status: orderData.status
              }
            }),
          });

          return true;
        } catch (subscriberError) {
          // Handle subscriber error silently

          // Try direct fetch as fallback
          try {
            const backendUrl = process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL || 'http://localhost:9000';
            const headers = await this.getCompleteHeaders();

            const response = await fetch(`${backendUrl}/store/events/order.placed`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                event: 'order.placed',
                data: {
                  id: orderData.id,
                  customer: {
                    phone: orderData.customer.phone,
                    email: orderData.customer.email,
                    first_name: orderData.customer.firstName,
                    last_name: orderData.customer.lastName
                  },
                  total: orderData.total,
                  items: orderData.items,
                  status: orderData.status
                }
              }),
            });

            if (response.ok) {
              return true;
            } else {
              throw new Error(`Direct fetch failed: ${response.status}`);
            }
          } catch (directError) {
            // Handle direct fetch error silently
            // Final fallback to direct SMS
            return this.sendOrderConfirmationSMS(
              orderData.customer.phone,
              {
                order_id: orderData.id,
                customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
                total_amount: orderData.total,
                currency: 'INR'
              }
            );
          }
        }
      } else {
        // Development mode - use local API
        return this.sendOrderConfirmationSMS(
          orderData.customer.phone,
          {
            order_id: orderData.id,
            customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
            total_amount: orderData.total,
            currency: 'INR'
          }
        );
      }
    } catch (error) {
      // Handle error silently
      // Fallback to direct SMS
      return this.sendOrderConfirmationSMS(
        orderData.customer.phone,
        {
          order_id: orderData.id,
          customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
          total_amount: orderData.total,
          currency: 'INR'
        }
      );
    }
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance();

// Export individual functions for easier use
export const sendOrderConfirmationSMS = (phone: string, orderData: OrderSMSData) =>
  smsService.sendOrderConfirmationSMS(phone, orderData);

export const sendPaymentConfirmationSMS = (phone: string, orderData: OrderSMSData) =>
  smsService.sendPaymentConfirmationSMS(phone, orderData);

export const sendOrderShippedSMS = (phone: string, orderData: OrderSMSData) =>
  smsService.sendOrderShippedSMS(phone, orderData);

// Export the new subscriber trigger function
export const triggerOrderPlacedEvent = (orderData: {
  id: string;
  customer: { phone: string; email: string; firstName: string; lastName: string };
  total: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  status: string;
}) => smsService.triggerOrderPlacedEvent(orderData);

// Export test method for debugging
export const testSMSServiceHeaders = () => smsService.testHeaders();
