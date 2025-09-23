import { useState, useEffect } from 'react';
import { productService } from '../lib/shopenup/product';

interface ProductRating {
  rating: number;
  reviewCount: number;
}

interface UseProductRatingsBulkResult {
  ratings: Record<string, ProductRating>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch bulk product ratings and review counts for multiple products
 * Uses the enhanced API that returns both average rating and total review count
 */
export const useProductRatingsBulk = (productIds: string[]): UseProductRatingsBulkResult => {
  const [ratings, setRatings] = useState<Record<string, ProductRating>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productIds || productIds.length === 0) {
      setRatings({});
      setLoading(false);
      setError(null);
      return;
    }

    const fetchRatings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const ratingsData = await productService.getProductRatingsBulk(productIds);
        setRatings(ratingsData);
      } catch (err) {
        console.error('Error fetching bulk ratings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
        setRatings({});
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [productIds.join(',')]); // Re-fetch when product IDs change

  return { ratings, loading, error };
};
