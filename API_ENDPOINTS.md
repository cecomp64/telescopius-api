# Telescopius API Endpoints

Complete list of all endpoints implemented in this SDK.

## Endpoints

### Quote of the Day
- **Endpoint:** `GET /quote-of-the-day/`
- **Method:** `client.getQuoteOfTheDay()`
- **Description:** Get an astronomy-related quote
- **Returns:** `{text: string, author: string}`

### Target Search
- **Endpoint:** `GET /targets/search`
- **Method:** `client.searchTargets(params)`
- **Description:** Advanced search to find targets in the sky
- **Parameters:** Location, date, types, magnitude, altitude, etc.
- **Returns:** `{matched: number, objects: Array}`

### Target Highlights
- **Endpoint:** `GET /targets/highlights`
- **Method:** `client.getTargetHighlights(params)`
- **Description:** Popular targets best seen at this time of year
- **Parameters:** Location, date, types, altitude filters
- **Returns:** `{matched: number, objects: Array}`

### Target Lists
- **Endpoint:** `GET /targets/lists`
- **Method:** `client.getTargetLists()`
- **Description:** Get all target lists for current user
- **Returns:** `Array<{id: string, name: string}>`

### Target List by ID
- **Endpoint:** `GET /targets/lists/{id}`
- **Method:** `client.getTargetListById(id, params)`
- **Description:** Get a specific target list with all targets
- **Parameters:** List ID, optional location/date for rise/set times
- **Returns:** `Object` with list details and targets

### Solar System Times
- **Endpoint:** `GET /solar-system/times`
- **Method:** `client.getSolarSystemTimes(params)`
- **Description:** Get rise/set/transit times for Sun, Moon, and planets
- **Parameters:** Location, date, time format
- **Returns:** `Object` with times for each celestial body

## Authentication

All endpoints require API key authentication via the `Authorization` header:
```
Authorization: Key YOUR_API_KEY
```

This is automatically handled by the SDK when you initialize the client.

## Rate Limits

The API has rate limits. If exceeded, you'll receive a `429 Too Many Requests` error.

## Common Parameters

### Location Parameters (Required for most endpoints)
- `lat` (number): Latitude in decimal degrees
- `lon` (number): Longitude in decimal degrees
- `timezone` (string): Timezone (e.g., 'Europe/Lisbon', 'America/New_York')

### Time Parameters (Optional)
- `datetime` (string): ISO format date/time string
- `time_format` (string): Format for returned times ('user', 'iso', 'utc')

### Search Parameters (Target search only)
- `types` (string): Comma-separated object types
- `name` (string): Object name search
- `con` (string): Constellation code
- `min_alt` (number): Minimum altitude in degrees
- `mag_max` (number): Maximum magnitude
- `mag_min` (number): Minimum magnitude
- `order` (string): Sort field ('name', 'mag', 'alt', etc.)
- `results_per_page` (number): Results per page
- `page` (number): Page number

## Object Types

Supported object types for `types` parameter:
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

## Error Responses

### 400 Bad Request
Invalid parameters provided

### 401 Unauthorized
Invalid or missing API key

### 404 Not Found
Resource not found (e.g., invalid list ID)

### 429 Too Many Requests
Rate limit exceeded

### 500 Internal Server Error
Server-side error

All errors are thrown as JavaScript `Error` objects with descriptive messages.
