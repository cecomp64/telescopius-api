# Telescopius API Endpoints

Complete documentation of all endpoints and their parameters in this SDK.

> **Note:** This documentation is based on the official Telescopius API. For the most up-to-date and definitive API documentation, please refer to [https://api.telescopius.com](https://api.telescopius.com).

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Quote of the Day](#quote-of-the-day)
  - [Target Search](#target-search)
  - [Target Highlights](#target-highlights)
  - [Target Lists](#target-lists)
  - [Target List by ID](#target-list-by-id)
  - [Solar System Times](#solar-system-times)
  - [Pictures Search](#pictures-search)
- [Common Parameters](#common-parameters)
- [Object Types](#object-types)
- [Response Structure](#response-structure)
- [Error Responses](#error-responses)

## Authentication

All endpoints require API key authentication via the `Authorization` header:
```
Authorization: Key YOUR_API_KEY
```

This is automatically handled by the SDK when you initialize the client.

## Endpoints

### Quote of the Day

Get an astronomy-related quote of the day.

- **Endpoint:** `GET /quote-of-the-day/`
- **Method:** `client.getQuoteOfTheDay()`
- **Parameters:** None
- **Returns:** `{text: string, author: string}`

**Example:**
```javascript
const quote = await client.getQuoteOfTheDay();
console.log(`${quote.text} - ${quote.author}`);
```

---

### Target Search

Advanced search to find targets in the sky based on location, date, and various search criteria.

- **Endpoint:** `GET /targets/search`
- **Method:** `client.searchTargets(params)`
- **Returns:** `{matched: number, objects: Array}`

#### Parameters

##### Location & Time Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lat` | number | No | Auto-detect | Latitude in decimal degrees. Range: -90 to 90 |
| `lon` | number | No | Auto-detect | Longitude in decimal degrees. Range: -180 to 180 |
| `timezone` | string | No | UTC | IANA timezone identifier (e.g., 'Europe/Lisbon', 'America/New_York') |
| `datetime` | string | No | null (now) | Date or datetime: "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss" |
| `time_format` | string | No | 24hr | How to report times: "24hr" or "ampm" |
| `partner_observatory` | string | No | null | MPC code of observatory. If provided, lat/lon/timezone are ignored |
| `partner_telescope` | string | No | null | Telescope code (requires partner_observatory) |

##### Object Filtering Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `types` | string | No | All types | Object types (comma-separated: 'COMET', 'ASTEROID', 'DEEP_SKY_OBJECT', 'GXY', etc.) |
| `name` | string | No | null | Find objects by name (fuzzy search, forces order by name match score) |
| `name_exact` | boolean | No | false | Whether to filter by exact name match or partial matches |
| `con` | string | No | All | Constellations (comma-separated IAU abbreviations: 'ORI', 'CYG', 'AND') |
| `cat` | string | No | All | Catalogs (comma-separated catalog acronyms) |

##### Magnitude Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mag_max` | number | No | null | Maximum apparent magnitude (brighter objects have lower magnitudes) |
| `mag_min` | number | No | null | Minimum apparent magnitude |
| `mag_unknown` | boolean | No | true | Whether to return objects with unknown magnitudes |

##### Size Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `size_max` | number | No | null | Maximum apparent size in arcminutes |
| `size_min` | number | No | null | Minimum apparent size in arcminutes |
| `size_unknown` | boolean | No | true | Whether to return objects with unknown sizes |

##### Surface Brightness Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `subr_max` | number | No | null | Maximum surface brightness |
| `subr_min` | number | No | null | Minimum surface brightness |
| `subr_unknown` | boolean | No | true | Whether to return objects with unknown surface brightness |

##### Positional Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `min_alt` | number | No | null | Minimum altitude in degrees. Range: 0 to 90 |
| `min_alt_minutes` | number | No | null | Minimum minutes object must spend above min_alt. Range: 1 to 1440 |
| `az_quadrants` | string | No | All | Limit azimuth quadrants (comma-separated: 'NE', 'NW', 'SW', 'SE') |
| `ra_min` | number | No | null | Minimum Right Ascension at transit time. Range: 0 to 24 hours |
| `ra_max` | number | No | null | Maximum Right Ascension at transit time. Range: 0 to 24 hours |
| `dec_min` | number | No | null | Minimum Declination at transit time. Range: -90 to 90 degrees |
| `dec_max` | number | No | null | Maximum Declination at transit time. Range: -90 to 90 degrees |

##### Observing Session Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `hour_min` | number/string | No | null | Min hour of observing session. Values: 0-24, or 'sunrise', 'sunset', 'civil_sunrise', 'civil_sunset', 'nautical_sunrise', 'nautical_sunset', 'astronomical_sunrise', 'astronomical_sunset', 'darkest_sunrise', 'darkest_sunset' |
| `hour_max` | number/string | No | null | Max hour of observing session. Same values as hour_min |

##### Moon Avoidance Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `moon_dist_min` | string/number | No | 0 | Min distance to Moon at transit (degrees), or special values: 'narrowband', 'ha_s2', 'o3', 'lrgb' for dynamic moon avoidance |
| `moon_dist_max` | number | No | null | Max distance to Moon at transit (degrees) |

##### Center Point Search Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `center_ra` | number | No | null | Center RA for distance search (use with center_dec and dist_min/dist_max) |
| `center_dec` | number | No | null | Center Dec for distance search (use with center_ra and dist_min/dist_max) |
| `dist_min` | number | No | null | Min distance from center point in degrees (requires center_ra and center_dec) |
| `dist_max` | number | No | null | Max distance from center point in degrees (requires center_ra and center_dec) |

##### Comet Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `comet_orbit` | string | No | All | Type of comet orbit (comma-separated: 'PERIODIC', 'NON_PERIODIC', 'ASTEROIDAL', 'INTERSTELLAR') |

##### Computation & Result Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `compute_current` | integer | No | 0 | Whether to return observation at datetime (1) or not (0) |
| `ephemeris` | string | No | null | Set to 'daily' or 'yearly' for ephemeris calculation (only works with name and name_exact) |
| `ephemeris_hour` | number | No | null | Decimal hour for yearly ephemeris computation |
| `order` | string | No | mag | Sort field: 'name', 'con', 'dec', 'mag', 'ra', 'rise', 'set', 'transit', 'size', 'subr', 'type', 'imaging_time', 'popularity', 'opposition' |
| `order_asc` | boolean | No | true | Ascending order (true) or descending (false) |
| `results_per_page` | number | No | 10 | Results per page. Range: 1 to 120 |
| `page` | number | No | 1 | Page number for pagination |

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
});
```

---

### Target Highlights

Get the most popular targets best seen around this time of year at your location. Returns targets near opposition with the longest time up in the night sky for observing or imaging.

- **Endpoint:** `GET /targets/highlights`
- **Method:** `client.getTargetHighlights(params)`
- **Returns:** `{matched: number, objects: Array}`

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `types` | string | No | All types | Object types (comma-separated: 'COMET', 'ASTEROID', 'DEEP_SKY_OBJECT', 'GXY', etc.) |
| `lat` | number | No | Auto-detect | Latitude in decimal degrees. Range: -90 to 90 |
| `lon` | number | No | Auto-detect | Longitude in decimal degrees. Range: -180 to 180 |
| `timezone` | string | No | UTC | IANA timezone identifier |
| `datetime` | string | No | null (now) | Date or datetime: "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss" |
| `time_format` | string | No | 24hr | How to report times: "24hr" or "ampm" |
| `partner_observatory` | string | No | null | MPC code of observatory. If provided, lat/lon/timezone are ignored |
| `partner_telescope` | string | No | null | Telescope code (requires partner_observatory) |
| `compute_current` | integer | No | 0 | Whether to return observation at datetime (1) or not (0) |
| `ephemeris` | string | No | null | Set to 'daily' or 'yearly' for ephemeris calculation (only works with name and name_exact) |
| `ephemeris_hour` | number | No | null | Decimal hour for yearly ephemeris computation |
| `min_alt` | number | No | null | Minimum altitude in degrees. Range: 0 to 90 |
| `min_alt_minutes` | number | No | null | Minimum minutes object must spend above min_alt. Range: 1 to 1440 |
| `moon_dist_min` | string/number | No | 0 | Min distance to Moon at transit (degrees), or special values: 'narrowband', 'ha_s2', 'o3', 'lrgb' |
| `moon_dist_max` | number | No | null | Max distance to Moon at transit (degrees) |

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

---

### Target Lists

Get all target lists for the current user.

- **Endpoint:** `GET /targets/lists`
- **Method:** `client.getTargetLists()`
- **Parameters:** None
- **Returns:** `Array<{id: string, name: string}>`

**Example:**
```javascript
const lists = await client.getTargetLists();
lists.forEach(list => {
  console.log(`List ID: ${list.id}, Name: ${list.name}`);
});
```

---

### Target List by ID

Get a specific target list by ID with all its targets. If order is set to rise, transit, set or next opposition, the location of the list will be used instead of the querystring parameters.

- **Endpoint:** `GET /targets/lists/{id}`
- **Method:** `client.getTargetListById(id, params)`
- **Returns:** `Object` with list details and targets

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | **Yes** | N/A | The list ID (passed as first argument, not in params) |
| `lat` | number | No | Auto-detect | Latitude in decimal degrees. Range: -90 to 90 |
| `lon` | number | No | Auto-detect | Longitude in decimal degrees. Range: -180 to 180 |
| `timezone` | string | No | UTC | IANA timezone identifier |
| `datetime` | string | No | null (now) | Date or datetime: "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss" |
| `partner_observatory` | string | No | null | MPC code of observatory. If provided, lat/lon/timezone are ignored |
| `partner_telescope` | string | No | null | Telescope code (requires partner_observatory) |

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

---

### Solar System Times

Get time information for major solar system bodies, given a location, date and search parameters.

- **Endpoint:** `GET /solar-system/times`
- **Method:** `client.getSolarSystemTimes(params)`
- **Returns:** `Object` with times for each celestial body

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lat` | number | No | Auto-detect | Latitude in decimal degrees. Range: -90 to 90 |
| `lon` | number | No | Auto-detect | Longitude in decimal degrees. Range: -180 to 180 |
| `timezone` | string | No | UTC | IANA timezone identifier |
| `datetime` | string | No | null (now) | Date or datetime: "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss" |
| `partner_observatory` | string | No | null | MPC code of observatory. If provided, lat/lon/timezone are ignored |
| `partner_telescope` | string | No | null | Telescope code (requires partner_observatory) |
| `time_format` | string | No | 24hr | How to report times: "24hr" or "ampm" |

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

---

### Pictures Search

Search for astrophotography pictures uploaded by the community.

- **Endpoint:** `GET /pictures/search`
- **Method:** `client.searchPictures(params)`
- **Returns:** `Object` with results array

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `results_per_page` | number | No | Results per page |
| `order` | string | No | Order by field: 'is_featured', 'acquisition_timestamp', 'created_timestamp', 'final_revision_timestamp', 'popularity' |
| `page` | number | No | Page number |
| `username` | string | No | Filter by username |

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

---

## Common Parameters

### Location Parameters
Most observation-related endpoints use location information (auto-detected from IP if not provided):

- **`lat`** (number, optional): Latitude in decimal degrees
  - Range: -90 to 90
  - Example: 38.7223 (Lisbon)
  - Default: Auto-detect from IP address

- **`lon`** (number, optional): Longitude in decimal degrees
  - Range: -180 to 180
  - Example: -9.1393 (Lisbon)
  - Default: Auto-detect from IP address

- **`timezone`** (string, optional): IANA timezone identifier
  - Examples: 'Europe/Lisbon', 'America/New_York', 'Asia/Tokyo'
  - Default: UTC (or auto-detect from IP address)

### Time Parameters
Optional time parameters for all observation endpoints:

- **`datetime`** (string, optional): Date or datetime string
  - Format: 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss'
  - Example: '2024-03-15' or '2024-03-15 20:00:00'
  - Default: null (present time)

- **`time_format`** (string, optional): Format for returned times
  - Options: '24hr' or 'ampm'
  - Default: '24hr'

### Pagination Parameters
For endpoints that return multiple results:

- **`results_per_page`** (number, optional): Number of results per page
  - Default varies by endpoint (typically 50 for targets)

- **`page`** (number, optional): Page number for pagination
  - Default: 1

### Partner Parameters
For Telescopius partner sites:

- **`partner_observatory`** (string, optional): Partner observatory ID
- **`partner_telescope`** (string, optional): Partner telescope ID

---

## Object Types

Supported object type codes for the `types` parameter:

### Stars
- `star` - Stars
- `dstar` - Double stars
- `mstar` - Multiple star systems

### Galaxies
- `galaxy` or `gxy` - Galaxies (all types)
- `sgx` - Spiral galaxies

### Nebulae
- `eneb` - Emission nebulae
- `rneb` - Reflection nebulae
- `dineb` - Diffuse nebulae
- `pneb` - Planetary nebulae
- `snr` - Supernova remnants

### Clusters
- `gcl` - Globular clusters
- `ocl` or `opcl` - Open clusters

### Solar System
- `planet` - Planets
- `ast` - Asteroids
- `comet` - Comets

### Usage
Use comma-separated codes for multiple types:
```javascript
types: 'galaxy,eneb,pneb'  // Galaxies, emission nebulae, and planetary nebulae
types: 'gcl,ocl'           // Globular and open clusters
```

---

## Response Structure

### Target Object Structure

Each target in search/highlights results contains:

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
    ra: 20.979722,           // Right ascension (hours)
    dec: 44.33,              // Declination (degrees)
    con: "CYG",              // Constellation code
    con_name: "Cygnus",      // Constellation name
    visual_mag: 5,           // Visual magnitude
    photo_mag: 4,            // Photographic magnitude
    major_axis: 7200,        // Size in arcseconds
    minor_axis: 6000,        // Minor axis in arcseconds
    subr: 23.8               // Surface brightness
  },
  tonight_times: {           // If location provided
    rise: "16:33",
    transit: "22:26",
    set: "04:31"
  },
  transit_observation: {     // At transit time
    ra: 20.979722,
    dec: 44.33,
    dist_au: 0,              // Distance in astronomical units
    alt: 45.67,              // Altitude in degrees
    az: 0.52,                // Azimuth in degrees
    mag: 5,
    con: "CYG"
  }
}
```

### Search Results Structure

```javascript
{
  matched: 142,              // Total number of matches
  objects: [                 // Array of target objects
    {
      object: { ... },
      tonight_times: { ... },
      transit_observation: { ... }
    },
    ...
  ]
}
```

### Solar System Times Structure

```javascript
{
  sun: {
    rise: "07:15",
    transit: "13:30",
    set: "19:45",
    twilight_civil_start: "06:45",
    twilight_civil_end: "20:15",
    twilight_nautical_start: "06:10",
    twilight_nautical_end: "20:50",
    twilight_astronomical_start: "05:35",
    twilight_astronomical_end: "21:25"
  },
  moon: {
    rise: "14:20",
    transit: "20:10",
    set: "02:15",
    phase: "Waxing Gibbous",
    illumination: 0.75
  },
  mercury: { rise: "...", transit: "...", set: "..." },
  venus: { rise: "...", transit: "...", set: "..." },
  mars: { rise: "...", transit: "...", set: "..." },
  jupiter: { rise: "...", transit: "...", set: "..." },
  saturn: { rise: "...", transit: "...", set: "..." },
  uranus: { rise: "...", transit: "...", set: "..." },
  neptune: { rise: "...", transit: "...", set: "..." }
}
```

### Pictures Search Structure

```javascript
{
  results: [
    {
      title: "M31 - Andromeda Galaxy",
      username: "photographer",
      url: "...",
      thumbnail_url: "...",
      is_featured: true,
      acquisition_timestamp: "2024-03-15T...",
      created_timestamp: "2024-03-16T...",
      final_revision_timestamp: "2024-03-17T...",
      popularity: 1234
    },
    ...
  ],
  total: 500,              // Total number of matches
  page: 1,
  results_per_page: 10
}
```

---

## Error Responses

The SDK throws JavaScript `Error` objects with descriptive messages for various API issues:

### 400 Bad Request
Invalid parameters provided.

**Example message:** `"Bad Request: Invalid parameters"`

**Common causes:**
- Missing required parameters (lat, lon, timezone)
- Invalid parameter values
- Malformed datetime strings

### 401 Unauthorized
Invalid or missing API key.

**Example message:** `"Unauthorized: Invalid API key"`

**Causes:**
- Invalid API key
- Expired API key
- Missing API key in configuration

### 404 Not Found
Resource not found.

**Example message:** `"API Error (404): Resource not found"`

**Common causes:**
- Invalid target list ID
- Non-existent endpoint

### 429 Too Many Requests
Rate limit exceeded.

**Example message:** `"Too Many Requests: Rate limit exceeded"`

**Solution:** Wait before making additional requests. Implement rate limiting in your application.

### 500 Internal Server Error
Server-side error.

**Example message:** `"API Error (500): Internal server error"`

**Solution:** Retry the request. If the error persists, contact Telescopius support.

### Network Errors
No response from server.

**Example message:** `"No response from API server"`

**Common causes:**
- Network connectivity issues
- Server downtime
- Firewall blocking requests

### Error Handling Example

```javascript
try {
  const results = await client.searchTargets({
    lat: 38.7223,
    lon: -9.1393,
    timezone: 'Europe/Lisbon'
  });
} catch (error) {
  console.error('API Error:', error.message);

  // Handle specific errors
  if (error.message.includes('Unauthorized')) {
    console.error('Please check your API key');
  } else if (error.message.includes('Too Many Requests')) {
    console.error('Rate limit exceeded. Please wait before retrying.');
  } else if (error.message.includes('Bad Request')) {
    console.error('Invalid parameters. Please check your input.');
  }
}
```

---

## Rate Limits

The Telescopius API has rate limits to ensure fair usage. If you exceed the rate limit, you'll receive a `429 Too Many Requests` error.

**Best practices:**
- Implement exponential backoff when receiving 429 errors
- Cache responses when appropriate
- Avoid making unnecessary duplicate requests
- Consider the rate limit when implementing loops or bulk operations

---

## Additional Resources

- **Official API Documentation:** [https://api.telescopius.com](https://api.telescopius.com)
- **Telescopius Contact Form:** [https://telescopius.com/contact](https://telescopius.com/contact)
- **Terms and Conditions:** [https://telescopius.com/terms-and-conditions#api](https://telescopius.com/terms-and-conditions#api)

---

## Notes

- All coordinates use decimal degrees
- All times can be returned in multiple formats (user, iso, utc)
- All magnitudes follow the astronomical convention (lower = brighter)
- All sizes for deep sky objects are in arcseconds in the API response, but parameters use arcminutes
- Constellation codes follow the IAU three-letter abbreviations
