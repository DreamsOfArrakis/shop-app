const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app';

test.describe('Debug API Tests', () => {
  test('GET /api/debug should return 200 with debug information', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('environment');
    expect(body).toHaveProperty('tests');
    
    // Verify timestamp is valid ISO string
    expect(() => new Date(body.timestamp)).not.toThrow();
  });

  test('GET /api/debug should include environment information', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    // Verify environment object structure
    expect(body.environment).toHaveProperty('hasDatabaseUrl');
    expect(body.environment).toHaveProperty('hasSupabaseUrl');
    expect(body.environment).toHaveProperty('hasSupabaseAnonKey');
    expect(body.environment).toHaveProperty('hasSupabaseProjectRef');
    
    // Verify environment values are booleans
    expect(typeof body.environment.hasDatabaseUrl).toBe('boolean');
    expect(typeof body.environment.hasSupabaseUrl).toBe('boolean');
    expect(typeof body.environment.hasSupabaseAnonKey).toBe('boolean');
    expect(typeof body.environment.hasSupabaseProjectRef).toBe('boolean');
  });

  test('GET /api/debug should include test results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    // Verify tests object exists
    expect(body.tests).toBeDefined();
    expect(typeof body.tests).toBe('object');
    
    // Verify specific test results exist
    expect(body.tests).toHaveProperty('graphqlEndpoint');
    expect(body.tests).toHaveProperty('urqlQuery');
    expect(body.tests).toHaveProperty('collectionsQuery');
    expect(body.tests).toHaveProperty('restEndpoint');
    expect(body.tests).toHaveProperty('productQuery');
  });

  test('GET /api/debug should have GraphQL endpoint test results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    const graphqlTest = body.tests.graphqlEndpoint;
    
    // Verify GraphQL test structure
    expect(graphqlTest).toHaveProperty('status');
    expect(graphqlTest).toHaveProperty('ok');
    expect(graphqlTest).toHaveProperty('url');
    
    // Status should be a number
    expect(typeof graphqlTest.status).toBe('number');
    expect(typeof graphqlTest.ok).toBe('boolean');
  });

  test('GET /api/debug should have URQL query test results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    const urqlTest = body.tests.urqlQuery;
    
    // Verify URQL test structure
    expect(urqlTest).toHaveProperty('success');
    expect(urqlTest).toHaveProperty('hasData');
    
    expect(typeof urqlTest.success).toBe('boolean');
    expect(typeof urqlTest.hasData).toBe('boolean');
  });

  test('GET /api/debug should have collections query test results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    const collectionsTest = body.tests.collectionsQuery;
    
    // Verify collections test structure
    expect(collectionsTest).toHaveProperty('status');
    expect(collectionsTest).toHaveProperty('ok');
    
    expect(typeof collectionsTest.status).toBe('number');
    expect(typeof collectionsTest.ok).toBe('boolean');
  });

  test('GET /api/debug should have REST endpoint test results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    const restTest = body.tests.restEndpoint;
    
    // Verify REST test structure
    expect(restTest).toHaveProperty('status');
    expect(restTest).toHaveProperty('ok');
    expect(restTest).toHaveProperty('url');
    
    expect(typeof restTest.status).toBe('number');
    expect(typeof restTest.ok).toBe('boolean');
  });

  test('GET /api/debug should have product query test results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    const body = await response.json();
    
    const productTest = body.tests.productQuery;
    
    // Verify product test structure
    expect(productTest).toHaveProperty('status');
    expect(productTest).toHaveProperty('ok');
    
    expect(typeof productTest.status).toBe('number');
    expect(typeof productTest.ok).toBe('boolean');
  });

  test('GET /api/debug should return JSON content type', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug`);
    
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('GET /api/debug should be idempotent', async ({ request }) => {
    // Make multiple requests and verify consistent structure
    const responses = await Promise.all([
      request.get(`${BASE_URL}/api/debug`),
      request.get(`${BASE_URL}/api/debug`),
    ]);
    
    const bodies = await Promise.all(responses.map(r => r.json()));
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // All should have same structure
    bodies.forEach(body => {
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('tests');
    });
  });
});

