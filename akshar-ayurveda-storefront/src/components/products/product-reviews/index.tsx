"use client"

import { productService } from "../../../lib/shopenup/product"
import { StoreProductReview } from "../../../types/global"
import { Button } from "../../ui"
import { useState, useEffect } from "react"
import ProductReviewsForm from "./form"
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
      console.log(count, limit, page, count > limit * page)
      setHasMoreReviews(count > limit * page)
      setCount(count)
    })
  }, [page])

  // TODO add return statement

  return (
    <div className="max-w-4xl mx-auto">
      {/* Reviews Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
          <p className="text-gray-600 mb-6">
            See what our customers are saying about this product
          </p>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
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
              <span className="text-2xl font-bold text-gray-900">{rating}</span>
            </div>
            <div className="text-gray-500">
              <span className="text-lg font-medium">{count}</span>
              <span className="text-sm ml-1">reviews</span>
            </div>
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

      {/* Review Form */}
      <ProductReviewsForm productId={productId} />
    </div>
  )
}

function Review({ review }: { review: StoreProductReview }) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {review.title && (
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h4>
            )}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
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
              <span className="text-sm text-gray-500">
                {review.first_name} {review.last_name}
              </span>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="text-gray-700 leading-relaxed mb-4">
          {review.content}
        </div>

        {/* Review Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Verified Purchase</span>
          </div>
        </div>
      </div>
    )
  }