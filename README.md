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

### Constructor

```javascript
new TelescopiusClient(config)
```

**Parameters:**
- `config.apiKey` (string, required): Your Telescopius API key
- `config.baseURL` (string, optional): Base URL for the API (defaults to `https://api.telescopius.com/v2.0`)
- `config.debug` (boolean, optional): Enable debug logging for HTTP requests/responses (defaults to `false`)

### Methods

#### `getQuoteOfTheDay()`

Get an astronomy-related quote of the day.

**Returns:** `Promise<{text: string, author: string}>`

**Example:**
```javascript
const quote = await client.getQuoteOfTheDay();
console.log(`${quote.text} - ${quote.author}`);
// Output: "You aren't in the Universe, you are the Universe. - Eckhart Tolle"
```

#### `searchTargets(params)`

Advanced search to find targets in the sky based on location, date, and various search criteria.

**Parameters:**
- `params.lat` (number, required): Latitude in decimal degrees
- `params.lon` (number, required): Longitude in decimal degrees
- `params.timezone` (string, required): Timezone (e.g., 'Europe/Lisbon', 'America/New_York')
- `params.datetime` (string, optional): Date and time in ISO format
- `params.types` (string, optional): Object types (comma-separated: 'planet', 'galaxy', 'eneb', 'ocl', etc.)
- `params.name` (string, optional): Object name to search for
- `params.name_exact` (boolean, optional): Exact name match
- `params.con` (string, optional): Constellation code (e.g., 'ORI', 'CYG', 'AND')
- `params.min_alt` (number, optional): Minimum altitude in degrees
- `params.min_alt_minutes` (number, optional): Minimum time at minimum altitude in minutes
- `params.moon_dist_min` (number, optional): Minimum moon distance in degrees
- `params.moon_dist_max` (number, optional): Minimum moon distance in degrees
- `params.mag_max` (number, optional): Maximum magnitude
- `params.mag_min` (number, optional): Minimum magnitude
- `params.mag_unknown` (boolean, optional): Include objects with unknown magnitude
- `params.size_max` (number, optional): Maximum size in arcminutes
- `params.size_min` (number, optional): Minimum size in arcminutes
- `params.order` (string, optional): Order by ('name', 'ra', 'dec', 'mag', 'size', 'alt', etc.)
- `params.order_asc` (boolean, optional): Ascending order
- `params.results_per_page` (number, optional): Results per page (default: 50)
- `params.page` (number, optional): Page number (default: 1)

**Returns:** `Promise<{matched: number, objects: Array}>`

**Example:**
```javascript
const results = await client.searchTargets({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon',
  types: 'galaxy,eneb',
  min_alt: 30,
  mag_max: 10,
  results_per_page: 20
});

console.log(`Found ${results.matched} objects`);
results.objects.forEach(item => {
  const obj = item.object;
  console.log(`${obj.main_name || obj.main_id} - Mag: ${obj.visual_mag}`);
  if (item.tonight_times) {
    console.log(`  Rise: ${item.tonight_times.rise}, Transit: ${item.tonight_times.transit}`);
  }
});
```

#### `getTargetHighlights(params)`

Get popular targets best seen around this time of year at your location.

**Parameters:**
- `params.lat` (number, required): Latitude in decimal degrees
- `params.lon` (number, required): Longitude in decimal degrees
- `params.timezone` (string, required): Timezone
- `params.datetime` (string, optional): Date and time in ISO format
- `params.types` (string, optional): Object types (comma-separated)
- `params.min_alt` (number, optional): Minimum altitude in degrees
- `params.min_alt_minutes` (number, optional): Minimum time at minimum altitude in minutes
- `params.moon_dist_min` (number, optional): Minimum moon distance in degrees
- `params.moon_dist_max` (number, optional): Maximum moon distance in degrees

**Returns:** `Promise<{matched: number, objects: Array}>`

