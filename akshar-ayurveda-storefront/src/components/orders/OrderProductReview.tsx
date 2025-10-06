"use client"

import { useState, useEffect } from 'react'
import { Button, useToast } from '@components/ui'
import { productService } from '../../lib/shopenup/product'
import { StoreProductReview } from '../../types/global'

interface OrderProductReviewProps {
  productId: string
  productTitle: string
  productThumbnail?: string
  orderId: string
  customerName?: {
    firstName: string
    lastName: string
  }
  customerId?: string
  onReviewSubmitted?: () => void
  refreshTrigger?: number // Add refresh trigger to force re-check
}

export default function OrderProductReview({
  productId,
  productTitle,
  productThumbnail,
  orderId,
  customerName,
  customerId,
  onReviewSubmitted,
  refreshTrigger
}: OrderProductReviewProps) {
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasExistingReview, setHasExistingReview] = useState(false)
  const [existingReview, setExistingReview] = useState<StoreProductReview | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Check if user has already reviewed this product
  useEffect(() => {
    const checkExistingReview = async () => {
      try {
        const { reviews } = await productService.getProductReviewsById({
          productId,
          limit: 50,
          offset: 0
        })
        
        // Check if current user has already reviewed this product
        // Use customer_id for reliable and accurate matching
        
        const userReview = reviews.find(review => {
          if (review.product_id !== productId) return false
          
          // Match by customer_id only - most reliable method
          const match = customerId && review.customer_id && review.customer_id === customerId
          
          return match
        })
        
 
        if (userReview) {
          setHasExistingReview(true)
          setExistingReview(userReview)
        } else if (justSubmitted) {
          // If we just submitted a review, mark it as existing
          setHasExistingReview(true)
          setJustSubmitted(false)
        }
      } catch (error) {
        // Handle error silently
      }
    }

    checkExistingReview()
  }, [productId, refreshTrigger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      showToast('Please select a rating', 'error')
      return
    }
    
    if (!content.trim()) {
      showToast('Please write a review', 'error')
      return
    }
    
    if (content.trim().length < 10) {
      showToast('Review must be at least 10 characters long', 'error')
      return
    }

    // If editing, use handleUpdate instead
    if (isEditing) {
      await handleUpdate(e)
      return
    }

    setIsLoading(true)
    
    try {
      // Get customer name from props or use defaults
      const firstName = customerName?.firstName || 'Customer'
      const lastName = customerName?.lastName || 'User'

      const reviewData = {
        product_id: productId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        first_name: firstName,
        last_name: lastName
      }

      const newReview = await productService.addProductReview(reviewData)
      
      showToast('Review submitted successfully!', 'success')
      setShowForm(false)
      setRating(0)
      setTitle('')
      setContent('')
      setJustSubmitted(true)
      setHasExistingReview(true)
      
        // Set the review data if available, otherwise it will be fetched on next check
        if (newReview) {
          setExistingReview(newReview)
        }
      
      // Update local state to show review as submitted
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      // Handle error silently
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('first_name') || error.message.includes('last_name')) {
          showToast('Review submission failed: Name information is missing. Please contact support.', 'error')
        } else if (error.message.includes('rating')) {
          showToast('Review submission failed: Invalid rating. Please try again.', 'error')
        } else if (error.message.includes('content')) {
          showToast('Review submission failed: Review content is required.', 'error')
        } else {
          showToast('Failed to submit review. Please try again.', 'error')
        }
      } else {
        showToast('Failed to submit review. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setIsEditing(false)
    setRating(0)
    setTitle('')
    setContent('')
  }

  const handleEdit = () => {
    
    if (existingReview && existingReview.id) {
      setIsEditing(true)
      setShowForm(true)
      setRating(existingReview.rating)
      setTitle(existingReview.title || '')
      setContent(existingReview.content)
    } else {
      showToast('Review data not available for editing', 'error')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      showToast('Please select a rating', 'error')
      return
    }
    
    if (!content.trim()) {
      showToast('Please write a review', 'error')
      return
    }
    
    if (content.trim().length < 10) {
      showToast('Review must be at least 10 characters long', 'error')
      return
    }

    if (!existingReview) {
      showToast('No existing review found to update', 'error')
      return
    }

    setIsLoading(true)
    
    try {
      // Get customer name from props or use defaults
      const firstName = customerName?.firstName || 'Customer'
      const lastName = customerName?.lastName || 'User'

      const updateData = {
        id: existingReview.id,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        first_name: firstName,
        last_name: lastName
      }

      const updatedReview = await productService.updateProductReview(updateData)
      
      showToast('Review updated successfully!', 'success')
      setShowForm(false)
      setIsEditing(false)
      setRating(0)
      setTitle('')
      setContent('')
      setJustSubmitted(false)
      setHasExistingReview(true)
      
      // Set the updated review data if available
      if (updatedReview) {
        setExistingReview(updatedReview)
      }
      
      // Update local state to show review as updated
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      // Handle error silently
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('first_name') || error.message.includes('last_name')) {
          showToast('Review update failed: Name information is missing. Please contact support.', 'error')
        } else if (error.message.includes('rating')) {
          showToast('Review update failed: Invalid rating. Please try again.', 'error')
        } else if (error.message.includes('content')) {
          showToast('Review update failed: Review content is required.', 'error')
        } else {
          showToast('Failed to update review. Please try again.', 'error')
        }
      } else {
        showToast('Failed to update review. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (hasExistingReview && !showForm) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              {justSubmitted ? 'Review Submitted Successfully!' : 'Review Submitted'}
            </span>
          </div>
          {existingReview && existingReview.id && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400"
            >
              Edit Review
            </Button>
          )}
        </div>
        {existingReview && (
          <>
            <div className="flex items-center space-x-2 mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${
                    index < Math.round(existingReview.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-green-700">{existingReview.rating}/5</span>
            </div>
            {existingReview.title && (
              <p className="text-sm font-medium text-green-800 mb-1">{existingReview.title}</p>
            )}
            <p className="text-sm text-green-700">{existingReview.content}</p>
          </>
        )}
        {justSubmitted && !existingReview && (
          <p className="text-sm text-green-700">Thank you for your review! It will appear on the product page shortly.</p>
        )}
      </div>
    )
  }

  if (!showForm) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Ready to review this product?</span>
              <p className="text-xs text-gray-500 mt-1">Share your experience with other customers</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
          >
            Write Review
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        {productThumbnail && (
          <img
            src={productThumbnail}
            alt={productTitle}
            className="w-12 h-12 object-cover rounded-lg"
          />
        )}
        <div>
          <h4 className="font-medium text-gray-900">{productTitle}</h4>
          <p className="text-sm text-gray-500">{isEditing ? 'Edit your review' : 'Write your review'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 hover:bg-gray-100 rounded transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating === 0 && 'Select rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Summarize your review"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Review *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tell us about your experience with this product..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 10 characters ({content.length}/10)
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !rating || content.trim().length < 10}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditing ? 'Updating...' : 'Submitting...'}</span>
              </div>
            ) : (
              isEditing ? 'Update Review' : 'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
