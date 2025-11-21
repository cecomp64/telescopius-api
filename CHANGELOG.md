# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-11-20

### Added
- **New endpoint:** `searchPictures(params)` - Search for astrophotography pictures from the community
  - Search featured pictures
  - Filter by username
  - Pagination support with `results_per_page` and `page` parameters
  - Sort by different fields using `order` parameter
- Integration tests for pictures search endpoint (2 tests)
- Unit tests for pictures search endpoint (3 tests)
- Example file: `examples/search-pictures.js`
- Updated documentation in README.md and API_ENDPOINTS.md

### Fixed
- Integration tests now handle both `objects` and `page_results` response formats
- Corrected object type codes to match API requirements (`gxy`, `eneb`, `pneb`, etc.)

### Testing
- Total tests increased from 43 to 48
  - 36 unit tests (was 33)
  - 12 integration tests (was 10)
- Maintained 97.82% code coverage

## [1.0.0] - 2025-11-16

### Added
- Initial release of Telescopius API Node.js SDK
- Support for Telescopius API v2.0 endpoints:
  - `getQuoteOfTheDay()` - Get astronomy quote of the day
  - `searchTargets()` - Advanced target search with 40+ parameters
  - `getTargetHighlights()` - Popular targets for the season
  - `getTargetLists()` - Get all user target lists
  - `getTargetListById()` - Get specific target list with details
  - `getSolarSystemTimes()` - Sun, Moon, and planet rise/set/transit times
- Comprehensive error handling for all API responses
- Full JSDoc documentation
- Complete test suite with 43 tests
- 97.82% code coverage
- 6 working example files
- Complete API documentation
- Integration tests with real API calls using dotenv for API key management

### Testing
- Jest test framework
- Unit tests for all methods
- Integration tests with real API calls
- Error handling tests
- Mock-based testing (no API key required for unit tests)

### Documentation
- README with complete API reference
- TESTING.md with testing guide
- API_ENDPOINTS.md with endpoint reference
- Example files for all use cases
