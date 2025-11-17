# Testing Guide

This document describes the testing strategy and how to run tests for the Telescopius API SDK.

## Test Coverage

Current test coverage:
- **Statements**: 97.82%
- **Branches**: 81.48%
- **Functions**: 100%
- **Lines**: 97.82%
- **Total Tests**: 43 (33 unit tests + 10 integration tests)

## Running Tests

### Run all tests (unit + integration)
```bash
npm test
```

### Run only unit tests (mocked)
```bash
npm test -- --testPathPattern='__tests__/(client|index).test.js'
```

### Run only integration tests (real API calls)
```bash
npm run test:integration
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

The coverage report will be generated in the `coverage/` directory. You can open `coverage/lcov-report/index.html` in a browser to view a detailed HTML coverage report.

## Test Types

### Unit Tests

Located in `src/__tests__/client.test.js` and `src/__tests__/index.test.js`

**Characteristics:**
- Use mocked API responses
- No API key required
- Fast execution (< 1 second)
- Test SDK logic and error handling
- 33 tests total

**What's tested:**
- Constructor validation
- API method calls
- Parameter passing
- Error handling (400, 401, 404, 429, 500, network errors)
- Module exports

### Integration Tests

Located in `src/__tests__/integration.test.js`

**Characteristics:**
- Make real API calls to Telescopius
- Require valid API key in `.env` file
- Slower execution (~6 seconds)
- Test actual API responses
- 10 tests total

**What's tested:**
- Real API endpoint responses
- Data format validation
- Actual astronomical data retrieval
- Error handling with real API errors

## Setting Up Integration Tests

1. **Create a `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Add your API key** to `.env`:
   ```
   TELESCOPIUS_API_KEY=your_actual_api_key
   ```

3. **Run integration tests**:
   ```bash
   npm run test:integration
   ```

**Note:** The `.env` file is git-ignored and will not be committed to version control.

## Test Structure

Tests are organized in the `src/__tests__/` directory:

```
src/
├── __tests__/
│   ├── client.test.js    # Tests for TelescopiusClient class
│   └── index.test.js     # Tests for module exports
├── client.js
└── index.js
```

## What's Tested

### Constructor Tests
- ✅ Creating client with valid API key
- ✅ Using custom base URL
- ✅ Error handling for missing API key
- ✅ Axios configuration with correct headers

### API Method Tests

#### getQuoteOfTheDay()
- ✅ Successful API response
- ✅ Error handling

#### searchTargets()
- ✅ Search with various parameters
- ✅ Empty results handling
- ✅ Bad request error handling
- ✅ Parameter passing verification

#### getTargetHighlights()
- ✅ Successful fetch with parameters
- ✅ Minimal parameters support

### Error Handling Tests
- ✅ 401 Unauthorized errors
- ✅ 400 Bad Request errors
- ✅ 429 Rate Limit errors
- ✅ 500 Server errors
- ✅ Network errors (no response)
- ✅ Generic error handling
- ✅ Error messages with and without data

### Integration Tests
- ✅ Parameter passing
- ✅ Multiple consecutive API calls
- ✅ Module exports (default, named, CommonJS)

## Test Framework

We use **Jest** as our testing framework because:
- Built-in mocking capabilities
- Code coverage reports
- Fast parallel test execution
- Great developer experience with watch mode
- No additional configuration needed for Node.js projects

## Mocking Strategy

We mock the `axios` library to avoid making real API calls during tests. This ensures:
- Tests run quickly
- Tests don't require a valid API key
- Tests are deterministic and reliable
- No rate limiting issues during testing

## Adding New Tests

When adding new features, please:

1. Create tests in the appropriate `__tests__/` file
2. Follow the existing naming convention
3. Include positive and negative test cases
4. Test error scenarios
5. Run coverage to ensure new code is tested
6. Aim for >80% coverage on new code

Example test structure:
```javascript
describe('YourFeature', () => {
  test('should do something successfully', async () => {
    // Arrange
    const mockData = { ... };
    client.client = {
      get: jest.fn().mockResolvedValue({ data: mockData })
    };

    // Act
    const result = await client.yourMethod();

    // Assert
    expect(result).toEqual(mockData);
  });

  test('should handle errors', async () => {
    // Arrange
    client.client = {
      get: jest.fn().mockRejectedValue({
        response: { status: 400, data: { error: 'Bad request' } }
      })
    };

    // Act & Assert
    await expect(client.yourMethod()).rejects.toThrow('Bad Request');
  });
});
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. The test suite:
- Requires no external dependencies
- Runs in under 2 seconds
- Has no flaky tests
- Provides clear error messages

## Debugging Tests

To debug a specific test:

```bash
# Run a specific test file
npx jest src/__tests__/client.test.js

# Run tests matching a pattern
npx jest -t "should fetch quote"

# Run with verbose output
npx jest --verbose
```

## Coverage Thresholds

The project enforces minimum coverage thresholds (configured in `jest.config.js`):
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

If coverage drops below these thresholds, the test suite will fail.
