import { getProductModule, getInventoryModule } from './init';
import { StoreProductReview } from "../../types/global"
import { sdk } from '@lib/config';
import { getAuthHeaders } from './cookies';

// Minimal API shapes used below to avoid `any`
type ApiImage = { url?: string } | string;
interface ApiCalculatedPrice { calculated_amount?: number; original_amount?: number }
interface ApiVariant {
  id?: string;
  price?: number;
  prices?: Array<{ amount?: number }>;
  calculated_price?: ApiCalculatedPrice | number;
  inventory_quantity?: number;
  inventoryQuantity?: number;
}
interface ApiProduct {
  id: string;
  title: string;
  description?: string;
  price?: number;
  original_price?: number;
  images?: ApiImage[];
  thumbnail?: string;
  type?: { value?: string; label?: string };
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  variants?: ApiVariant[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}
interface ApiCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  product_count?: number;
  parent_id?: string;
  children?: ApiCategory[];
}
interface ApiCollection {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  images: string[] | { url: string }[];
  thumbnail?: string;
  category: string | { name: string };
  type?: {
    value: string;
    label: string;
  };
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  inStock: boolean;
  in_stock?: boolean;
  variants?: ProductVariant[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  inventoryQuantity: number;
  inventory_quantity?: number;
  in_stock?: boolean;
  rating?: number;
  review_count?: number;
  calculated_price?: {
    calculated_amount: number;
  };
  options: Record<string, string>;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  count: number;
  parentId?: string;
  children?: ProductCategory[];
}

export interface ProductCollection {
  id: string;
  title: string;
  description?: string;
  image?: string;
  products: Product[];
}

export interface ProductFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  rating?: number;
  tags?: string[];
  search?: string;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  collection?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  rating?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class ShopenupProductService {
  private productModule!: Record<string, unknown>;
  private inventoryModule!: Record<string, unknown>;

  constructor() {
    this.initializeModules();
  }

  private async initializeModules() {
    try {
      this.productModule = await getProductModule() as Record<string, unknown>;
      this.inventoryModule = await getInventoryModule() as Record<string, unknown>;
    } catch (error) {
      // Handle error silently
    }
  }

  // Get all products with optional filtering
  async getProducts(params?: ProductSearchParams): Promise<Product[]> {
    try {
      const query: Record<string, unknown> = {
        ...(params?.q && { q: params.q }),
        ...(params?.category && { category_id: params.category }),
        ...(params?.collection && { collection_id: params.collection }),
        ...(params?.tags && { tags: params.tags.join(',') }),
        ...(params?.priceMin && { price_min: params.priceMin }),
        ...(params?.priceMax && { price_max: params.priceMax }),
        ...(params?.inStock !== undefined && { in_stock: params.inStock }),
        ...(params?.rating && { rating: params.rating }),
        // Remove sort_by and sort_order as they're not supported by the API
        // ...(params?.sortBy && { sort_by: params.sortBy }),
        // ...(params?.sortOrder && { sort_order: params.sortOrder }),
        limit: params?.limit || 50,
        offset: params?.offset || 0,
        fields: '*variants.calculated_price', // Add this to get price information
      };
      const response = await sdk.client.fetch<{ products: ApiProduct[] }>(
        '/store/products',
        {
          query,
          next: { tags: ['products'] },
          // cache: 'force-cache',
        }
      );

      return (response.products || []).map((product: ApiProduct) => {
        // Extract price from variants if available
        let price = 0;
        let originalPrice = 0;
        if (product.variants && product.variants[0]) {
          const cp = product.variants[0].calculated_price;
          if (cp && typeof cp !== 'number') {
            price = cp.calculated_amount || 0;
            originalPrice = cp.original_amount || 0;
          } else if (typeof cp === 'number') {
            price = cp;
          }
        } else if (product.variants && product.variants[0] && typeof product.variants[0].price === 'number') {
          price = product.variants[0].price;
        } else if (product.variants && product.variants[0] && product.variants[0].prices && product.variants[0].prices[0]) {
          // Try to get price from variants.prices array
          price = product.variants[0].prices[0].amount || 0;
        } else if (typeof product.price === 'number') {
          price = product.price;
        }
        
        const normalizedImages = (product.images ?? []).map((img) =>
          typeof img === 'string' ? { url: img } : { url: img.url || '' }
        ) as { url: string }[];

        return {
          id: product.id,
          title: product.title,
          description: product.description,
          price: price,
          originalPrice: originalPrice,
          images: normalizedImages,
          thumbnail: product.thumbnail,
          category: product.type?.value || 'General',
          type: product.type ? { value: product.type.value ?? '', label: product.type.label ?? '' } : undefined,
          rating: product.rating,
          reviewCount: product.review_count,
          inStock: Boolean(product.in_stock),
          variants: product.variants as ProductVariant[] | undefined,
          tags: product.tags,
          metadata: product.metadata,
          createdAt: product.created_at || new Date().toISOString(),
          updatedAt: product.updated_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      throw error;
    }
  }
  // async getProducts(params?: ProductSearchParams): Promise<Product[]> {
  //   try {
  //     // Check if product module is available
  //     if (!this.productModule || !this.productModule.listProducts) {
  //       console.warn('Product module not available, returning empty array');
  //       return [];
  //     }

  //     const searchParams = {
  //       q: params?.q,
  //       category_id: params?.category,
  //       collection_id: params?.collection,
  //       tags: params?.tags,
  //       price_min: params?.priceMin,
  //       price_max: params?.priceMax,
  //       in_stock: params?.inStock,
  //       rating: params?.rating,
  //       sort_by: params?.sortBy,
  //       sort_order: params?.sortOrder,
  //       limit: params?.limit || 50,
  //       offset: params?.offset || 0
  //     };

  //     const products = await this.productModule.listProducts(searchParams);
      
  //     // Transform Shopenup products to our format
  //     const transformedProducts: Product[] = await Promise.all(
  //       products.map(async (product: Record<string, unknown>) => {
  //         const stockStatus = await this.inventoryModule.checkStock(product.id as string);
          
  //         return {
  //           id: product.id as string,
  //           title: product.title as string,
  //           description: product.description as string,
  //           price: product.price as number,
  //           originalPrice: product.original_price as number,
  //           images: product.images as string[] || [],
  //           thumbnail: product.thumbnail as string,
  //           category: product.type?.value as string || 'General',
  //           type: product.type as { value: string; label: string },
  //           rating: product.rating as number,
  //           reviewCount: product.review_count as number,
  //           inStock: stockStatus as boolean,
  //           variants: product.variants as ProductVariant[],
  //           tags: product.tags as string[],
  //           metadata: product.metadata as Record<string, unknown>,
  //           createdAt: product.created_at as string,
  //           updatedAt: product.updated_at as string
  //         };
  //       })
  //     );

  //     return transformedProducts;
  //   } catch (error) {
  //     console.error('Failed to get products:', error);
  //     throw error;
  //   }
  // }

  // Get product by ID
  async getProduct(productId: string): Promise<Product> {
    try {
      const response = await sdk.client.fetch<{ product: ApiProduct }>(`/store/products/${productId}`, {
        next: { tags: ['products'] },
        // cache: 'force-cache',
      });
      const product = response.product;
      const normalizedImages = (product.images ?? []).map((img) =>
        typeof img === 'string' ? { url: img } : { url: img.url || '' }
      ) as { url: string }[];
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price ?? 0),
        originalPrice: Number(product.original_price ?? 0),
        images: normalizedImages,
        thumbnail: product.thumbnail,
        category: product.type?.value || 'General',
        type: product.type ? { value: product.type.value ?? '', label: product.type.label ?? '' } : undefined,
        rating: product.rating,
        reviewCount: product.review_count,
        inStock: Boolean(product.in_stock),
        variants: product.variants as ProductVariant[] | undefined,
        tags: product.tags,
        metadata: product.metadata,
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId: string, params?: ProductSearchParams): Promise<Product[]> {
    return this.getProducts({ ...params, category: categoryId });
  }

  // Get products by collection
  async getProductsByCollection(collectionId: string, params?: ProductSearchParams): Promise<Product[]> {
    return this.getProducts({ ...params, collection: collectionId });
  }

  // Search products
  async searchProducts(query: string, params?: ProductSearchParams): Promise<Product[]> {
    try {
      return this.getProducts({
        ...params,
        q: query
      });
    } catch (error) {
      throw error;
    }
  }

  // Fetch prices for a specific product
  async fetchProductPrices(productId: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await sdk.client.fetch<Record<string, unknown>>(
        `/store/products/${productId}`,
        {
          next: { tags: ['products'] },
        }
      );
      return response;
    } catch (error) {
      return null;
    }
  }

  // Get new arrivals
  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    try {
      return this.getProducts({
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit
      });
    } catch (error) {
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      return this.getProducts({
        tags: ['featured'],
        limit
      });
    } catch (error) {
      throw error;
    }
  }

  // Get products on sale
  async getProductsOnSale(limit: number = 8): Promise<Product[]> {
    try {
      const products = await this.getProducts({ limit });
      return products.filter(product => product.originalPrice && product.originalPrice > product.price);
    } catch (error) {
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const response = await sdk.client.fetch<{ product_categories: ApiCategory[] }>(
        '/store/product-categories',
        {
          query: {},
          next: { tags: ['categories'] },
          // cache: 'force-cache',
        }
      );
      return (response.product_categories || []).map((category: ApiCategory) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        count: Number(category.product_count ?? 0),
        parentId: category.parent_id,
        children: category.children as unknown as ProductCategory[] | undefined,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get category by ID
  async getCategory(categoryId: string): Promise<ProductCategory> {
    try {
      const response = await sdk.client.fetch<{ product_category: ApiCategory }>(
        `/store/product-categories/${categoryId}`,
        {
          next: { tags: ['categories'] },
          // cache: 'force-cache',
        }
      );
      const category = response.product_category;
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        count: Number(category.product_count ?? 0),
        parentId: category.parent_id,
        children: category.children as unknown as ProductCategory[] | undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all collections
  async getCollections(): Promise<ProductCollection[]> {
    try {
      const response = await sdk.client.fetch<{ product_collections: ApiCollection[] }>(
        '/store/collections',
        {
          query: {},
          next: { tags: ['collections'] },
          // cache: 'force-cache',
        }
      );
      return (response.product_collections || []).map((collection: ApiCollection) => ({
        id: collection.id,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        products: [], // You can fetch products for each collection if needed
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get collection by ID
  async getCollection(collectionId: string): Promise<ProductCollection> {
    try {
      const response = await sdk.client.fetch<{ product_collection: ApiCollection }>(
        `/store/collections/${collectionId}`,
        {
          next: { tags: ['collections'] },
          // cache: 'force-cache',
        }
      );
      const collection = response.product_collection;
      return {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        products: [], // You can fetch products for this collection if needed
      };
    } catch (error) {
      throw error;
    }
  }

  // Get product recommendations
  async getProductRecommendations(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const response = await sdk.client.fetch<{ products: ApiProduct[] }>(
        `/store/products/${productId}/recommendations`,
        {
          query: { limit },
          next: { tags: ['products'] },
          // cache: 'force-cache',
        }
      );
      return (response.products || []).map((product: ApiProduct) => {
        const normalizedImages = (product.images ?? []).map((img) =>
          typeof img === 'string' ? { url: img } : { url: img.url || '' }
        ) as { url: string }[];
        return ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price ?? 0),
        originalPrice: Number(product.original_price ?? 0),
        images: normalizedImages,
        thumbnail: product.thumbnail,
        category: product.type?.value || 'General',
        type: product.type ? { value: product.type.value ?? '', label: product.type.label ?? '' } : undefined,
        rating: product.rating,
        reviewCount: product.review_count,
        inStock: Boolean(product.in_stock),
        variants: product.variants as ProductVariant[] | undefined,
        tags: product.tags,
        metadata: product.metadata,
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString(),
      });
      });
    } catch (error) {
      throw error;
    }
  }

  // Get product inventory
  async getProductInventory(productId: string): Promise<{
    inStock: boolean;
    quantity: number;
    lowStockThreshold: number;
  }> {
    try {
      const response = await sdk.client.fetch<{ inventory: { in_stock?: boolean; quantity?: number; low_stock_threshold?: number } }>(
        `/store/products/${productId}/inventory`,
        {
          next: { tags: ['products'] },
          // cache: 'force-cache',
        }
      );
      const inventory = response.inventory;
      return {
        inStock: Boolean(inventory.in_stock),
        quantity: Number(inventory.quantity ?? 0),
        lowStockThreshold: Number(inventory.low_stock_threshold ?? 0),
      };
    } catch (error) {
      throw error;
    }
  }

  // Get products by IDs
  async getProductsById(params: { ids: string[]; regionId: string }): Promise<ApiProduct[]> {
    try {
      const { ids, regionId } = params;
      
      if (!ids || ids.length === 0) {
        return [];
      }

      const response = await sdk.client.fetch<{ products: ApiProduct[] }>('/store/products', {
        query: {
          id: ids,
          region_id: regionId,
          fields: '*variants'
        },
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || ''
        }
      });

      return response.products || [];
    } catch (error) {
      return [];
    }
  }

  // Get product reviews by ID
  async getProductReviewsById(params: { productId: string; limit?: number; offset?: number }): Promise<{
    reviews: StoreProductReview[]
    average_rating: number
    limit: number
    offset: number
    count: number
  }> {
    try {
      const { productId, limit = 10, offset = 0 } = params;
  
      if (!productId) {
        return { reviews: [], average_rating: 0, limit, offset, count: 0 };
      }
  
      const response = await sdk.client.fetch<{
        reviews: StoreProductReview[]
        average_rating: number
        limit: number
        offset: number
        count: number
      }>(`/store/products/${productId}/reviews`, {
        headers: {
          ...(await getAuthHeaders()),
        },
        query: {
          limit,
          offset,
          order: "-created_at",
        },
        next: { tags: ['product-reviews'] },
        // cache: 'force-cache',
      });
  
      return response;
    } catch (error) {
      return { reviews: [], average_rating: 0, limit: params.limit || 10, offset: params.offset || 0, count: 0 };
    }
  }

  /**
   * Get bulk product ratings and review counts for multiple products
   */
  async getProductRatingsBulk(productIds: string[]): Promise<Record<string, { rating: number; reviewCount: number }>> {
    try {
      if (!productIds || productIds.length === 0) {
        return {};
      }

      // Limit to 50 products as per API specification
      const limitedProductIds = productIds.slice(0, 50);
      
      
      const response = await sdk.client.fetch<{
        ratings: Array<{
          product_id: string;
          average_rating: number;
          total_reviews: number;
        }>
      }>(`/store/reviews`, {
        query: {
          product_ids: limitedProductIds.join(',')
        },
        next: { tags: ['product-ratings'] },
        cache: "no-store",
      });


      // Transform response to match expected format
      const ratingsMap: Record<string, { rating: number; reviewCount: number }> = {};
      
      if (response.ratings) {
        response.ratings.forEach(rating => {
          ratingsMap[rating.product_id] = {
            rating: rating.average_rating || 0,
            reviewCount: rating.total_reviews || 0 // Now using the actual review count from API
          };
        });
      }

      return ratingsMap;
    } catch (error) {
      return {};
    }
  }
  
  // Add a product review
  async addProductReview(input: {
    title?: string
    content: string
    first_name: string
    last_name: string
    rating: number
    product_id: string
  }): Promise<StoreProductReview | null> {
    try {
      const response = await sdk.client.fetch<StoreProductReview>(`/store/reviews`, {
        method: "POST",
        headers: {
          ...(await getAuthHeaders()),
        },
        body: input,
        next: { tags: ['product-reviews'] },
        cache: "no-store",
      });
  
      return response;
    } catch (error) {
      return null;
    }
  }

  async updateProductReview(input: {
    id: string
    title?: string
    content?: string
    first_name?: string
    last_name?: string
    rating?: number
  }): Promise<StoreProductReview | null> {
    try {
      const response = await sdk.client.fetch<StoreProductReview>(`/store/reviews`, {
        method: "PUT",
        headers: {
          ...(await getAuthHeaders()),
        },
        body: input,
        next: { tags: ['product-reviews'] },
        cache: "no-store",
      });
  
      return response;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const productService = new ShopenupProductService();
