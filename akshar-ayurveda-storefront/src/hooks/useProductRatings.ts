import { useState, useEffect } from 'react';
import { productService } from '@lib/shopenup/product';

interface ProductRating {
  rating: number;
  reviewCount: number;
  loading: boolean;
  error: string | null;
}

interface ProductRatingsMap {
  [productId: string]: ProductRating;
}

export function useProductRatings(productIds: string[]): ProductRatingsMap {
  const [ratings, setRatings] = useState<ProductRatingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productIds || productIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize all products with loading state
        const initialRatings: ProductRatingsMap = {};
        productIds.forEach(id => {
          initialRatings[id] = {
            rating: 0,
            reviewCount: 0,
            loading: true,
            error: null
          };
        });
        setRatings(initialRatings);

        // Fetch ratings for all products in parallel
        const ratingPromises = productIds.map(async (productId) => {
          try {
            const response = await productService.getProductReviewsById({
              productId,
              limit: 1,
              offset: 0
            });

            return {
              productId,
              rating: response.average_rating || 0,
              reviewCount: response.count || 0,
              loading: false,
              error: null
            };
          } catch (err) {
            console.error(`Error fetching rating for product ${productId}:`, err);
            return {
              productId,
              rating: 0,
              reviewCount: 0,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to fetch rating'
            };
          }
        });

        const results = await Promise.all(ratingPromises);
        
        // Update ratings with results
        const updatedRatings: ProductRatingsMap = {};
        results.forEach(result => {
          updatedRatings[result.productId] = {
            rating: result.rating,
            reviewCount: result.reviewCount,
            loading: result.loading,
            error: result.error
          };
        });

        setRatings(updatedRatings);
      } catch (err) {
        console.error('Error fetching product ratings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [productIds.join(',')]); // Use join to create a stable dependency

  return ratings;
}
