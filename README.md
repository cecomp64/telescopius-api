# Telescopius API - Node.js SDK

A Node.js SDK for the [Telescopius REST API](https://api.telescopius.com). Search for astronomical targets, get observation planning data, and more.

## Installation

```bash
npm install telescopius-api
```

Or with yarn:

```bash
yarn add telescopius-api
```

## Getting Started

First, you'll need an API key from Telescopius. Visit [https://api.telescopius.com](https://api.telescopius.com) to get your key.

## Development

### Running Tests

The SDK includes both unit tests (mocked) and integration tests (real API calls).

```bash
# Run all tests (unit + integration)
npm test

# Run only integration tests (requires .env with API key)
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**For integration tests**, create a `.env` file:
```bash
cp .env.example .env
# Add your API key to .env
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

### Basic Usage

```javascript
const TelescopiusClient = require('telescopius-api');

// Initialize the client
const client = new TelescopiusClient({
  apiKey: 'YOUR_API_KEY'
});

// Get quote of the day
const quote = await client.getQuoteOfTheDay();
console.log(`${quote.text} - ${quote.author}`);
```

### Debug Mode

Enable debug mode to see detailed HTTP request and response logs:

```javascript
const client = new TelescopiusClient({
  apiKey: 'YOUR_API_KEY',
  debug: true  // Enable debug logging
});

// All API calls will now log request/response details
const quote = await client.getQuoteOfTheDay();
```

Debug output includes:
- HTTP method and full URL with query parameters
- Request headers and body
- Response status, headers, and data
- Error details for failed requests

Example debug output:
```
[Telescopius Debug] HTTP Request:
  Method: GET
  URL: https://api.telescopius.com/v2.0/targets/search?lat=38.7223&lon=-9.1393&timezone=Europe/Lisbon
  Headers: {
    "Authorization": "Key YOUR_API_KEY",
    "Content-Type": "application/json"
  }

[Telescopius Debug] HTTP Response:
  Status: 200 OK
  Headers: {...}
  Data: {...}
```

See [examples/debug-mode.js](examples/debug-mode.js) for a complete example.

## API Reference

For complete API documentation including all endpoints, parameters, response structures, and error codes, see [API_ENDPOINTS.md](API_ENDPOINTS.md).

### Quick Start

#### Constructor

```javascript
const client = new TelescopiusClient({
  apiKey: 'YOUR_API_KEY',
  debug: false  // Optional: enable debug logging
});
```

#### Basic Examples

**Get Quote of the Day:**
```javascript
const quote = await client.getQuoteOfTheDay();
console.log(`${quote.text} - ${quote.author}`);
```

**Search for Targets:**
```javascript
const results = await client.searchTargets({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon',
  types: 'galaxy,eneb',
  min_alt: 30,
  mag_max: 10
});
```

**Get Tonight's Highlights:**
```javascript
const highlights = await client.getTargetHighlights({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon',
  min_alt: 20
});
```

**Get Solar System Times:**
```javascript
const times = await client.getSolarSystemTimes({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon'
});
console.log(`Sunrise: ${times.sun.rise}, Sunset: ${times.sun.set}`);
```

**Search Pictures:**
```javascript
const pictures = await client.searchPictures({
  order: 'is_featured',
  results_per_page: 10
});
```

### Available Methods

- `getQuoteOfTheDay()` - Get astronomy quote
- `searchTargets(params)` - Search for astronomical objects
- `getTargetHighlights(params)` - Get popular targets for your location
- `getTargetLists()` - Get your target lists
- `getTargetListById(id, params)` - Get specific target list
- `getSolarSystemTimes(params)` - Get Sun/Moon/planet times
- `searchPictures(params)` - Search astrophotography pictures

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for complete parameter documentation and response structures

## Examples

See the [examples](examples/) directory for complete working examples:

- [basic.js](examples/basic.js) - Get quote of the day
- [search-targets.js](examples/search-targets.js) - Advanced target search
- [highlights.js](examples/highlights.js) - Tonight's highlights
- [find-by-name.js](examples/find-by-name.js) - Search by object name
- [target-lists.js](examples/target-lists.js) - Working with user target lists
- [solar-system-times.js](examples/solar-system-times.js) - Sun, Moon, and planet times
- [search-pictures.js](examples/search-pictures.js) - Search astrophotography pictures

## Error Handling

The SDK throws errors for various API issues:

```javascript
try {
  const results = await client.searchTargets({
    lat: 38.7223,
    lon: -9.1393,
    timezone: 'Europe/Lisbon'
  });
} catch (error) {
  console.error('API Error:', error.message);
  // Possible errors:
  // - "Unauthorized: Invalid API key"
  // - "Bad Request: Invalid parameters"
  // - "Too Many Requests: Rate limit exceeded"
}
```

## Rate Limits

Please be aware of the API rate limits. If you exceed the rate limit, you'll receive a `429 Too Many Requests` error.

## License

MIT

## Terms of Service

This SDK uses the Telescopius API. By using this SDK, you agree to the [Telescopius Terms and Conditions](https://telescopius.com/terms-and-conditions#api).

Commercial use is not allowed unless you have prior written authorization from Telescopius.

## Support

For API-related questions or to request new endpoints:
- Visit the [Telescopius Contact Form](https://telescopius.com/contact)
- API Documentation: [https://api.telescopius.com](https://api.telescopius.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Publishing

`npm publish`