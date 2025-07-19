import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto("http://localhost:5173");
  });

  test.describe("Sign Up Flow", () => {
    test("should successfully register a new user", async ({ page }) => {
      // Navigate to sign up page
      await page.goto("http://localhost:5173/signup");

      // Fill out the registration form
      await page.fill('[for="name"]', "John Doe");
      await page.fill('[for="email"]', `test-${Date.now()}@example.com`);
      await page.fill('[placeholder="Enter your password"]', "password123");
      await page.fill('[placeholder="Confirm your password"]', "password123");
      await page.check('[for="terms"]');

      // Mock the API response
      await page.route("**/api/auth/register", async (route) => {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "123",
              email: "test@example.com",
              name: "John Doe",
            },
            token: "mock-jwt-token",
          }),
        });
      });

      // Submit the form
      await page.click('button[type="submit"]');

      // Verify loading state appears
      await expect(page.locator("text=Creating account...")).toBeVisible();

      // Verify success (in a real app, this would redirect)
      await expect(page.locator("text=Creating account...")).not.toBeVisible();
    });

    test("should show validation errors for invalid input", async ({
      page,
    }) => {
      await page.goto("http://localhost:5173/signup");

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Verify validation errors
      await expect(page.locator("text=Name is required")).toBeVisible();
      await expect(page.locator("text=Email is required")).toBeVisible();
      await expect(page.locator("text=Password is required")).toBeVisible();
    });

    test("should handle existing email error", async ({ page }) => {
      await page.goto("http://localhost:5173/signup");

      // Fill out the form
      await page.fill('[for="name"]', "John Doe");
      await page.fill('[for="email"]', "existing@example.com");
      await page.fill('[placeholder="Enter your password"]', "password123");
      await page.fill('[placeholder="Confirm your password"]', "password123");
      await page.check('[for="terms"]');

      // Mock error response
      await page.route("**/api/auth/register", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Email already registered",
          }),
        });
      });

      // Submit the form
      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator("text=Email already registered")).toBeVisible();
    });

    test("should handle network errors", async ({ page }) => {
      await page.goto("http://localhost:5173/signup");

      // Fill out the form
      await page.fill('[for="name"]', "John Doe");
      await page.fill('[for="email"]', "test@example.com");
      await page.fill('[placeholder="Enter your password"]', "password123");
      await page.fill('[placeholder="Confirm your password"]', "password123");
      await page.check('[for="terms"]');

      // Mock network error
      await page.route("**/api/auth/register", async (route) => {
        await route.abort();
      });

      // Submit the form
      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator("text=An error occurred")).toBeVisible();
    });

    test("should toggle password visibility", async ({ page }) => {
      await page.goto("http://localhost:5173/signup");

      const passwordInput = page.locator('[placeholder="Enter your password"]');
      const confirmPasswordInput = page.locator(
        '[placeholder="Confirm your password"]'
      );
      const toggleButtons = page.locator(
        '[aria-label="Toggle password visibility"]'
      );

      // Initially passwords should be hidden
      await expect(passwordInput).toHaveAttribute("type", "password");
      await expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Toggle first password
      await toggleButtons.first().click();
      await expect(passwordInput).toHaveAttribute("type", "text");
      await expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Toggle second password
      await toggleButtons.nth(1).click();
      await expect(passwordInput).toHaveAttribute("type", "text");
      await expect(confirmPasswordInput).toHaveAttribute("type", "text");

      // Toggle back
      await toggleButtons.first().click();
      await toggleButtons.nth(1).click();
      await expect(passwordInput).toHaveAttribute("type", "password");
      await expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });
  });

  test.describe("Sign In Flow", () => {
    test("should successfully authenticate a user", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      // Fill out the login form
      await page.fill('[for="email"]', "test@example.com");
      await page.fill('[placeholder="Enter your password"]', "password123");

      // Mock successful login response
      await page.route("**/api/auth/login", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "123",
              email: "test@example.com",
              name: "John Doe",
            },
            token: "mock-jwt-token",
          }),
        });
      });

      // Submit the form
      await page.click('button[type="submit"]');

      // Verify loading state
      await expect(page.locator("text=Signing in...")).toBeVisible();

      // Verify success
      await expect(page.locator("text=Signing in...")).not.toBeVisible();
    });

    test("should handle invalid credentials", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      // Fill out the form
      await page.fill('[for="email"]', "test@example.com");
      await page.fill('[placeholder="Enter your password"]', "wrongpassword");

      // Mock error response
      await page.route("**/api/auth/login", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Invalid credentials",
          }),
        });
      });

      // Submit the form
      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator("text=Invalid credentials")).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Verify validation errors
      await expect(page.locator("text=Email is required")).toBeVisible();
      await expect(page.locator("text=Password is required")).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      // Enter invalid email
      await page.fill('[for="email"]', "invalid-email");
      await page.fill('[placeholder="Enter your password"]', "password123");

      // Submit the form
      await page.click('button[type="submit"]');

      // Verify validation error
      await expect(
        page.locator("text=Please enter a valid email")
      ).toBeVisible();
    });

    test("should toggle password visibility", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      const passwordInput = page.locator('[placeholder="Enter your password"]');
      const toggleButton = page.locator(
        '[aria-label="Toggle password visibility"]'
      );

      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Toggle password visibility
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Toggle back
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  test.describe("Navigation", () => {
    test("should navigate between sign in and sign up pages", async ({
      page,
    }) => {
      // Start on sign in page
      await page.goto("http://localhost:5173/signin");

      // Verify we're on sign in page
      await expect(page.locator("text=Welcome Back")).toBeVisible();
      await expect(page.locator("text=Sign in to your account")).toBeVisible();

      // Click link to go to sign up
      await page.click("text=Create New Account");

      // Verify we're on sign up page
      await expect(page.locator("text=Join Vettly")).toBeVisible();
      await expect(page.locator("text=Create your account")).toBeVisible();

      // Click link to go back to sign in
      await page.click("text=Sign In to Your Account");

      // Verify we're back on sign in page
      await expect(page.locator("text=Welcome Back")).toBeVisible();
    });

    test("should navigate from navbar", async ({ page }) => {
      await page.goto("http://localhost:5173");

      // Click sign in button in navbar
      await page.click("text=Sign In");

      // Verify we're on sign in page
      await expect(page.locator("text=Welcome Back")).toBeVisible();
    });
  });

  test.describe("Form Interactions", () => {
    test("should clear validation errors when user starts typing", async ({
      page,
    }) => {
      await page.goto("http://localhost:5173/signup");

      // Trigger validation error
      await page.click('button[type="submit"]');
      await expect(page.locator("text=Name is required")).toBeVisible();

      // Start typing in name field
      await page.fill('[for="name"]', "John");

      // Verify error is cleared
      await expect(page.locator("text=Name is required")).not.toBeVisible();
    });

    test("should disable submit button during loading", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      // Fill out the form
      await page.fill('[for="email"]', "test@example.com");
      await page.fill('[placeholder="Enter your password"]', "password123");

      // Mock a delayed response
      await page.route("**/api/auth/login", async (route) => {
        // Delay the response
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: { id: "123" },
            token: "mock-token",
          }),
        });
      });

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Verify button is disabled during loading
      await expect(submitButton).toBeDisabled();
      await expect(page.locator("text=Signing in...")).toBeVisible();

      // Wait for response and verify button is enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("http://localhost:5173/signup");

      // Check for password toggle button labels
      const toggleButtons = page.locator(
        '[aria-label="Toggle password visibility"]'
      );
      await expect(toggleButtons).toHaveCount(2);

      // Check for form labels
      await expect(page.locator('[for="name"]')).toBeVisible();
      await expect(page.locator('[for="email"]')).toBeVisible();
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.goto("http://localhost:5173/signin");

      // Tab through form elements
      await page.keyboard.press("Tab");
      await expect(page.locator('[for="email"]')).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.locator('[placeholder="Enter your password"]')
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("http://localhost:5173/signup");

      // Verify form is still accessible
      await expect(page.locator("text=Join Vettly")).toBeVisible();
      await expect(page.locator('[for="name"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Test form interaction on mobile
      await page.fill('[for="name"]', "John Doe");
      await page.fill('[for="email"]', "test@example.com");
      await page.fill('[placeholder="Enter your password"]', "password123");
      await page.fill('[placeholder="Confirm your password"]', "password123");
      await page.check('[for="terms"]');

      // Verify form data is entered correctly
      await expect(page.locator('[for="name"]')).toHaveValue("John Doe");
      await expect(page.locator('[for="email"]')).toHaveValue(
        "test@example.com"
      );
    });
  });
});
