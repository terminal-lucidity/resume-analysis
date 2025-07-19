import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test data helpers
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'John Doe',
  ...overrides,
});

export const createMockAuthResponse = (overrides = {}) => ({
  user: createMockUser(),
  token: 'mock-jwt-token',
  ...overrides,
});

export const createMockErrorResponse = (error = 'An error occurred', status = 400) => ({
  ok: false,
  status,
  json: async () => ({ error }),
});

export const createMockSuccessResponse = (data = createMockAuthResponse()) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

// API mocking helpers
export const mockApiCall = (url: string, response: any) => {
  mockFetch.mockResolvedValueOnce(response);
};

export const mockApiError = (url: string, error: string, status = 400) => {
  mockFetch.mockResolvedValueOnce(createMockErrorResponse(error, status));
};

export const mockNetworkError = (url: string) => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));
};

// Form testing helpers
export const fillSignUpForm = async (user: any, formData: any) => {
  const { getByLabelText, getByPlaceholderText, getByRole } = user;
  
  await user.type(getByLabelText(/full name/i), formData.name);
  await user.type(getByLabelText(/email address/i), formData.email);
  await user.type(getByPlaceholderText(/enter your password/i), formData.password);
  await user.type(getByPlaceholderText(/confirm your password/i), formData.confirmPassword);
  await user.click(getByLabelText(/terms of service/i));
};

export const fillSignInForm = async (user: any, formData: any) => {
  const { getByLabelText, getByPlaceholderText } = user;
  
  await user.type(getByLabelText(/email address/i), formData.email);
  await user.type(getByPlaceholderText(/enter your password/i), formData.password);
};

// Validation helpers
export const expectValidationErrors = (screen: any, errors: string[]) => {
  errors.forEach(error => {
    expect(screen.getByText(error)).toBeInTheDocument();
  });
};

export const expectNoValidationErrors = (screen: any, errors: string[]) => {
  errors.forEach(error => {
    expect(screen.queryByText(error)).not.toBeInTheDocument();
  });
};

// Cleanup helpers
export const clearMocks = () => {
  mockFetch.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  mockLocation.href = '';
  mockLocation.assign.mockClear();
  mockLocation.replace.mockClear();
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { mockFetch, localStorageMock, mockLocation }; 