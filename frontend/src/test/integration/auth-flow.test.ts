import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockApiCall, mockApiError, mockNetworkError, clearMocks, createMockAuthResponse } from '../utils/test-utils';
import SignIn from '../../components/auth/SignIn';
import SignUp from '../../components/auth/SignUp';

describe('Complete Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    clearMocks();
  });

  afterEach(() => {
    clearMocks();
  });

  describe('Complete User Journey', () => {
    it('should handle complete signup to signin flow', async () => {
      const user = userEvent.setup();

      // Step 1: User visits signup page and registers
      const { rerender } = render(<SignUp />);

      // Fill out signup form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const signUpButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'securepassword123');
      await user.type(confirmPasswordInput, 'securepassword123');
      await user.click(termsCheckbox);

      // Mock successful registration
      mockApiCall('http://localhost:3000/api/auth/register', {
        ok: true,
        status: 201,
        json: async () => ({
          user: {
            id: '123',
            email: 'john.doe@example.com',
            name: 'John Doe'
          },
          token: 'mock-jwt-token-123'
        })
      });

      await user.click(signUpButton);

      // Verify loading state and success
      await waitFor(() => {
        expect(screen.getByText('Creating account...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
      });

      // Step 2: User navigates to signin page (simulate navigation)
      rerender(<SignIn />);

      // Fill out signin form with the same credentials
      const signInEmailInput = screen.getByLabelText(/email address/i);
      const signInPasswordInput = screen.getByPlaceholderText(/enter your password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(signInEmailInput, 'john.doe@example.com');
      await user.type(signInPasswordInput, 'securepassword123');

      // Mock successful login
      mockApiCall('http://localhost:3000/api/auth/login', {
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            id: '123',
            email: 'john.doe@example.com',
            name: 'John Doe'
          },
          token: 'mock-jwt-token-123'
        })
      });

      await user.click(signInButton);

      // Verify loading state and success
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      });
    });

    it('should handle failed signup followed by successful signin', async () => {
      const user = userEvent.setup();

      // Step 1: User tries to register with existing email
      const { rerender } = render(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const signUpButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(termsCheckbox);

      // Mock registration failure
      mockApiError('http://localhost:3000/api/auth/register', 'Email already registered', 400);

      await user.click(signUpButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });

      // Step 2: User navigates to signin and successfully logs in
      rerender(<SignIn />);

      const signInEmailInput = screen.getByLabelText(/email address/i);
      const signInPasswordInput = screen.getByPlaceholderText(/enter your password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(signInEmailInput, 'existing@example.com');
      await user.type(signInPasswordInput, 'password123');

      // Mock successful login
      mockApiCall('http://localhost:3000/api/auth/login', {
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            id: '456',
            email: 'existing@example.com',
            name: 'Existing User'
          },
          token: 'mock-jwt-token-456'
        })
      });

      await user.click(signInButton);

      // Verify success
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle network errors and allow retry', async () => {
      const user = userEvent.setup();

      render(<SignUp />);

      // Fill out form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(termsCheckbox);

      // Mock network error
      mockNetworkError('http://localhost:3000/api/auth/register');

      await user.click(submitButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Mock successful retry
      mockApiCall('http://localhost:3000/api/auth/register', createMockAuthResponse());

      await user.click(submitButton);

      // Verify success on retry
      await waitFor(() => {
        expect(screen.getByText('Creating account...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
      });
    });

    it('should handle server errors and show appropriate messages', async () => {
      const user = userEvent.setup();

      render(<SignIn />);

      // Fill out form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Mock server error
      mockApiError('http://localhost:3000/api/auth/login', 'Internal server error', 500);

      await user.click(submitButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state during validation errors', async () => {
      const user = userEvent.setup();

      render(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Fill out form partially
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      // Don't fill confirm password or check terms

      await user.click(submitButton);

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText('Password confirmation is required')).toBeInTheDocument();
        expect(screen.getByText('You must accept the terms of service')).toBeInTheDocument();
      });

      // Verify form data is preserved
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');

      // Fix validation errors
      await user.type(confirmPasswordInput, 'password123');
      await user.click(termsCheckbox);

      // Verify errors are cleared
      await waitFor(() => {
        expect(screen.queryByText('Password confirmation is required')).not.toBeInTheDocument();
        expect(screen.queryByText('You must accept the terms of service')).not.toBeInTheDocument();
      });
    });

    it('should handle password mismatch and clear on correction', async () => {
      const user = userEvent.setup();

      render(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Fill out form with mismatched passwords
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(termsCheckbox);

      await user.click(submitButton);

      // Verify password mismatch error
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      // Fix password mismatch
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'password123');

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('should provide proper focus management', async () => {
      const user = userEvent.setup();

      render(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Tab through form elements
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(confirmPasswordInput).toHaveFocus();

      await user.tab();
      expect(termsCheckbox).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should handle keyboard navigation for password toggles', async () => {
      const user = userEvent.setup();

      render(<SignUp />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButtons = screen.getAllByLabelText(/toggle password visibility/i);

      // Focus on password input
      await user.click(passwordInput);

      // Use keyboard to toggle password visibility
      await user.keyboard('{Tab}');
      expect(toggleButtons[0]).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.keyboard('{Enter}');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Performance and Loading States', () => {
    it('should handle slow network responses gracefully', async () => {
      const user = userEvent.setup();

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Mock a delayed response
      let resolvePromise: (value: any) => void;
      const mockResponse = new Promise(resolve => {
        resolvePromise = resolve;
      });

      // Mock the fetch to return our controlled promise
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockReturnValue(mockResponse);

      await user.click(submitButton);

      // Verify loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise after a delay
      setTimeout(() => {
        resolvePromise!({
          ok: true,
          json: async () => ({ user: { id: '123' }, token: 'mock-token' })
        });
      }, 1000);

      // Verify loading state is cleared
      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should prevent multiple submissions during loading', async () => {
      const user = userEvent.setup();

      render(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(termsCheckbox);

      // Mock a delayed response
      let resolvePromise: (value: any) => void;
      const mockResponse = new Promise(resolve => {
        resolvePromise = resolve;
      });

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockReturnValue(mockResponse);

      // Submit form
      await user.click(submitButton);

      // Try to submit again while loading
      await user.click(submitButton);

      // Verify only one API call was made
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ user: { id: '123' }, token: 'mock-token' })
      });

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
}); 