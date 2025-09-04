export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface Certification {
  id: string;
  name: string;
  image: string;
  alt: string;
}

export interface FeatureHighlight {
  id: string;
  icon: string;
  text: string;
}

export interface PromotionalBanner {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  image?: string;
}

export interface ProductCategory {
  title: string;
  description: string;
}

export interface TrustStats {
  customers: string;
  products: string;
  years: string;
}

export interface Newsletter {
  title: string;
  subtitle: string;
  placeholder: string;
}

export interface HomepageData {
  banners: Banner[];
  categories: Category[];
  collections: Collection[];
  products: {
    newArrivals: Product[];
    weightGainer: Product[];
    ayurvedicMedicines: Product[];
  };
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  certifications: Certification[];
  featureHighlights: FeatureHighlight[];
  promotionalBanners: {
    weightGainer: PromotionalBanner;
    digestiveHealth: PromotionalBanner;
    healthcareNature: PromotionalBanner;
  };
  productCategories: {
    ayurvedicMedicines: ProductCategory;
    feverMalariaDengue: ProductCategory;
    healthWellness: ProductCategory;
    pilesWellness: ProductCategory;
  };
  trustStats: TrustStats;
  newsletter: Newsletter;
}
