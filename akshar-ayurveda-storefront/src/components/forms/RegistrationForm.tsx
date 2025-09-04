import React, { useState } from 'react';
import { Input, Button, Card, Checkbox } from '../ui';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
  loading?: boolean;
  onLogin?: () => void;
  className?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  loading = false,
  onLogin,
  className = '',
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
    subscribeToNewsletter: false,
  });

  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});

  const handleChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
    <Card className={className}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join us and start your shopping journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            required
            fullWidth
          />
          
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            required
            fullWidth
          />
        </div>

        {/* Email */}
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

        {/* Phone */}
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
          fullWidth
        />

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
            fullWidth
          />
          
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
            fullWidth
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <Checkbox
            checked={formData.agreeToTerms}
            onChange={(checked) => handleChange('agreeToTerms', checked)}
            label="I agree to the Terms and Conditions and Privacy Policy"
            required
          />
          
          <Checkbox
            checked={formData.subscribeToNewsletter}
            onChange={(checked) => handleChange('subscribeToNewsletter', checked)}
            label="Subscribe to our newsletter for updates and offers"
          />
        </div>

        {errors.agreeToTerms && (
          <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        {onLogin && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onLogin}
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </form>
    </Card>
  );
};

export default RegistrationForm;
