// Payment Gateway Configuration
export const PAYMENT_CONFIG = {
  razorpay: {
    key: process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] || '',
    secret: process.env['RAZORPAY_KEY_SECRET'] || '',
    currency: 'INR',
    name: 'ShopenUp Ayurveda',
    description: 'Ayurvedic Medicines & Wellness Products',
    image: '/logo.png',
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    notes: {
      address: 'ShopenUp Ayurveda Office'
    },
    theme: {
      color: '#059669'
    }
  }
} as const;

// Type definitions for better type safety
export type ShippingZone = keyof typeof SHIPPING_CONFIG.zones;
export type ShippingService = 'standard' | 'express' | 'premium';

export interface ShippingResult {
  cost: number;
  method: string;
  estimatedDays: string;
  isFree: boolean;
}

// Shipping Configuration
export const SHIPPING_CONFIG = {
  // Free shipping threshold
  freeShippingThreshold: 999, // INR
  
  // Shipping rates
  rates: {
    standard: {
      name: 'Standard Delivery',
      price: 99,
      estimatedDays: '3-5 business days',
      description: 'Regular delivery service'
    },
    express: {
      name: 'Express Delivery',
      price: 199,
      estimatedDays: '1-2 business days',
      description: 'Fast delivery service'
    },
    premium: {
      name: 'Premium Delivery',
      price: 299,
      estimatedDays: 'Same day delivery',
      description: 'Premium same day delivery (Mumbai only)'
    }
  },

  // Shipping zones
  zones: {
    mumbai: {
      name: 'Mumbai',
      standardPrice: 49,
      expressPrice: 99,
      premiumPrice: 199,
      estimatedDays: {
        standard: '1-2 days',
        express: 'Same day',
        premium: 'Same day'
      }
    },
    maharashtra: {
      name: 'Maharashtra',
      standardPrice: 79,
      expressPrice: 149,
      premiumPrice: 299,
      estimatedDays: {
        standard: '2-3 days',
        express: '1-2 days',
        premium: '1 day'
      }
    },
    restOfIndia: {
      name: 'Rest of India',
      standardPrice: 99,
      expressPrice: 199,
      premiumPrice: 399,
      estimatedDays: {
        standard: '3-5 days',
        express: '1-2 days',
        premium: '1 day'
      }
    }
  },

  // Weight-based pricing
  weightRates: {
    light: {
      maxWeight: 500, // grams
      multiplier: 1.0
    },
    medium: {
      maxWeight: 2000, // grams
      multiplier: 1.5
    },
    heavy: {
      maxWeight: 5000, // grams
      multiplier: 2.0
    }
  }
} as const;

// Free Shipping Tools (if ShopenUp doesn't have shipping)
export const FREE_SHIPPING_TOOLS = [
  {
    name: 'Shiprocket',
    description: 'Popular Indian shipping aggregator',
    features: [
      'Multiple courier partners',
      'Real-time tracking',
      'COD support',
      'API integration',
      'Automated shipping labels'
    ],
    pricing: 'Pay per shipment',
    website: 'https://shiprocket.co',
    apiDocs: 'https://docs.shiprocket.in'
  },
  {
    name: 'Delhivery',
    description: 'Leading logistics company in India',
    features: [
      'Pan India network',
      'Express delivery',
      'COD collection',
      'Real-time tracking',
      'Warehouse management'
    ],
    pricing: 'Volume-based pricing',
    website: 'https://delhivery.com',
    apiDocs: 'https://delhivery.com/api'
  },
  {
    name: 'Ecom Express',
    description: 'E-commerce focused logistics',
    features: [
      'E-commerce specialization',
      'COD services',
      'Reverse logistics',
      'Real-time tracking',
      'Multiple delivery options'
    ],
    pricing: 'Competitive rates',
    website: 'https://ecomexpress.in',
    apiDocs: 'https://ecomexpress.in/api'
  },
  {
    name: 'Blue Dart',
    description: 'Premium logistics service',
    features: [
      'Premium service',
      'International shipping',
      'Express delivery',
      'Real-time tracking',
      'Insurance coverage'
    ],
    pricing: 'Premium pricing',
    website: 'https://bluedart.com',
    apiDocs: 'https://bluedart.com/api'
  }
] as const;

// Recommended shipping tool for Ayurvedic products
export const RECOMMENDED_SHIPPING_TOOL = {
  primary: 'Shiprocket',
  reasons: [
    'Best for e-commerce businesses',
    'Multiple courier options',
    'Easy integration with Next.js',
    'Good support for COD',
    'Competitive pricing',
    'Real-time tracking',
    'API documentation available'
  ],
  integration: {
    type: 'REST API',
    complexity: 'Medium',
    timeToIntegrate: '2-3 days',
    features: [
      'Order creation',
      'Label generation',
      'Tracking updates',
      'COD collection',
      'Return management'
    ]
  }
} as const;

// Helper function to safely get price for zone and service
const getZonePrice = (zone: ShippingZone, service: ShippingService): number => {
  const zoneConfig = SHIPPING_CONFIG.zones[zone];
  
  switch (service) {
    case 'standard':
      return zoneConfig.standardPrice;
    case 'express':
      return zoneConfig.expressPrice;
    case 'premium':
      return zoneConfig.premiumPrice;
    default:
      throw new Error(`Invalid shipping service: ${service}`);
  }
};

// Helper function to safely get estimated days for zone and service
const getZoneEstimatedDays = (zone: ShippingZone, service: ShippingService): string => {
  const zoneConfig = SHIPPING_CONFIG.zones[zone];
  const estimatedDays = zoneConfig.estimatedDays;
  
  switch (service) {
    case 'standard':
      return estimatedDays.standard;
    case 'express':
      return estimatedDays.express;
    case 'premium':
      return estimatedDays.premium;
    default:
      throw new Error(`Invalid shipping service: ${service}`);
  }
};

// Shipping calculation helper
export const calculateShipping = (
  subtotal: number,
  weight: number,
  zone: ShippingZone,
  service: ShippingService = 'standard'
): ShippingResult => {
  // Input validation
  if (subtotal < 0) {
    throw new Error('Subtotal cannot be negative');
  }
  if (weight < 0) {
    throw new Error('Weight cannot be negative');
  }

  // Free shipping check
  if (subtotal >= SHIPPING_CONFIG.freeShippingThreshold) {
    return {
      cost: 0,
      method: 'Free Shipping',
      estimatedDays: '3-5 business days',
      isFree: true
    };
  }

  // Get base rate for zone and service
  const baseRate = getZonePrice(zone, service);

  // Calculate weight multiplier
  let weightMultiplier = 1.0;
  if (weight > SHIPPING_CONFIG.weightRates.heavy.maxWeight) {
    weightMultiplier = SHIPPING_CONFIG.weightRates.heavy.multiplier;
  } else if (weight > SHIPPING_CONFIG.weightRates.medium.maxWeight) {
    weightMultiplier = SHIPPING_CONFIG.weightRates.medium.multiplier;
  } else if (weight > SHIPPING_CONFIG.weightRates.light.maxWeight) {
    weightMultiplier = SHIPPING_CONFIG.weightRates.light.multiplier;
  }

  const finalCost = Math.round(baseRate * weightMultiplier);

  return {
    cost: finalCost,
    method: SHIPPING_CONFIG.rates[service].name,
    estimatedDays: getZoneEstimatedDays(zone, service),
    isFree: false
  };
};
