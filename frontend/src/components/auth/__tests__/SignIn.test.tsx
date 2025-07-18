import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import userEvent from '@testing-library/user-event';
import SignIn from '../SignIn';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SignIn Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders sign-in form correctly', () => {
    render(<SignIn />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({ user: { id: 1, email: 'test@example.com' }, token: 'fake-token' })
    };
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
  });

  it('displays loading state during form submission', async () => {
    const user = userEvent.setup();
    const mockResponse = new Promise(resolve => 
      setTimeout(() => resolve({ 
        ok: true, 
        json: async () => ({ user: { id: 1 }, token: 'fake-token' }) 
      }), 100)
    );
    mockFetch.mockReturnValueOnce(mockResponse);
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    };
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('clears field errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Submit empty form to trigger validation
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Start typing in email field
    await user.type(emailInput, 'test@example.com');
    
    // Error should be cleared
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('has links to sign up and forgot password', () => {
    render(<SignIn />);
    
    expect(screen.getByRole('link', { name: /create new account/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('has remember me checkbox', () => {
    render(<SignIn />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox).toHaveAttribute('type', 'checkbox');
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
}); 