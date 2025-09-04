"use client";

import { sdk } from "@lib/config";
import { getAuthHeaders, getCartId, removeCartId } from "@lib/shopenup/cookies";
import { HttpTypes } from "@shopenup/types";

// Client-side order interfaces
export interface OrderAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  company?: string;
  address_2?: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  variant_id: string | null;
  thumbnail?: string | null;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  currency_code: string;
  email: string;
  billing_address: OrderAddress;
  shipping_address: OrderAddress;
  items: OrderItem[];
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderData {
  email: string;
  billing_address: OrderAddress;
  shipping_address: OrderAddress;
  items?: Array<{
    variant_id: string;
    quantity: number;
  }>;
  payment_method: string;
  shipping_method: string;
  currency_code?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new order in the backend
 */
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  try {
    // Get the current cart ID
    const cartId = await getCartId();
    if (!cartId) {
      throw new Error("No cart found. Please add items to cart first.");
    }

    // First, set the addresses and email on the cart
    await sdk.store.cart.update(
      cartId,
      {
        email: orderData.email,
        billing_address: orderData.billing_address,
        shipping_address: orderData.shipping_address,
      },
      {},
      await getAuthHeaders()
    );

    // Use the proper Shopenup SDK method to complete the cart and create an order
    const cartRes = await sdk.store.cart.complete(
      cartId,
      {},
      await getAuthHeaders()
    );

    if (cartRes?.type !== "order") {
      throw new Error("Failed to create order from cart");
    }

    const order = cartRes.order;

    // Remove the cart ID since it's now completed
    await removeCartId();

    return {
      id: order.id ?? '',
      status: order.status ?? 'pending',
      total: order.total ?? 0,
      currency_code: order.currency_code ?? 'inr',
      email: order.email ?? '',
      billing_address: {
        first_name: order.billing_address?.first_name ?? '',
        last_name: order.billing_address?.last_name ?? '',
        address_1: order.billing_address?.address_1 ?? '',
        city: order.billing_address?.city ?? '',
        province: order.billing_address?.province ?? '',
        postal_code: order.billing_address?.postal_code ?? '',
        country_code: order.billing_address?.country_code ?? 'in',
        company: order.billing_address?.company,
        address_2: order.billing_address?.address_2,
        phone: order.billing_address?.phone,
      },
      shipping_address: {
        first_name: order.shipping_address?.first_name ?? '',
        last_name: order.shipping_address?.last_name ?? '',
        address_1: order.shipping_address?.address_1 ?? '',
        city: order.shipping_address?.city ?? '',
        province: order.shipping_address?.province ?? '',
        postal_code: order.shipping_address?.postal_code ?? '',
        country_code: order.shipping_address?.country_code ?? 'in',
        company: order.shipping_address?.company,
        address_2: order.shipping_address?.address_2,
        phone: order.shipping_address?.phone,
      },
      items: (order.items ?? []).map(item => ({
        id: item.id ?? '',
        title: item.title ?? '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        variant_id: item.variant_id,
        thumbnail: item.thumbnail,
      })),
      payment_status: order.payment_status ?? 'pending',
      fulfillment_status: order.fulfillment_status ?? 'not_fulfilled',
      created_at: typeof order.created_at === 'string' ? order.created_at : new Date().toISOString(),
      updated_at: typeof order.updated_at === 'string' ? order.updated_at : new Date().toISOString(),
      metadata: order.metadata ?? {},
    };
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const headers = await getAuthHeaders();
    const { order } = await sdk.client.fetch<HttpTypes.StoreOrderResponse>(
      `/store/orders/${orderId}`,
      {
        method: 'GET',
        headers,
      }
    );
    
    return {
      id: order.id ?? '',
      status: order.status ?? 'pending',
      total: order.total ?? 0,
      currency_code: order.currency_code ?? 'inr',
      email: order.email ?? '',
      billing_address: {
        first_name: order.billing_address?.first_name ?? '',
        last_name: order.billing_address?.last_name ?? '',
        address_1: order.billing_address?.address_1 ?? '',
        city: order.billing_address?.city ?? '',
        province: order.billing_address?.province ?? '',
        postal_code: order.billing_address?.postal_code ?? '',
        country_code: order.billing_address?.country_code ?? 'in',
        company: order.billing_address?.company,
        address_2: order.billing_address?.address_2,
        phone: order.billing_address?.phone,
      },
      shipping_address: {
        first_name: order.shipping_address?.first_name ?? '',
        last_name: order.shipping_address?.last_name ?? '',
        address_1: order.shipping_address?.address_1 ?? '',
        city: order.shipping_address?.city ?? '',
        province: order.shipping_address?.province ?? '',
        postal_code: order.shipping_address?.postal_code ?? '',
        country_code: order.shipping_address?.country_code ?? 'in',
        company: order.shipping_address?.company,
        address_2: order.shipping_address?.address_2,
        phone: order.shipping_address?.phone,
      },
      items: (order.items ?? []).map(item => ({
        id: item.id ?? '',
        title: item.title ?? '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        variant_id: item.variant_id,
        thumbnail: item.thumbnail,
      })),
      payment_status: order.payment_status ?? 'pending',
      fulfillment_status: order.fulfillment_status ?? 'not_fulfilled',
      created_at: typeof order.created_at === 'string' ? order.created_at : new Date().toISOString(),
      updated_at: typeof order.updated_at === 'string' ? order.updated_at : new Date().toISOString(),
      metadata: order.metadata ?? {},
    };
  } catch (error) {
    console.error('Failed to get order:', error);
    return null;
  }
}

