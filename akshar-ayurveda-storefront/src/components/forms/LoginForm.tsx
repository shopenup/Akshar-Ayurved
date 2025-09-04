import React, { useState } from 'react';
import { Input, Button, Card } from '../ui';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  loading?: boolean;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  onForgotPassword,
  onSignUp,
  className = '',
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
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
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email || ''}
          required
          fullWidth
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
                        error={errors.password || ''}
          required
          fullWidth
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-green-600 hover:text-green-500"
            >
              Forgot your password?
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        {onSignUp && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSignUp}
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </form>
    </Card>
  );
};

export default LoginForm;
