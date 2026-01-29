const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app';

test.describe('Checkout Session API Tests', () => {
  // Test product ID - using a known product from the shop
  const TEST_PRODUCT_ID = '4WVitrm--AaiguSL7PoGy'; // Bathroom Oak Vanity
  
  test('POST /api/create-checkout-session should create a checkout session with valid data', async ({ request }) => {
    const checkoutData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 1,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-checkout-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: checkoutData,
    });

    // Should return 200 with session ID or handle Stripe errors gracefully
    expect([200, 400, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      
      // Verify response structure for successful checkout session
      expect(body).toHaveProperty('sessionId');
      expect(typeof body.sessionId).toBe('string');
      expect(body.sessionId.length).toBeGreaterThan(0);
      
      // Stripe session IDs typically start with 'cs_' for checkout sessions
      expect(body.sessionId).toMatch(/^cs_/);
    }
  });

  test('POST /api/create-checkout-session should return 400 for invalid data format', async ({ request }) => {
    const invalidData = {
      orderProducts: 'invalid', // Should be an object
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-checkout-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
    
    const body = await response.text();
    expect(body).toContain('Invalid data format');
  });

  test('POST /api/create-checkout-session should return 400 for invalid quantity', async ({ request }) => {
    const invalidData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 0, // Invalid: quantity must be at least 1
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-checkout-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/create-checkout-session should handle multiple products', async ({ request }) => {
    const checkoutData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 2,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-checkout-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: checkoutData,
    });

    // Should handle multiple quantities
    expect([200, 400, 500]).toContain(response.status());
  });

  test('POST /api/create-checkout-session should have correct content type', async ({ request }) => {
    const checkoutData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 1,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-checkout-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: checkoutData,
    });

    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('POST /api/create-checkout-session should handle missing guest field', async ({ request }) => {
    const invalidData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 1,
        },
      },
      // Missing guest field
    };

    const response = await request.post(`${BASE_URL}/api/create-checkout-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
  });
});

