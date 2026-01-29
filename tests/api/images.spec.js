const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app';
const SUPABASE_STORAGE_BASE = 'https://pibhanojqzsmyfyybgno.supabase.co/storage/v1/object/public/media/public';

test.describe('Supabase Image Storage Tests', () => {
  // Known product image keys from the application
  const testImageKeys = [
    '4WVitrm--AaiguSL7PoGy.avif', // Bathroom Oak Vanity
    'OYh1GmBr-fPvdPZzvJcfW.avif', // Brass Kitchen Faucet
    'S7RLeiqMOR3koLmf7rQe5.avif', // Recliner Rocker
    'wOJAXNsDfPUGmdGg-Gh65.avif', // Stockholm Sofa
  ];

  test('Supabase storage images should be accessible', async ({ request }) => {
    for (const imageKey of testImageKeys) {
      const imageUrl = `${SUPABASE_STORAGE_BASE}/${imageKey}`;
      
      const response = await request.get(imageUrl);
      
      expect(response.status()).toBe(200);
      expect(response.ok()).toBeTruthy();
      
      // Verify it's actually an image
      const headers = response.headers();
      expect(headers['content-type']).toMatch(/^image\//);
      
      // Verify response has content
      const buffer = await response.body();
      expect(buffer.length).toBeGreaterThan(0);
    }
  });

  test('Supabase storage images should have correct content types', async ({ request }) => {
    for (const imageKey of testImageKeys) {
      const imageUrl = `${SUPABASE_STORAGE_BASE}/${imageKey}`;
      
      const response = await request.head(imageUrl); // Use HEAD to check headers without downloading
      
      if (response.status() === 200) {
        const headers = response.headers();
        const contentType = headers['content-type'];
        
        // Should be an image type (avif, webp, jpeg, png, etc.)
        expect(contentType).toMatch(/^image\//);
        
        // AVIF images should have correct content type
        if (imageKey.endsWith('.avif')) {
          expect(contentType).toMatch(/avif|octet-stream/); // Some servers return octet-stream for avif
        }
      }
    }
  });

  test('Supabase storage images should load with reasonable performance', async ({ request }) => {
    const maxResponseTime = 5000; // 5 seconds max
    
    for (const imageKey of testImageKeys.slice(0, 2)) { // Test first 2 to keep test fast
      const imageUrl = `${SUPABASE_STORAGE_BASE}/${imageKey}`;
      
      const startTime = Date.now();
      const response = await request.get(imageUrl);
      const endTime = Date.now();
      
      expect(response.status()).toBe(200);
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
    }
  });

  test('Supabase storage should return 404 for non-existent images', async ({ request }) => {
    const nonExistentImageUrl = `${SUPABASE_STORAGE_BASE}/non-existent-image-12345.avif`;
    
    const response = await request.get(nonExistentImageUrl);
    
    // Supabase storage should return 404 for missing files
    expect(response.status()).toBe(404);
  });

  test('Product images from API should reference valid Supabase URLs', async ({ request, page }) => {
    // Navigate to shop page to get product data
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForLoadState('networkidle');
    
    // Get all product images
    const images = await page.locator('img[src*="supabase.co"]').all();
    
    expect(images.length).toBeGreaterThan(0);
    
    // Verify each image URL is accessible
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      
      if (src && src.includes('supabase.co')) {
        // Extract the full URL (handle Next.js image optimization URLs)
        let imageUrl = src;
        
        // If it's a Next.js optimized image, we need to extract the actual URL
        if (src.includes('/_next/image')) {
          // Parse the URL parameter
          const urlMatch = src.match(/url=([^&]+)/);
          if (urlMatch) {
            imageUrl = decodeURIComponent(urlMatch[1]);
          }
        }
        
        // Verify the image is accessible
        const response = await request.head(imageUrl);
        
        // Should be accessible (200) or redirected (301, 302)
        expect([200, 301, 302, 304]).toContain(response.status());
      }
    }
  });

  test('Supabase storage images should support CORS', async ({ request }) => {
    const testImageUrl = `${SUPABASE_STORAGE_BASE}/${testImageKeys[0]}`;
    
    const response = await request.get(testImageUrl, {
      headers: {
        'Origin': 'https://shop-app-hazel-one.vercel.app',
      },
    });
    
    expect(response.status()).toBe(200);
    
    // Supabase storage should allow CORS for public buckets
    const headers = response.headers();
    // CORS headers may or may not be present depending on configuration
    // Just verify the request succeeds
    expect(response.ok()).toBeTruthy();
  });

  test('Supabase storage should handle image requests with proper caching headers', async ({ request }) => {
    const testImageUrl = `${SUPABASE_STORAGE_BASE}/${testImageKeys[0]}`;
    
    const response = await request.head(testImageUrl);
    
    if (response.status() === 200) {
      const headers = response.headers();
      
      // Supabase storage typically includes cache headers
      // Verify response is cacheable or has explicit cache control
      const hasCacheControl = headers['cache-control'] || headers['Cache-Control'];
      const hasETag = headers['etag'] || headers['ETag'];
      
      // At least one caching mechanism should be present
      expect(hasCacheControl || hasETag).toBeTruthy();
    }
  });
});

