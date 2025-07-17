import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../common/Button';
import Input from '../common/Input';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement actual sign up logic
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign up');
      }

      const data = await response.json();
      // TODO: Handle successful sign up (store token, redirect, etc.)
      console.log('Sign up successful:', data);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Already have an account?"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{errors.general}</div>
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          name="name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          fullWidth
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          fullWidth
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          fullWidth
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          fullWidth
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Sign up
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp; 