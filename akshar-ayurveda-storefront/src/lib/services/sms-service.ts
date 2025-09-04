

import { sdk } from '@lib/config';
import { getAuthHeaders } from '@lib/shopenup/cookies';

export interface SMSNotificationData {
  phone: string;
  template: string;
  data: Record<string, any>;
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
    
    console.log('🔑 Generated headers:', {
      authHeaders,
      publishableKey,
      finalHeaders: headers,
      envVars: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY,
        NEXT_PUBLIC_SHOPENUP_BACKEND_URL: process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL
      }
    });
    
    return headers;
  }

  /**
   * Test method to verify headers generation
   */
  async testHeaders(): Promise<Record<string, string>> {
    console.log('🧪 Testing headers generation...');
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
      console.log('🚀 Attempting to send SMS:', {
        to: notification.phone,
        template: notification.template,
        data: notification.data
      });

      // Use SDK client for backend calls, fallback to local API for development
      if (process.env.NODE_ENV === 'production') {
        // Try SDK client first, fallback to direct fetch if needed
        try {
          const headers = await this.getCompleteHeaders();
          console.log('📡 Making SDK call to /store/notifications/sms with headers:', headers);
          
          const result = await sdk.client.fetch('/store/notifications/sms', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: notification.phone,
              template: notification.template,
              data: notification.data,
              channel: 'sms'
            }),
          });
          console.log('✅ SMS sent successfully via SDK:', result);
          return true;
        } catch (sdkError) {
          console.warn('⚠️ SDK client failed, falling back to direct fetch:', sdkError);
          
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
          
          const result = await response.json();
          console.log('✅ SMS sent successfully via direct fetch:', result);
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

        const result = await response.json();
        console.log('✅ SMS sent successfully via local API:', result);
        return true;
      }
    } catch (error) {
      console.error('❌ Error sending SMS:', error);
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
          console.log('📡 Making SDK call to /store/orders/notify with headers:', headers);
          
          const result = await sdk.client.fetch(`/store/orders/${orderData.order_id}/notify`, {
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
          console.log('✅ Order notification sent through subscriber system via SDK');
          return true;
        } catch (subscriberError) {
          console.warn('⚠️ SDK subscriber failed, trying direct fetch:', subscriberError);
          
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
              console.log('✅ Order notification sent through direct fetch');
              return true;
            } else {
              throw new Error(`Direct fetch failed: ${response.status}`);
            }
          } catch (directError) {
            console.warn('⚠️ Direct fetch also failed, falling back to SMS:', directError);
            // Final fallback to direct SMS sending
            return this.sendSMS({
              phone,
              template: 'order-confirmation-sms',
              data: orderData
            });
          }
        }
      }

      // Fallback to direct SMS sending
      return this.sendSMS({
        phone,
        template: 'order-confirmation-sms',
        data: orderData
      });
    } catch (error) {
      console.error('❌ Error sending order confirmation SMS:', error);
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
      data: orderData
    });
  }

  /**
   * Send order delivered SMS
   */
  async sendOrderDeliveredSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'order-delivered-sms',
      data: orderData
    });
  }

  /**
   * Send order cancelled SMS
   */
  async sendOrderCancelledSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'order-cancelled-sms',
      data: orderData
    });
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'payment-confirmation-sms',
      data: orderData
    });
  }

  /**
   * Send delivery reminder SMS
   */
  async sendDeliveryReminderSMS(phone: string, orderData: OrderSMSData): Promise<boolean> {
    return this.sendSMS({
      phone,
      template: 'delivery-reminder-sms',
      data: orderData
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
    items: any[];
    status: string;
  }): Promise<boolean> {
    try {
      console.log('🎯 Triggering order.placed event for subscriber:', orderData);

      // Use SDK client for backend calls, fallback to direct SMS for development
      if (process.env.NODE_ENV === 'production') {
        try {
          // Send to subscriber system via SDK
          const headers = await this.getCompleteHeaders();
          console.log('📡 Making SDK call to /store/events/order.placed with headers:', headers);
          
          const result = await sdk.client.fetch('/store/events/order.placed', {
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

          console.log('✅ Order placed event triggered successfully via SDK');
          return true;
        } catch (subscriberError) {
          console.warn('⚠️ SDK failed, trying direct fetch:', subscriberError);
          
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
              console.log('✅ Order placed event triggered successfully via direct fetch');
              return true;
            } else {
              throw new Error(`Direct fetch failed: ${response.status}`);
            }
          } catch (directError) {
            console.warn('⚠️ Direct fetch also failed, falling back to SMS:', directError);
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
        console.log('🔄 Development mode: Using local SMS API');
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
      console.error('❌ Error triggering order placed event:', error);
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
  items: any[];
  status: string;
}) => smsService.triggerOrderPlacedEvent(orderData);

// Export test method for debugging
export const testSMSServiceHeaders = () => smsService.testHeaders();
