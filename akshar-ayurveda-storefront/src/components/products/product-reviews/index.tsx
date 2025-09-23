"use client"

import { productService } from "../../../lib/shopenup/product"
import { StoreProductReview } from "../../../types/global"
import { Button } from "../../ui"
import { useState, useEffect } from "react"
type ProductReviewsProps = {
  productId: string
}

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const [page, setPage] = useState(1)
  const defaultLimit = 10
  const [reviews, setReviews] = useState<StoreProductReview[]>([])
  const [rating, setRating] = useState(0)
  const [hasMoreReviews, setHasMoreReviews] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    productService.getProductReviewsById({
      productId,
      limit: defaultLimit,
      offset: (page - 1) * defaultLimit,
    }).then(({ reviews: paginatedReviews, average_rating, count, limit }) => {
      setReviews((prev) => {
        const newReviews = paginatedReviews.filter(
          (review) => !prev.some((r) => r.id === review.id)
        )
        return [...prev, ...newReviews]
      })
      setRating(average_rating)
      setHasMoreReviews(count > limit * page)
      setCount(count)
    })
  }, [page])

  // Calculate rating distribution from actual review data
  const calculateRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // Only calculate if we have reviews
    if (reviews.length === 0) {
      return [5, 4, 3, 2, 1].map(stars => ({ stars, count: 0, percentage: 0 }));
    }
    
    reviews.forEach(review => {
      // Ensure rating is a valid number
      const rating = typeof review.rating === 'number' ? review.rating : 0;
      const roundedRating = Math.round(rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        distribution[roundedRating as keyof typeof distribution]++;
      }
    });

    return [5, 4, 3, 2, 1].map(stars => {
      const count = distribution[stars as keyof typeof distribution];
      const percentage = count > 0 ? Math.round((count / reviews.length) * 100) : 0;
      return { stars, count, percentage };
    });
  };

  const ratingDistribution = calculateRatingDistribution();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Reviews Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Overall Rating */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
            
            {/* Overall Rating Display */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
              <div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className={`w-6 h-6 ${
                        index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-gray-600">
                  <span className="text-lg font-medium">{count}</span>
                  <span className="text-sm ml-1">reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Rating Distribution */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{item.stars}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No rating data available</p>
                <p className="text-sm text-gray-400 mt-1">Reviews will appear here once customers start rating</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6 mb-8">
          {reviews.map((review) => (
            <Review key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-600">Be the first to review this product!</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMoreReviews && (
        <div className="flex justify-center mb-8">
          <Button 
            variant="secondary" 
            onClick={() => setPage(page + 1)}
            className="px-8 py-3 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
          >
            Load more reviews
          </Button>
        </div>
      )}

    </div>
  )
}

function Review({ review }: { review: StoreProductReview }) {
    // Generate a random time ago for demo purposes
    const timeAgo = ['2 weeks ago', '1 month ago', '3 weeks ago', '1 week ago', '2 months ago'][Math.floor(Math.random() * 5)];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-semibold text-gray-900">
                {review.first_name} {review.last_name}
              </span>
              <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>
            
            {/* Rating Stars */}
            <div className="flex items-center mb-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${
                    index < Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Review Title */}
            {review.title && (
              <h4 className="text-lg font-semibold text-gray-900 mb-3">{review.title}</h4>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="text-gray-700 leading-relaxed">
          {review.content}
        </div>
      </div>
    )
  }