**Example:**
```javascript
const highlights = await client.getTargetHighlights({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon',
  types: 'galaxy,eneb',
  min_alt: 20
});

console.log(`Tonight's highlights (${highlights.matched} total):`);
highlights.objects.forEach(item => {
  console.log(`- ${item.object.main_name || item.object.main_id}`);
});
```

#### `getTargetLists()`

Get all target lists for the current user.

**Returns:** `Promise<Array<{id: string, name: string}>>`

**Example:**
```javascript
const lists = await client.getTargetLists();
lists.forEach(list => {
  console.log(`List ID: ${list.id}, Name: ${list.name}`);
});
```

#### `getTargetListById(id, params)`

Get a specific target list by ID with all its targets.

**Parameters:**
- `id` (string, required): The list ID
- `params.lat` (number, optional): Latitude in decimal degrees
- `params.lon` (number, optional): Longitude in decimal degrees
- `params.timezone` (string, optional): Timezone
- `params.datetime` (string, optional): Date and time in ISO format
- `params.partner_observatory` (string, optional): Partner observatory ID
- `params.partner_telescope` (string, optional): Partner telescope ID

**Returns:** `Promise<Object>`

**Example:**
```javascript
const list = await client.getTargetListById('12345678', {
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon'
});

console.log(`List: ${list.name}`);
list.targets.forEach(target => {
  console.log(`- ${target.main_name || target.main_id}`);
});
```

#### `getSolarSystemTimes(params)`

Get time information for major solar system bodies (Sun, Moon, planets).

**Parameters:**
- `params.lat` (number, required): Latitude in decimal degrees
- `params.lon` (number, required): Longitude in decimal degrees
- `params.timezone` (string, required): Timezone
- `params.datetime` (string, optional): Date and time in ISO format
- `params.time_format` (string, optional): Time format ('user', 'iso', 'utc')
- `params.partner_observatory` (string, optional): Partner observatory ID
- `params.partner_telescope` (string, optional): Partner telescope ID

**Returns:** `Promise<Object>`

**Example:**
```javascript
const times = await client.getSolarSystemTimes({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon'
});

console.log(`Sunrise: ${times.sun.rise}, Sunset: ${times.sun.set}`);
console.log(`Moonrise: ${times.moon.rise}, Moonset: ${times.moon.set}`);
console.log(`Moon phase: ${times.moon.phase}`);
```

#### `searchPictures(params)`

Search for astrophotography pictures uploaded by the community.

**Parameters:**
- `params.results_per_page` (number, optional): Results per page
- `params.order` (string, optional): Order by field (e.g., 'is_featured', 'acquisition_timestamp', 'created_timestamp', 'final_revision_timestamp', 'popularity')
- `params.page` (number, optional): Page number
- `params.username` (string, optional): Filter by username

**Returns:** `Promise<Object>`

**Example:**
```javascript
// Get featured pictures
const featured = await client.searchPictures({
  results_per_page: 10,
  order: 'is_featured',
  page: 1
});

console.log(`Found ${featured.results.length} pictures`);
featured.results.forEach(pic => {
  console.log(`${pic.title} by ${pic.username}`);
});

// Search by username
const userPics = await client.searchPictures({
  username: 'sebagr',
  results_per_page: 20
});
```

## Object Types

Object type codes for the `types` parameter:

- `planet` - Planets
- `star` - Stars
- `dstar` - Double stars
- `mstar` - Multiple stars
- `gxy` - Galaxies
- `sgx` - Spiral galaxies
- `eneb` - Emission nebulae
- `rneb` - Reflection nebulae
- `dineb` - Diffuse nebulae
- `pneb` - Planetary nebulae
- `snr` - Supernova remnants
- `gcl` - Globular clusters
- `ocl` - Open clusters
- `opcl` - Open clusters (alternate)
- `ast` - Asteroids
- `comet` - Comets

Use comma-separated codes for multiple types: `types: 'gxy,eneb,pneb'`

## Response Data

### Target Object Structure

Each target in the results contains:

```javascript
{
  object: {
    main_id: "NGC 7000",
    main_name: "North America Nebula",
    ids: ["NGC 7000", "SH 2-117", ...],
    names: ["North America Nebula"],
    family: "deep_sky_object",
    types: ["eneb", "dineb", "neb", ...],
    url: "/deep-sky-objects/ngc-7000/...",
    main_image_url: "https://telescopius.com/img/...",
    thumbnail_url: "https://telescopius.com/img/...",
    ra: 20.979722,
    dec: 44.33,
    con: "CYG",
    con_name: "Cygnus",
    visual_mag: 5,
    major_axis: 7200,  // arcseconds
    minor_axis: 6000,
    subr: 23.8         // surface brightness
  },
  tonight_times: {
    rise: "16:33",
    transit: "22:26",
    set: "04:31"
  },
  transit_observation: {
    ra: 20.979722,
    dec: 44.33,
    alt: 45.67,        // altitude in degrees
    az: 0.52,          // azimuth in degrees
    mag: 5,
    con: "CYG"
  }
}
```

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
