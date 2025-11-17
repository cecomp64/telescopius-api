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
   */
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.telescopius.com/v2.0';

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
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
   * @param {string} [params.sp_types] - Object types to search for (comma-separated: 'planet', 'galaxy', 'eneb', etc.)
   * @param {string} [params.sp_name] - Object name to search for
   * @param {boolean} [params.sp_name_exact] - Exact name match
   * @param {string} [params.sp_con] - Constellation code (e.g., 'ORI', 'CYG')
   * @param {number} [params.sp_min_alt] - Minimum altitude in degrees
   * @param {number} [params.sp_min_alt_minutes] - Minimum time at minimum altitude in minutes
   * @param {number} [params.sp_moon_dist_min] - Minimum moon distance in degrees
   * @param {number} [params.sp_moon_dist_max] - Maximum moon distance in degrees
   * @param {number} [params.sp_mag_max] - Maximum magnitude
   * @param {number} [params.sp_mag_min] - Minimum magnitude
   * @param {boolean} [params.sp_mag_unknown] - Include objects with unknown magnitude
   * @param {number} [params.sp_size_max] - Maximum size in arcminutes
   * @param {number} [params.sp_size_min] - Minimum size in arcminutes
   * @param {string} [params.sp_order] - Order results by field ('name', 'ra', 'dec', 'mag', 'size', 'alt', etc.)
   * @param {boolean} [params.sp_order_asc] - Ascending order
   * @param {number} [params.sp_results_per_page=50] - Results per page
   * @param {number} [params.sp_page=1] - Page number
   * @returns {Promise<{matched: number, objects: Array}>} Search results with matched count and objects array
   * @example
   * const results = await client.searchTargets({
   *   lat: 38.7223,
   *   lon: -9.1393,
   *   timezone: 'Europe/Lisbon',
   *   sp_types: 'galaxy,eneb',
   *   sp_min_alt: 30,
   *   sp_mag_max: 10
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
   * @param {string} [params.sp_types] - Object types to search for (comma-separated)
   * @param {number} [params.sp_min_alt] - Minimum altitude in degrees
   * @param {number} [params.sp_min_alt_minutes] - Minimum time at minimum altitude in minutes
   * @param {number} [params.sp_moon_dist_min] - Minimum moon distance in degrees
   * @param {number} [params.sp_moon_dist_max] - Maximum moon distance in degrees
   * @returns {Promise<{matched: number, objects: Array}>} Highlights with matched count and objects array
   * @example
   * const highlights = await client.getTargetHighlights({
   *   lat: 38.7223,
   *   lon: -9.1393,
   *   timezone: 'Europe/Lisbon',
   *   sp_types: 'galaxy,eneb'
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
