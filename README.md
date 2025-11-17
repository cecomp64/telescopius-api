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

## API Reference

### Constructor

```javascript
new TelescopiusClient(config)
```

**Parameters:**
- `config.apiKey` (string, required): Your Telescopius API key
- `config.baseURL` (string, optional): Base URL for the API (defaults to `https://api.telescopius.com/v2.0`)

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
- `params.sp_types` (string, optional): Object types (comma-separated: 'planet', 'galaxy', 'eneb', 'ocl', etc.)
- `params.sp_name` (string, optional): Object name to search for
- `params.sp_name_exact` (boolean, optional): Exact name match
- `params.sp_con` (string, optional): Constellation code (e.g., 'ORI', 'CYG', 'AND')
- `params.sp_min_alt` (number, optional): Minimum altitude in degrees
- `params.sp_min_alt_minutes` (number, optional): Minimum time at minimum altitude in minutes
- `params.sp_moon_dist_min` (number, optional): Minimum moon distance in degrees
- `params.sp_moon_dist_max` (number, optional): Minimum moon distance in degrees
- `params.sp_mag_max` (number, optional): Maximum magnitude
- `params.sp_mag_min` (number, optional): Minimum magnitude
- `params.sp_mag_unknown` (boolean, optional): Include objects with unknown magnitude
- `params.sp_size_max` (number, optional): Maximum size in arcminutes
- `params.sp_size_min` (number, optional): Minimum size in arcminutes
- `params.sp_order` (string, optional): Order by ('name', 'ra', 'dec', 'mag', 'size', 'alt', etc.)
- `params.sp_order_asc` (boolean, optional): Ascending order
- `params.sp_results_per_page` (number, optional): Results per page (default: 50)
- `params.sp_page` (number, optional): Page number (default: 1)

**Returns:** `Promise<{matched: number, objects: Array}>`

**Example:**
```javascript
const results = await client.searchTargets({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon',
  sp_types: 'galaxy,eneb',
  sp_min_alt: 30,
  sp_mag_max: 10,
  sp_results_per_page: 20
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
- `params.sp_types` (string, optional): Object types (comma-separated)
- `params.sp_min_alt` (number, optional): Minimum altitude in degrees
- `params.sp_min_alt_minutes` (number, optional): Minimum time at minimum altitude in minutes
- `params.sp_moon_dist_min` (number, optional): Minimum moon distance in degrees
- `params.sp_moon_dist_max` (number, optional): Maximum moon distance in degrees

**Returns:** `Promise<{matched: number, objects: Array}>`

**Example:**
```javascript
const highlights = await client.getTargetHighlights({
  lat: 38.7223,
  lon: -9.1393,
  timezone: 'Europe/Lisbon',
  sp_types: 'galaxy,eneb',
  sp_min_alt: 20
});

console.log(`Tonight's highlights (${highlights.matched} total):`);
highlights.objects.forEach(item => {
  console.log(`- ${item.object.main_name || item.object.main_id}`);
});
```

## Object Types

Common object types you can search for:

- `planet` - Planets
- `star` - Stars
- `dstar` - Double stars
- `galaxy` - Galaxies
- `eneb` - Emission nebulae
- `rneb` - Reflection nebulae
- `pneb` - Planetary nebulae
- `snr` - Supernova remnants
- `gcl` - Globular clusters
- `ocl` - Open clusters
- `ast` - Asteroids
- `comet` - Comets

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
