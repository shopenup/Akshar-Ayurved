import React, { useState } from 'react';
import { Button, Input } from './index';

interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  background?: 'green' | 'white' | 'gray';
  className?: string;
  onSubmit?: (email: string) => void;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  title = "Subscribe to our newsletter",
  subtitle = "Get the latest updates on new products and special offers",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  background = 'green',
  className = '',
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const getBackgroundClasses = () => {
    switch (background) {
      case 'green':
        return 'bg-green-800 text-white';
      case 'white':
        return 'bg-white text-gray-900';
      case 'gray':
        return 'bg-gray-100 text-gray-900';
      default:
        return 'bg-green-800 text-white';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      if (onSubmit) {
        onSubmit(email);
      }
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`py-16 ${getBackgroundClasses()} ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        {subtitle && (
          <p className="text-lg mb-8 opacity-90">{subtitle}</p>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                className={`${
                  background === 'white' 
                    ? 'border-gray-300 bg-white text-gray-900' 
                    : 'border-white bg-transparent text-white placeholder-white placeholder-opacity-75'
                }`}
              />
            </div>
            <Button
              type="submit"
              variant={background === 'green' ? 'outline' : 'primary'}
              size="sm"
              disabled={isSubmitting}
              className={background === 'green' ? 'border-white text-white hover:bg-white hover:text-green-800' : ''}
            >
              {isSubmitting ? 'Subscribing...' : buttonText}
            </Button>
          </div>
          
          {message && (
            <p className={`mt-4 text-sm ${
              message.includes('Thank you') 
                ? 'text-green-300' 
                : 'text-red-300'
            }`}>
              {message}
            </p>
          )}
        </form>
        
        <p className="text-sm opacity-75 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
