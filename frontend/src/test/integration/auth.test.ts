import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import SignIn from "../../components/auth/SignIn";
import SignUp from "../../components/auth/SignUp";

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
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: "",
  pathname: "",
  search: "",
  hash: "",
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    mockLocation.href = "";
    mockLocation.assign.mockClear();
    mockLocation.replace.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Sign Up Flow", () => {
    it("should successfully register a new user", async () => {
      const user = userEvent.setup();

      // Mock successful registration response
      const mockResponse = {
        ok: true,
        json: async () => ({
          user: {
            id: "123",
            email: "test@example.com",
            name: "John Doe",
          },
          token: "mock-jwt-token",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      renderWithRouter(<SignUp />);

      // Fill out the form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(
        /confirm your password/i
      );
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(termsCheckbox);
      await user.click(submitButton);

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "John Doe",
            email: "test@example.com",
            password: "password123",
          }),
        }
      );

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText("Creating account...")).toBeInTheDocument();
      });

      // Verify success (in a real app, this would redirect or show success message)
      await waitFor(() => {
        expect(
          screen.queryByText("Creating account...")
        ).not.toBeInTheDocument();
      });
    });

    it("should handle registration with existing email", async () => {
      const user = userEvent.setup();

      // Mock error response
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          error: "Email already registered",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      renderWithRouter(<SignUp />);

      // Fill out the form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(
        /confirm your password/i
      );
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(termsCheckbox);
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(
          screen.getByText("Email already registered")
        ).toBeInTheDocument();
      });
    });

    it("should handle network errors during registration", async () => {
      const user = userEvent.setup();

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderWithRouter(<SignUp />);

      // Fill out the form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(
        /confirm your password/i
      );
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(termsCheckbox);
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });
  });

  describe("Sign In Flow", () => {
    it("should successfully authenticate a user", async () => {
      const user = userEvent.setup();

      // Mock successful login response
      const mockResponse = {
        ok: true,
        json: async () => ({
          user: {
            id: "123",
            email: "test@example.com",
            name: "John Doe",
          },
          token: "mock-jwt-token",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      renderWithRouter(<SignIn />);

      // Fill out the form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }
      );

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText("Signing in...")).toBeInTheDocument();
      });

      // Verify success
      await waitFor(() => {
        expect(screen.queryByText("Signing in...")).not.toBeInTheDocument();
      });
    });

    it("should handle invalid credentials", async () => {
      const user = userEvent.setup();

      // Mock error response
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          error: "Invalid credentials",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      renderWithRouter(<SignIn />);

      // Fill out the form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("should handle server errors during login", async () => {
      const user = userEvent.setup();

      // Mock server error
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({
          error: "Server error",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      renderWithRouter(<SignIn />);

      // Fill out the form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation Integration", () => {
    it("should validate form fields before submission", async () => {
      const user = userEvent.setup();

      renderWithRouter(<SignUp />);

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      // Verify validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });

      // Verify no API call was made
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should clear validation errors when user starts typing", async () => {
      const user = userEvent.setup();

      renderWithRouter(<SignUp />);

      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Trigger validation error
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(nameInput, "John");

      await waitFor(() => {
        expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("Password Visibility Toggle", () => {
    it("should toggle password visibility in sign up form", async () => {
      const user = userEvent.setup();

      renderWithRouter(<SignUp />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(
        /confirm your password/i
      );
      const toggleButtons = screen.getAllByLabelText(
        /toggle password visibility/i
      );

      // Initially passwords should be hidden
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Toggle first password
      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Toggle second password
      await user.click(toggleButtons[1]);
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(confirmPasswordInput).toHaveAttribute("type", "text");

      // Toggle back
      await user.click(toggleButtons[0]);
      await user.click(toggleButtons[1]);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    it("should toggle password visibility in sign in form", async () => {
      const user = userEvent.setup();

      renderWithRouter(<SignIn />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButton = screen.getByLabelText(/toggle password visibility/i);

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute("type", "password");

      // Toggle password visibility
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      // Toggle back
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Navigation Integration", () => {
    it("should navigate between sign in and sign up pages", async () => {
      const user = userEvent.setup();

      renderWithRouter(<SignIn />);

      // Check that we're on sign in page
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();

      // Click link to go to sign up
      const signUpLink = screen.getByRole("link", {
        name: /create new account/i,
      });
      expect(signUpLink).toHaveAttribute("href", "/signup");
    });

    it("should have proper links in sign up page", async () => {
      renderWithRouter(<SignUp />);

      // Check that we're on sign up page
      expect(screen.getByText("Join Vettly")).toBeInTheDocument();
      expect(screen.getByText("Create your account")).toBeInTheDocument();

      // Check for sign in link
      const signInLink = screen.getByRole("link", {
        name: /sign in to your account/i,
      });
      expect(signInLink).toHaveAttribute("href", "/signin");
    });
  });

  describe("Loading States", () => {
    it("should show loading state during API calls", async () => {
      const user = userEvent.setup();

      // Mock a delayed response
      let resolvePromise: (value: any) => void;
      const mockResponse = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(mockResponse);

      renderWithRouter(<SignIn />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Verify loading state
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ user: { id: "123" }, token: "mock-token" }),
      });

      // Verify loading state is cleared
      await waitFor(() => {
        expect(screen.queryByText("Signing in...")).not.toBeInTheDocument();
      });
    });
  });
});
