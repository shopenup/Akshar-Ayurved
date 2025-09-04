import React, { useState } from 'react';
import { Input, Button, Card } from '../ui';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  loading?: boolean;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  loading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className={className} >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            fullWidth
          />
          
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            fullWidth
          />
          
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            error={errors.subject}
            required
            fullWidth
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className={`block w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.message 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
            placeholder="Tell us how we can help you..."
            required
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Sending Message...' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;
