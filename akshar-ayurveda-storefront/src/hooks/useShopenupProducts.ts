import { useState, useEffect } from 'react';
import { productService, type Product, type ProductCategory, type ProductCollection, type ProductSearchParams } from '../lib/shopenup';

export interface UseProductsOptions {
  limit?: number;
  category?: string;
  collection?: string;
  search?: string;
  tags?: string[];
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: ProductSearchParams = {
        limit: options.limit,
        category: options.category,
        collection: options.collection,
        q: options.search,
        tags: options.tags,
        inStock: options.inStock,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder
      };

      const data = await productService.getProducts(searchParams);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [options.limit, options.category, options.collection, options.search, options.tags, options.inStock, options.sortBy, options.sortOrder]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function useNewArrivals(limit: number = 8): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getNewArrivals(limit);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch new arrivals';
      setError(errorMessage);
      console.error('Error fetching new arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchNewArrivals
  };
}

export function useFeaturedProducts(limit: number = 8): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getFeaturedProducts(limit);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch featured products';
      setError(errorMessage);
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts
  };
}

export function useProductsOnSale(limit: number = 8): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsOnSale = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsOnSale(limit);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products on sale';
      setError(errorMessage);
      console.error('Error fetching products on sale:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsOnSale();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchProductsOnSale
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export function useCollections() {
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getCollections();
      setCollections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch collections';
      setError(errorMessage);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections
  };
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProduct(productId);
      setProduct(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product';
      setError(errorMessage);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
}

export function useProductRecommendations(productId: string, limit: number = 4): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductRecommendations(productId, limit);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product recommendations';
      setError(errorMessage);
      console.error('Error fetching product recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [productId, limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchRecommendations
  };
}