/**
 * List customer orders
 */
export async function listCustomerOrders(): Promise<Order[]> {
  try {
    const headers = await getAuthHeaders();
    const { orders } = await sdk.client.fetch<HttpTypes.StoreOrderListResponse>(
      '/store/orders',
      {
        method: 'GET',
        headers,
      }
    );
    
    return orders.map(order => ({
      id: order.id ?? '',
      status: order.status ?? 'pending',
      total: order.total ?? 0,
      currency_code: order.currency_code ?? 'inr',
      email: order.email ?? '',
      billing_address: {
        first_name: order.billing_address?.first_name ?? '',
        last_name: order.billing_address?.last_name ?? '',
        address_1: order.billing_address?.address_1 ?? '',
        city: order.billing_address?.city ?? '',
        province: order.billing_address?.province ?? '',
        postal_code: order.billing_address?.postal_code ?? '',
        country_code: order.billing_address?.country_code ?? 'in',
        company: order.billing_address?.company,
        address_2: order.billing_address?.address_2,
        phone: order.billing_address?.phone,
      },
      shipping_address: {
        first_name: order.shipping_address?.first_name ?? '',
        last_name: order.shipping_address?.last_name ?? '',
        address_1: order.shipping_address?.address_1 ?? '',
        city: order.shipping_address?.city ?? '',
        province: order.shipping_address?.province ?? '',
        postal_code: order.shipping_address?.postal_code ?? '',
        country_code: order.shipping_address?.country_code ?? 'in',
        company: order.shipping_address?.company,
        address_2: order.shipping_address?.address_2,
        phone: order.shipping_address?.phone,
      },
      items: (order.items ?? []).map(item => ({
        id: item.id ?? '',
        title: item.title ?? '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        variant_id: item.variant_id,
        thumbnail: item.thumbnail,
      })),
      payment_status: order.payment_status ?? 'pending',
      fulfillment_status: order.fulfillment_status ?? 'not_fulfilled',
      created_at: typeof order.created_at === 'string' ? order.created_at : new Date().toISOString(),
      updated_at: typeof order.updated_at === 'string' ? order.updated_at : new Date().toISOString(),
      metadata: order.metadata ?? {},
    }));
  } catch (error) {
    console.error('Failed to list customer orders:', error);
    return [];
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
  try {
    const headers = await getAuthHeaders();
    const { order } = await sdk.client.fetch<HttpTypes.StoreOrderResponse>(
      `/store/orders/${orderId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ status }),
      }
    );
    
    return {
      id: order.id ?? '',
      status: order.status ?? 'pending',
      total: order.total ?? 0,
      currency_code: order.currency_code ?? 'inr',
      email: order.email ?? '',
      billing_address: {
        first_name: order.billing_address?.first_name ?? '',
        last_name: order.billing_address?.last_name ?? '',
        address_1: order.billing_address?.address_1 ?? '',
        city: order.billing_address?.city ?? '',
        province: order.billing_address?.province ?? '',
        postal_code: order.billing_address?.postal_code ?? '',
        country_code: order.billing_address?.country_code ?? 'in',
        company: order.billing_address?.company,
        address_2: order.billing_address?.address_2,
        phone: order.billing_address?.phone,
      },
      shipping_address: {
        first_name: order.shipping_address?.first_name ?? '',
        last_name: order.shipping_address?.last_name ?? '',
        address_1: order.shipping_address?.address_1 ?? '',
        city: order.shipping_address?.city ?? '',
        province: order.shipping_address?.province ?? '',
        postal_code: order.shipping_address?.postal_code ?? '',
        country_code: order.shipping_address?.country_code ?? 'in',
        company: order.shipping_address?.company,
        address_2: order.shipping_address?.address_2,
        phone: order.shipping_address?.phone,
      },
      items: (order.items ?? []).map(item => ({
        id: item.id ?? '',
        title: item.title ?? '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        variant_id: item.variant_id,
        thumbnail: item.thumbnail,
      })),
      payment_status: order.payment_status ?? 'pending',
      fulfillment_status: order.fulfillment_status ?? 'not_fulfilled',
      created_at: typeof order.created_at === 'string' ? order.created_at : new Date().toISOString(),
      updated_at: typeof order.updated_at === 'string' ? order.updated_at : new Date().toISOString(),
      metadata: order.metadata ?? {},
    };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return null;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<Order | null> {
  try {
    const headers = await getAuthHeaders();
    const { order } = await sdk.client.fetch<HttpTypes.StoreOrderResponse>(
      `/store/orders/${orderId}/cancel`,
      {
        method: 'POST',
        headers,
      }
    );
    
    return {
      id: order.id ?? '',
      status: order.status ?? 'pending',
      total: order.total ?? 0,
      currency_code: order.currency_code ?? 'inr',
      email: order.email ?? '',
      billing_address: {
        first_name: order.billing_address?.first_name ?? '',
        last_name: order.billing_address?.last_name ?? '',
        address_1: order.billing_address?.address_1 ?? '',
        city: order.billing_address?.city ?? '',
        province: order.billing_address?.province ?? '',
        postal_code: order.billing_address?.postal_code ?? '',
        country_code: order.billing_address?.country_code ?? 'in',
        company: order.billing_address?.company,
        address_2: order.billing_address?.address_2,
        phone: order.billing_address?.phone,
      },
      shipping_address: {
        first_name: order.shipping_address?.first_name ?? '',
        last_name: order.shipping_address?.last_name ?? '',
        address_1: order.shipping_address?.address_1 ?? '',
        city: order.shipping_address?.city ?? '',
        province: order.shipping_address?.province ?? '',
        postal_code: order.shipping_address?.postal_code ?? '',
        country_code: order.shipping_address?.country_code ?? 'in',
        company: order.shipping_address?.company,
        address_2: order.shipping_address?.address_2,
        phone: order.shipping_address?.phone,
      },
      items: (order.items ?? []).map(item => ({
        id: item.id ?? '',
        title: item.title ?? '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        variant_id: item.variant_id,
        thumbnail: item.thumbnail,
      })),
      payment_status: order.payment_status ?? 'pending',
      fulfillment_status: order.fulfillment_status ?? 'not_fulfilled',
      created_at: typeof order.created_at === 'string' ? order.created_at : new Date().toISOString(),
      updated_at: typeof order.updated_at === 'string' ? order.updated_at : new Date().toISOString(),
      metadata: order.metadata ?? {},
    };
  } catch (error) {
    console.error('Failed to cancel order:', error);
    throw error;
  }
}

