// Ayurveda-specific type definitions

export type DoshaType = 'vata' | 'pitta' | 'kapha';

// Product Categories for Ayurvedic eCommerce
export type ProductCategory = 
  | 'bone-joints-pain-reliever'
  | 'diabetes-care'
  | 'fat-burner'
  | 'health-care-energy-booster'
  | 'herbal-oral-care'
  | 'natural-antacid'
  | 'patent-products'
  | 'premium-cosmetics'
  | 'ras-rasayan'
  | 'special-vati-stamina';

export interface ProductCategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  isActive: boolean;
}

export interface DoshaProfile {
  vata: number; // 0-100
  pitta: number; // 0-100
  kapha: number; // 0-100
  primary: DoshaType;
  secondary?: DoshaType;
  balanced: boolean;
}

export interface DoshaCharacteristics {
  elements: string[];
  qualities: string[];
  characteristics: string[];
  imbalances: string[];
}

export interface Season {
  name: string;
  dosha: DoshaType;
  recommendations: string[];
  startDate: string;
  endDate: string;
}

export interface HealthGoal {
  id: string;
  name: string;
  description: string;
  doshaFocus: DoshaType[];
  products: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface ProductCategoryDetails {
  id: string;
  name: string;
  subcategories: string[];
  doshaSpecific: boolean;
  description: string;
  imageUrl?: string;
}

export interface AyurvedicProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  doshaCompatibility: {
    vata: 'good' | 'neutral' | 'avoid';
    pitta: 'good' | 'neutral' | 'avoid';
    kapha: 'good' | 'neutral' | 'avoid';
  };
  seasonalRecommendations: {
    spring: boolean;
    summer: boolean;
    monsoon: boolean;
    autumn: boolean;
    winter: boolean;
  };
  healthGoals: string[];
  ingredients: string[];
  dosage: {
    amount: string;
    frequency: string;
    timing: string;
    duration?: string;
  };
  contraindications: string[];
  benefits: string[];
  imageUrl: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isFavourite?: boolean;
  sku: string;
  weight?: string;
  expiryDate?: string;
  manufacturer?: string;
  certifications?: string[];
  allergens?: string[];
  drugInteractions?: string[];
  pregnancyWarning?: boolean;
  lactationWarning?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: AssessmentOption[];
  weight: number;
}

export interface AssessmentOption {
  id: string;
  text: string;
  doshaImpact: {
    vata: number;
    pitta: number;
    kapha: number;
  };
}

export interface AssessmentResult {
  id: string;
  userId: string;
  doshaProfile: DoshaProfile;
  healthGoals: string[];
  recommendations: ProductRecommendation[];
  completedAt: Date;
  expiresAt: Date;
}

export interface ProductRecommendation {
  product: AyurvedicProduct;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  doshaMatch: number; // 0-100
  seasonalMatch: number; // 0-100
  healthGoalMatch: number; // 0-100
  overallScore: number; // 0-100
}

export interface ConsultationBooking {
  id: string;
  userId: string;
  practitionerId: string;
  appointmentDate: Date;
  duration: number; // minutes
  type: 'dosha-assessment' | 'health-consultation' | 'diet-planning' | 'lifestyle-coaching';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  doshaProfile?: DoshaProfile;
  recommendations?: ProductRecommendation[];
}

export interface Practitioner {
  id: string;
  name: string;
  specialization: string[];
  experience: number; // years
  qualifications: string[];
  rating: number;
  reviewCount: number;
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  consultationFee: number;
  currency: string;
  imageUrl?: string;
  bio: string;
}

export interface DoshaBalancingPlan {
  id: string;
  userId: string;
  doshaProfile: DoshaProfile;
  recommendations: {
    diet: string[];
    lifestyle: string[];
    products: ProductRecommendation[];
    exercises: string[];
    dailyRoutine: string[];
  };
  duration: number; // days
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonalRecommendation {
  season: string;
  dosha: DoshaType;
  products: AyurvedicProduct[];
  lifestyle: string[];
  diet: string[];
  activities: string[];
}

export interface HerbInteraction {
  herb1: string;
  herb2: string;
  interaction: 'synergistic' | 'antagonistic' | 'neutral';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DosageCalculator {
  productId: string;
  userWeight: number;
  userAge: number;
  doshaProfile: DoshaProfile;
  healthCondition?: string;
  currentMedications?: string[];
  recommendedDosage: {
    amount: string;
    frequency: string;
    timing: string;
    duration: string;
    warnings: string[];
  };
}

export interface WellnessQuiz {
  id: string;
  title: string;
  description: string;
  questions: WellnessQuestion[];
  category: string;
  estimatedTime: number; // minutes
}

export interface WellnessQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'text';
  options?: string[];
  scaleRange?: {
    min: number;
    max: number;
    labels: string[];
  };
}

export interface WellnessQuizResult {
  id: string;
  quizId: string;
  userId: string;
  answers: {
    questionId: string;
    answer: string | number;
  }[];
  score: number;
  recommendations: string[];
  completedAt: Date;
}

// E-commerce specific types
export interface CartItem {
  product: AyurvedicProduct;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  doshaProfile?: DoshaProfile;
  healthGoals?: string[];
  addresses: Address[];
  favouriteProducts: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Page types
export interface PageInfo {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Gallery types
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

// Contact types
export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: Date;
}

// Social Media types
export interface SocialMediaLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin';
  url: string;
  icon: string;
  isActive: boolean;
}
