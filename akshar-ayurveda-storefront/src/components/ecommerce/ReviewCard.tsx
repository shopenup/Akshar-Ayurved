import React from 'react';
import Image from 'next/image';
import { Card, Badge } from '../ui';

interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  verified?: boolean;
  helpful?: number;
  images?: string[];
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpful,
  onReport,
  className = '',
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className={className}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{review.author}</h4>
              {review.verified && (
                <Badge variant="success" size="sm">
                  Verified Purchase
                </Badge>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">{review.rating}/5</span>
            </div>
          </div>
          
          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
        </div>

        {/* Title */}
        {review.title && (
          <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
        )}

        {/* Comment */}
        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {onHelpful && (
              <button
                onClick={() => onHelpful(review.id)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Helpful {review.helpful ? `(${review.helpful})` : ''}
              </button>
            )}
          </div>
          
          {onReport && (
            <button
              onClick={() => onReport(review.id)}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Report
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;
