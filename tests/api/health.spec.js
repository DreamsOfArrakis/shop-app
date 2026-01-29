const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app';

test.describe('Health API Tests', () => {
  test('GET /api/health should return 200 with correct structure', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('service', 'the-furniture-store-app');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('buildTime');
    
    // Verify timestamp is valid ISO string
    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  test('GET /api/health should have correct cache headers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    
    const headers = response.headers();
    
    // Verify cache control headers prevent caching
    expect(headers['cache-control']).toContain('no-store');
    expect(headers['cache-control']).toContain('no-cache');
    expect(headers['cache-control']).toContain('must-revalidate');
    
    // Verify content type
    expect(headers['content-type']).toContain('application/json');
  });

  test('GET /api/health should return quickly (performance test)', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/health`);
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    
    // Health check should respond quickly (under 1 second)
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000);
  });

  test('GET /api/health should be idempotent', async ({ request }) => {
    // Make multiple requests and verify consistent responses
    const responses = await Promise.all([
      request.get(`${BASE_URL}/api/health`),
      request.get(`${BASE_URL}/api/health`),
      request.get(`${BASE_URL}/api/health`),
    ]);
    
    const bodies = await Promise.all(responses.map(r => r.json()));
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // All should have same structure (timestamps may differ slightly)
    bodies.forEach(body => {
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('service', 'the-furniture-store-app');
    });
  });
});

