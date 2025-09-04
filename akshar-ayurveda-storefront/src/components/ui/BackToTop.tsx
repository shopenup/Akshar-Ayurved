import React, { useState, useEffect } from 'react';

interface BackToTopProps {
  className?: string;
  showAfter?: number; // Pixels to scroll before showing the button
}

const BackToTop: React.FC<BackToTopProps> = ({
  className = '',
  showAfter = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > showAfter);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${className}`}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

export default BackToTop;
