const axios = require('axios');

/**
 * Telescopius API Client
 */
class TelescopiusClient {
  /**
   * Create a new Telescopius API client
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - Your Telescopius API key
   * @param {string} [config.baseURL='https://api.telescopius.com/v2.0'] - Base URL for the API
   * @param {boolean} [config.debug=false] - Enable debug logging for HTTP requests/responses
   */
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.telescopius.com/v2.0';
    this.debug = config.debug || false;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add request/response interceptors for debug logging
    if (this.debug) {
      this._setupDebugLogging();
    }
  }

  /**
   * Setup debug logging interceptors
   * @private
   */
  _setupDebugLogging() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const url = `${config.baseURL}${config.url}`;
        const params = config.params ? `?${new URLSearchParams(config.params).toString()}` : '';
        console.log('\n[Telescopius Debug] HTTP Request:');
        console.log(`  Method: ${config.method.toUpperCase()}`);
        console.log(`  URL: ${url}${params}`);
        console.log(`  Headers:`, JSON.stringify(config.headers, null, 2));
        if (config.data) {
          console.log(`  Body:`, JSON.stringify(config.data, null, 2));
        }
        return config;
      },
      (error) => {
        console.error('[Telescopius Debug] Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log('\n[Telescopius Debug] HTTP Response:');
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Headers:`, JSON.stringify(response.headers, null, 2));
        console.log(`  Data:`, JSON.stringify(response.data, null, 2));
        return response;
      },
      (error) => {
        if (error.response) {
          console.error('\n[Telescopius Debug] HTTP Error Response:');
          console.error(`  Status: ${error.response.status} ${error.response.statusText}`);
          console.error(`  Headers:`, JSON.stringify(error.response.headers, null, 2));
          console.error(`  Data:`, JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
          console.error('\n[Telescopius Debug] No Response Received');
          console.error(`  Request:`, error.request);
        } else {
          console.error('\n[Telescopius Debug] Request Setup Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the quote of the day
   * @returns {Promise<{text: string, author: string}>} Quote object with text and author
   * @example
   * const quote = await client.getQuoteOfTheDay();
   * console.log(quote.text, '-', quote.author);
   */
  async getQuoteOfTheDay() {
    try {
      const response = await this.client.get('/quote-of-the-day/');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Search for targets in the sky
   * @param {Object} params - Search parameters
   * @param {number} params.lat - Latitude in decimal degrees
   * @param {number} params.lon - Longitude in decimal degrees
   * @param {string} params.timezone - Timezone (e.g., 'Europe/Lisbon', 'America/New_York')
   * @param {string} [params.datetime] - Date and time in ISO format
   * @param {string} [params.types] - Object types to search for (comma-separated: 'planet', 'galaxy', 'eneb', etc.)
   * @param {string} [params.name] - Object name to search for
   * @param {boolean} [params.name_exact] - Exact name match
   * @param {string} [params.con] - Constellation code (e.g., 'ORI', 'CYG')
   * @param {number} [params.min_alt] - Minimum altitude in degrees
   * @param {number} [params.min_alt_minutes] - Minimum time at minimum altitude in minutes
   * @param {number} [params.moon_dist_min] - Minimum moon distance in degrees
   * @param {number} [params.moon_dist_max] - Maximum moon distance in degrees
   * @param {number} [params.mag_max] - Maximum magnitude
   * @param {number} [params.mag_min] - Minimum magnitude
   * @param {boolean} [params.mag_unknown] - Include objects with unknown magnitude
   * @param {number} [params.size_max] - Maximum size in arcminutes
   * @param {number} [params.size_min] - Minimum size in arcminutes
   * @param {string} [params.order] - Order results by field ('name', 'ra', 'dec', 'mag', 'size', 'alt', etc.)
   * @param {boolean} [params.order_asc] - Ascending order
   * @param {number} [params.results_per_page=50] - Results per page
   * @param {number} [params.page=1] - Page number
   * @returns {Promise<{matched: number, objects: Array}>} Search results with matched count and objects array
   * @example
   * const results = await client.searchTargets({
   *   lat: 38.7223,
   *   lon: -9.1393,
   *   timezone: 'Europe/Lisbon',
   *   types: 'galaxy,eneb',
   *   min_alt: 30,
   *   mag_max: 10
   * });
   */
  async searchTargets(params) {
    try {
      const response = await this.client.get('/targets/search', { params });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get highlights (popular targets best seen around this time of year)
   * @param {Object} params - Search parameters
   * @param {number} params.lat - Latitude in decimal degrees
   * @param {number} params.lon - Longitude in decimal degrees
   * @param {string} params.timezone - Timezone (e.g., 'Europe/Lisbon', 'America/New_York')
   * @param {string} [params.datetime] - Date and time in ISO format
   * @param {string} [params.types] - Object types to search for (comma-separated)
   * @param {number} [params.min_alt] - Minimum altitude in degrees
   * @param {number} [params.min_alt_minutes] - Minimum time at minimum altitude in minutes
   * @param {number} [params.moon_dist_min] - Minimum moon distance in degrees
   * @param {number} [params.moon_dist_max] - Maximum moon distance in degrees
   * @returns {Promise<{matched: number, objects: Array}>} Highlights with matched count and objects array
   * @example
   * const highlights = await client.getTargetHighlights({
   *   lat: 38.7223,
   *   lon: -9.1393,
   *   timezone: 'Europe/Lisbon',
   *   types: 'galaxy,eneb'
   * });
   */
  async getTargetHighlights(params) {
    try {
      const response = await this.client.get('/targets/highlights', { params });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get all target lists for the current user
   * @returns {Promise<Array<{id: string, name: string}>>} Array of target lists
   * @example
   * const lists = await client.getTargetLists();
   * lists.forEach(list => console.log(list.id, list.name));
   */
  async getTargetLists() {
    try {
      const response = await this.client.get('/targets/lists');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get a specific target list by ID with all its targets
   * @param {string} id - The list ID
   * @param {Object} [params] - Optional parameters for location and time
   * @param {number} [params.lat] - Latitude in decimal degrees
   * @param {number} [params.lon] - Longitude in decimal degrees
   * @param {string} [params.timezone] - Timezone (e.g., 'Europe/Lisbon')
   * @param {string} [params.datetime] - Date and time in ISO format
   * @param {string} [params.partner_observatory] - Partner observatory ID
   * @param {string} [params.partner_telescope] - Partner telescope ID
   * @returns {Promise<Object>} Target list with all targets
   * @example
   * const list = await client.getTargetListById('12345678', {
   *   lat: 38.7223,
   *   lon: -9.1393,
   *   timezone: 'Europe/Lisbon'
   * });
   */
  async getTargetListById(id, params = {}) {
    try {
      const response = await this.client.get(`/targets/lists/${id}`, { params });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get time information for major solar system bodies
   * @param {Object} params - Parameters for location and time
   * @param {number} params.lat - Latitude in decimal degrees
   * @param {number} params.lon - Longitude in decimal degrees
   * @param {string} params.timezone - Timezone (e.g., 'Europe/Lisbon')
   * @param {string} [params.datetime] - Date and time in ISO format
   * @param {string} [params.time_format] - Time format ('user', 'iso', 'utc')
   * @param {string} [params.partner_observatory] - Partner observatory ID
   * @param {string} [params.partner_telescope] - Partner telescope ID
   * @returns {Promise<Object>} Solar system times information
   * @example
   * const times = await client.getSolarSystemTimes({
   *   lat: 38.7223,
   *   lon: -9.1393,
   *   timezone: 'Europe/Lisbon'
   * });
   */
  async getSolarSystemTimes(params) {
    try {
      const response = await this.client.get('/solar-system/times', { params });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Search for astrophotography pictures
   * @param {Object} [params] - Search parameters
   * @param {number} [params.results_per_page] - Results per page
   * @param {string} [params.order] - Order results by field (e.g., 'is_featured')
   * @param {number} [params.page] - Page number
   * @param {string} [params.username] - Filter by username
   * @returns {Promise<Object>} Pictures search results
   * @example
   * const pictures = await client.searchPictures({
   *   results_per_page: 120,
   *   order: 'is_featured',
   *   page: 1,
   *   username: 'sebagr'
   * });
   */
  async searchPictures(params = {}) {
    try {
      const response = await this.client.get('/pictures/search', { params });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Handle API errors
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          throw new Error(`Bad Request: ${data.error || data.message || 'Invalid parameters'}`);
        case 401:
          throw new Error(`Unauthorized: ${data.error || data.message || 'Invalid API key'}`);
        case 429:
          throw new Error(`Too Many Requests: ${data.error || data.message || 'Rate limit exceeded'}`);
        default:
          throw new Error(`API Error (${status}): ${data.error || data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from API server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
}

module.exports = TelescopiusClient;
