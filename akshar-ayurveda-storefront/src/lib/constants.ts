/**
 * Payment provider identification constants
 */

export const isManual = (providerId?: string) => providerId === "manual";
export const isPaypal = (providerId?: string) => providerId === "paypal";
export const isStripe = (providerId?: string) => providerId === "stripe";
export const isRazorpay = (providerId?: string) => providerId === "razorpay";


