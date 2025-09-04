import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Card, Input, Textarea } from '../../components/ui';

export default function ReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [reviews, setReviews] = useState<{[key: string]: {
    rating?: number;
    title?: string;
    comment?: string;
  }}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample order data
  const orderData = {
    orderId: id as string,
    date: '2024-12-15',
    items: [
      {
        id: '1',
        name: 'START Weight Gainer',
        price: 799,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop',
        category: 'Supplements',
        description: 'Powerful Ayurvedic Formula to improve digestive health and bowel movements'
      },
      {
        id: '2',
        name: 'Organic Ashwagandha Powder',
        price: 299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
        category: 'Herbs',
        description: 'Pure organic ashwagandha powder for stress relief and energy'
      }
    ]
  };

  const handleReviewChange = (itemId: string, field: string, value: string | number) => {
    setReviews(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitting reviews:', reviews);
      setIsSubmitting(false);
      router.push('/orders');
    }, 2000);
  };

  const handleSkipReview = () => {
    router.push('/orders');
  };

  const getRatingStars = (itemId: string) => {
    const rating = reviews[itemId]?.rating || 0;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleReviewChange(itemId, 'rating', star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-6 h-6 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
        </span>
      </div>
    );
  };

  const hasReviews = Object.keys(reviews).length > 0;
  const allReviewsComplete = orderData.items.every(item => 
    reviews[item.id]?.rating && reviews[item.id]?.comment
  );

  return (
    <>
      <Head>
        <title>Write Review - AKSHAR</title>
        <meta name="description" content="Share your experience with our products" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <Button variant="outline" size="sm" className="mb-4">
                ← Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Write a Review</h1>
            <p className="text-gray-600 mt-2">
              Share your experience with the products from Order #{orderData.orderId}
            </p>
          </div>

          <div className="space-y-6">
            {orderData.items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Category: {item.category} | Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate this product *
                  </label>
                  {getRatingStars(item.id)}
                </div>

                {/* Review Title */}
                <div className="mb-6">
                  <Input
                    label="Review Title (Optional)"
                    placeholder="Summarize your experience in a few words"
                                         value={reviews[item.id]?.title || ''}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReviewChange(item.id, 'title', e.target.value)}
                  />
                </div>

                {/* Review Comment */}
                <div className="mb-6">
                  <Textarea
                    label="Your Review *"
                    placeholder="Share your experience with this product. What did you like or dislike? How did it work for you?"
                                         value={reviews[item.id]?.comment || ''}
                     onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleReviewChange(item.id, 'comment', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Review Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Review Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                                       <li>• Share your honest experience with the product</li>
                   <li>• Mention how long you&apos;ve been using it</li>
                   <li>• Describe any benefits or side effects you noticed</li>
                   <li>• Include details about packaging, delivery, etc.</li>
                  </ul>
                </div>
              </Card>
            ))}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={handleSkipReview}
                className="flex-1"
              >
                Skip Review
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitReview}
                disabled={!hasReviews || !allReviewsComplete || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>

            {/* Review Guidelines */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Review Guidelines</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Do&apos;s:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Be honest and authentic</li>
                    <li>• Share your personal experience</li>
                    <li>• Include both pros and cons</li>
                    <li>• Be respectful and constructive</li>
                    <li>• Mention how long you used the product</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Don&apos;ts:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                                         <li>• Don&apos;t include personal information</li>
                     <li>• Don&apos;t make false claims</li>
                     <li>• Don&apos;t use offensive language</li>
                     <li>• Don&apos;t review products you haven&apos;t used</li>
                     <li>• Don&apos;t include promotional content</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
