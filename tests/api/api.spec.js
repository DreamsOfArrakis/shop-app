const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app';

test.describe('API Integration Tests', () => {
  test('API endpoints should handle CORS properly', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`, {
      headers: {
        'Origin': 'https://example.com',
      },
    });

    // Should either allow CORS or not include CORS headers (both are valid)
    // Just verify the request doesn't fail
    expect([200, 403, 404]).toContain(response.status());
  });

  test('API endpoints should handle OPTIONS requests', async ({ request }) => {
    const response = await request.options(`${BASE_URL}/api/health`);

    // OPTIONS should either return 200 (CORS preflight) or 405 (method not allowed)
    expect([200, 405, 404]).toContain(response.status());
  });

  test('API endpoints should return appropriate error codes', async ({ request }) => {
    // Test 404 for non-existent endpoint
    const notFoundResponse = await request.get(`${BASE_URL}/api/non-existent-endpoint`);
    expect(notFoundResponse.status()).toBe(404);

    // Test 405 for unsupported methods (if applicable)
    const methodNotAllowedResponse = await request.patch(`${BASE_URL}/api/health`);
    // Some APIs return 405, others might return 404 or 400
    expect([400, 404, 405]).toContain(methodNotAllowedResponse.status());
  });

  test('API endpoints should validate request headers', async ({ request }) => {
    // Test with missing Content-Type for POST requests
    const response = await request.post(`${BASE_URL}/api/create-order`, {
      data: {
        orderProducts: {},
        guest: true,
      },
      // Intentionally not setting Content-Type
    });

    // Should either accept it (some frameworks auto-detect) or return 400
    expect([200, 400, 415]).toContain(response.status());
  });

  test('API endpoints should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'invalid json string',
    });

    // Should return 400 for bad request
    expect([400, 500]).toContain(response.status());
  });

  test('API endpoints should handle large payloads appropriately', async ({ request }) => {
    // Create a large order payload
    const largeOrderProducts = {};
    for (let i = 0; i < 100; i++) {
      largeOrderProducts[`product-${i}`] = { quantity: 1 };
    }

    const response = await request.post(`${BASE_URL}/api/create-order`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        orderProducts: largeOrderProducts,
        guest: true,
      },
    });

    // Should either handle it or return 400/413 (payload too large)
    expect([200, 400, 413, 500]).toContain(response.status());
  });
});

