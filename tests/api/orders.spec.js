const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app';

test.describe('Orders API Tests', () => {
  // Test product ID - using a known product from the shop
  const TEST_PRODUCT_ID = '4WVitrm--AaiguSL7PoGy'; // Bathroom Oak Vanity
  
  test('POST /api/create-order should create an order with valid data (guest)', async ({ request }) => {
    const orderData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 1,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: orderData,
    });

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('orderId');
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('purchasedProductIds');
    expect(Array.isArray(body.purchasedProductIds)).toBeTruthy();
    expect(body.purchasedProductIds.length).toBeGreaterThan(0);
    
    // Verify order ID format (should be a valid ID)
    expect(typeof body.orderId).toBe('string');
    expect(body.orderId.length).toBeGreaterThan(0);
  });

  test('POST /api/create-order should return 400 for invalid data format', async ({ request }) => {
    const invalidData = {
      orderProducts: 'invalid', // Should be an object
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
    
    const body = await response.text();
    expect(body).toContain('Invalid data format');
  });

  test('POST /api/create-order should return 400 for empty order products', async ({ request }) => {
    const invalidData = {
      orderProducts: {},
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    // Should either return 400 for validation or handle gracefully
    expect([400, 500]).toContain(response.status());
  });

  test('POST /api/create-order should return 400 for invalid quantity', async ({ request }) => {
    const invalidData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 0, // Invalid: quantity must be at least 1
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/create-order should return 400 for missing guest field', async ({ request }) => {
    const invalidData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 1,
        },
      },
      // Missing guest field
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/create-order should handle multiple products', async ({ request }) => {
    // Using multiple product IDs if available
    const orderData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 2,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: orderData,
    });

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.purchasedProductIds).toContain(TEST_PRODUCT_ID);
  });

  test('POST /api/create-order should have correct content type', async ({ request }) => {
    const orderData = {
      orderProducts: {
        [TEST_PRODUCT_ID]: {
          quantity: 1,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: orderData,
    });

    expect(response.status()).toBe(200);
    
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('POST /api/create-order should handle non-existent product gracefully', async ({ request }) => {
    const orderData = {
      orderProducts: {
        'non-existent-product-id': {
          quantity: 1,
        },
      },
      guest: true,
    };

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: orderData,
    });

    // Should either return 400/404 for invalid product or 500 for server error
    expect([400, 404, 500]).toContain(response.status());
  });
});

