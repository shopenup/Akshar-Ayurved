/**
 * Utility functions for consistent date formatting across the application
 * This prevents hydration errors between server and client rendering
 */

/**
 * Format date consistently for display
 * Uses US format (MMM DD, YYYY) to ensure server-client consistency
 */
export const formatDate = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date with time for detailed display
 */
export const formatDateTime = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid Date';
  }
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (dateString: string | Date): boolean => {
  try {
    const date = new Date(dateString);
    return date > new Date();
  } catch (error) {
    console.error('Error checking future date:', error);
    return false;
  }
};

/**
 * Get days until date
 */
export const getDaysUntil = (dateString: string | Date): number => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error getting days until:', error);
    return 0;
  }
};
