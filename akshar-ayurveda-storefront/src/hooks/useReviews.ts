// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { 
//   getProductReviews, 
//   getAllReviews, 
//   getFeaturedTestimonials, 
//   submitReview,
//   Review,
//   ReviewResponse 
// } from '../lib/shopenup/';

// // Hook to get product reviews
// export const useProductReviews = (productId: string, limit: number = 10, offset: number = 0) => {
//   return useQuery({
//     queryKey: ['product-reviews', productId, limit, offset],
//     queryFn: () => getProductReviews(productId, limit, offset),
//     enabled: !!productId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     refetchOnWindowFocus: false,
//   });
// };

// // Hook to get all reviews
// export const useAllReviews = (limit: number = 10, offset: number = 0) => {
//   return useQuery({
//     queryKey: ['all-reviews', limit, offset],
//     queryFn: () => getAllReviews(limit, offset),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     refetchOnWindowFocus: false,
//   });
// };

// // Hook to get featured testimonials for homepage
// export const useFeaturedTestimonials = (limit: number = 3) => {
//   return useQuery({
//     queryKey: ['featured-testimonials', limit],
//     queryFn: () => getFeaturedTestimonials(limit),
//     staleTime: 10 * 60 * 1000, // 10 minutes
//     gcTime: 30 * 60 * 1000, // 30 minutes
//     refetchOnWindowFocus: false,
//   });
// };

// // Hook to submit a review
// export const useSubmitReview = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: submitReview,
//     onSuccess: (newReview) => {
//       // Invalidate and refetch reviews
//       queryClient.invalidateQueries({ queryKey: ['product-reviews', newReview.product_id] });
//       queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
//       queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
//     },
//     onError: (error) => {
//       console.error('Failed to submit review:', error);
//     },
//   });
// };

// // Hook to get average rating for a product
// export const useProductRating = (productId: string) => {
//   return useQuery({
//     queryKey: ['product-rating', productId],
//     queryFn: async () => {
//       const response = await getProductReviews(productId, 1, 0);
//       return {
//         averageRating: response.average_rating || 0,
//         reviewCount: response.count || 0,
//       };
//     },
//     enabled: !!productId,
//     staleTime: 10 * 60 * 1000, // 10 minutes
//     gcTime: 30 * 60 * 1000, // 30 minutes
//     refetchOnWindowFocus: false,
//   });
// };
