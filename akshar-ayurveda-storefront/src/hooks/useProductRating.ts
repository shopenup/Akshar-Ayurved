import { useState, useEffect } from 'react';
import { productService } from '@lib/shopenup/product';

interface ProductRating {
  rating: number;
  reviewCount: number;
  loading: boolean;
  error: string | null;
}

export function useProductRating(productId: string): ProductRating {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productService.getProductReviewsById({
          productId,
          limit: 1, // We only need the count and average rating
          offset: 0
        });

        setRating(response.average_rating || 0);
        setReviewCount(response.count || 0);
      } catch (err) {
        console.error('Error fetching product rating:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch rating');
        // Set fallback values
        setRating(0);
        setReviewCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [productId]);

  return {
    rating,
    reviewCount,
    loading,
    error
  };
}
