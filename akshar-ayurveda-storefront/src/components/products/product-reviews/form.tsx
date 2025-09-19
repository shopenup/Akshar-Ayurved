"use client"

import { useState, useEffect } from "react"
import { getCustomer } from "../../../lib/shopenup/customer"
import { HttpTypes } from "@shopenup/types"
import { Input, Label, Textarea, toast, Toaster } from "@shopenup/ui"
import { Button } from "../../ui"
import { productService } from "../../../lib/shopenup/product"

type ProductReviewsFormProps = {
  productId: string
}

export default function ProductReviewsForm({ productId }: ProductReviewsFormProps) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (customer) {
      return
    }

    getCustomer().then(setCustomer)
  }, [])

  if (!customer) {
    return <></>
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Always prevent default form submission
    
    // Enhanced validation
    if (!rating) {
      toast.error("Rating Required", {
        description: "Please select a rating for this product.",
      })
      return
    }

    if (!content.trim()) {
      toast.error("Review Required", {
        description: "Please write your review before submitting.",
      })
      return
    }

    if (content.trim().length < 10) {
      toast.error("Review Too Short", {
        description: "Please write at least 10 characters for your review.",
      })
      return
    }

    setIsLoading(true)
    productService.addProductReview({
      title,
      content,
      rating,
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      product_id: productId,
    }).then(() => {
      setShowForm(false)
      setTitle("")
      setContent("")
      setRating(0)
      toast.success("Success", {
        description: "Your review has been submitted and is awaiting approval.",
      })
    }).catch(() => {
      toast.error("Error", {
        description: "An error occurred while submitting your review. Please try again later.",
      })
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Experience</h3>
            <p className="text-gray-600">Help other customers by writing a review</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Write a Review
          </Button>
        </div>
      )}
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h3>
            <p className="text-gray-600">Your feedback helps other customers make informed decisions</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index + 1)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        index < rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 group-hover:text-yellow-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm text-gray-600">
                    {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Title Section */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <Input 
                id="title"
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Summarize your experience (optional)"
                className="w-full"
              />
            </div>

            {/* Content Section */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <Textarea 
                id="content"
                name="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Tell us about your experience with this product..."
                rows={4}
                className="w-full"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Minimum 10 characters required
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button 
                type="button"
                variant="secondary" 
                onClick={() => {
                  setShowForm(false)
                  setTitle("")
                  setContent("")
                  setRating(0)
                }}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !content.trim() || !rating} 
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
      <Toaster />
    </div>
  )
}