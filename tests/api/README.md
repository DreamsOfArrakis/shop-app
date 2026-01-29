# API Tests

Comprehensive API test suite using Playwright's built-in request API. These tests validate all API endpoints, request/response handling, error cases, and integration scenarios.

## Test Structure

### Health API Tests (`health.spec.js`)
- ✅ Health check endpoint validation
- ✅ Response structure verification
- ✅ Cache header validation
- ✅ Performance testing
- ✅ Idempotency testing

### Orders API Tests (`orders.spec.js`)
- ✅ Order creation with valid data (guest and authenticated)
- ✅ Input validation (invalid formats, missing fields)
- ✅ Quantity validation
- ✅ Multiple products handling
- ✅ Error handling for non-existent products
- ✅ Content type validation

### Checkout Session API Tests (`checkout.spec.js`)
- ✅ Stripe checkout session creation
- ✅ Payment flow integration
- ✅ Input validation
- ✅ Error handling
- ✅ Session ID format validation

### Debug API Tests (`debug.spec.js`)
- ✅ Debug endpoint information retrieval
- ✅ Environment variable validation
- ✅ GraphQL endpoint connectivity
- ✅ URQL client testing
- ✅ Collections query testing
- ✅ REST endpoint testing
- ✅ Product query testing

### API Integration Tests (`api.spec.js`)
- ✅ CORS handling
- ✅ OPTIONS request handling
- ✅ Error code validation (404, 405)
- ✅ Header validation
- ✅ Malformed JSON handling
- ✅ Large payload handling

### Supabase Image Storage Tests (`images.spec.js`)
- ✅ Image accessibility from Supabase storage
- ✅ Content type validation
- ✅ Performance testing
- ✅ 404 handling for missing images
- ✅ Product image URL validation
- ✅ CORS support for images
- ✅ Caching headers validation

## Running Tests

```bash
# Run all API tests
npm run test:api

# Run API tests with UI
npm run test:api:ui

# Run all tests (E2E + API)
npm run test:all

# Run specific test file
npx playwright test tests/api/health.spec.js

# Run with specific project
npx playwright test --project=api
```

## Test Coverage

### Endpoints Tested
- `GET /api/health` - Health check endpoint
- `POST /api/create-order` - Order creation
- `POST /api/create-checkout-session` - Stripe checkout
- `GET /api/debug` - Debug information
- `GET Supabase Storage` - Image storage accessibility

### Test Categories
1. **Happy Path Tests** - Valid requests with expected responses
2. **Validation Tests** - Invalid input handling
3. **Error Handling** - Error response validation
4. **Performance Tests** - Response time validation
5. **Integration Tests** - Cross-endpoint scenarios
6. **Edge Cases** - Boundary conditions and unusual inputs

## Best Practices

- ✅ Comprehensive error case coverage
- ✅ Input validation testing
- ✅ Response structure validation
- ✅ Performance considerations
- ✅ Concurrent request handling
- ✅ Proper HTTP status code validation
- ✅ Content type verification
- ✅ Idempotency testing where applicable

## Environment Variables

Tests use the following environment variables:
- `API_BASE_URL` - Base URL for API endpoints (defaults to production URL)

## Notes for Interview

These tests demonstrate:
- **API Testing Expertise** - Using Playwright for both E2E and API testing
- **Test Organization** - Well-structured test suites by functionality
- **Comprehensive Coverage** - Happy paths, error cases, edge cases
- **Best Practices** - Proper validation, error handling, performance testing
- **Integration Testing** - Testing real API endpoints with proper mocking where needed

