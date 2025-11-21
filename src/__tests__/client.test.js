const TelescopiusClient = require('../client');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('TelescopiusClient', () => {
  let client;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create client with valid API key', () => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
      expect(client.apiKey).toBe(mockApiKey);
      expect(client.baseURL).toBe('https://api.telescopius.com/v2.0');
    });

    test('should accept custom baseURL', () => {
      const customURL = 'https://custom.api.com/v1';
      client = new TelescopiusClient({ apiKey: mockApiKey, baseURL: customURL });
      expect(client.baseURL).toBe(customURL);
    });

    test('should throw error when API key is missing', () => {
      expect(() => new TelescopiusClient({})).toThrow('API key is required');
      expect(() => new TelescopiusClient()).toThrow('API key is required');
    });

    test('should configure axios with correct headers', () => {
      const mockCreate = jest.fn().mockReturnValue({});
      axios.create = mockCreate;

      client = new TelescopiusClient({ apiKey: mockApiKey });

      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'https://api.telescopius.com/v2.0',
        headers: {
          'Authorization': `Key ${mockApiKey}`,
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('getQuoteOfTheDay', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should fetch quote of the day successfully', async () => {
      const mockQuote = {
        text: 'You aren\'t in the Universe, you are the Universe.',
        author: 'Eckhart Tolle'
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockQuote })
      };

      const result = await client.getQuoteOfTheDay();

      expect(client.client.get).toHaveBeenCalledWith('/quote-of-the-day/');
      expect(result).toEqual(mockQuote);
    });

    test('should handle API errors', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 401,
            data: { error: 'Invalid API key' }
          }
        })
      };

      await expect(client.getQuoteOfTheDay()).rejects.toThrow('Unauthorized: Invalid API key');
    });
  });

  describe('searchTargets', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should search targets with valid parameters', async () => {
      const mockResponse = {
        matched: 239,
        objects: [
          {
            object: {
              main_id: 'NGC 7000',
              main_name: 'North America Nebula',
              ra: 20.979722,
              dec: 44.33,
              con: 'CYG'
            },
            tonight_times: {
              rise: '16:33',
              transit: '22:26',
              set: '04:31'
            }
          }
        ]
      };

      const params = {
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon',
        types: 'galaxy,eneb',
        min_alt: 30
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      };

      const result = await client.searchTargets(params);

      expect(client.client.get).toHaveBeenCalledWith('/targets/search', { params });
      expect(result).toEqual(mockResponse);
      expect(result.matched).toBe(239);
      expect(result.objects).toHaveLength(1);
    });

    test('should handle empty results', async () => {
      const mockResponse = {
        matched: 0,
        objects: []
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      };

      const result = await client.searchTargets({
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      });

      expect(result.matched).toBe(0);
      expect(result.objects).toEqual([]);
    });

    test('should handle bad request error', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: { error: 'Invalid latitude' }
          }
        })
      };

      await expect(client.searchTargets({
        lat: 'invalid',
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      })).rejects.toThrow('Bad Request: Invalid latitude');
    });
  });

  describe('getTargetHighlights', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should fetch target highlights successfully', async () => {
      const mockResponse = {
        matched: 50,
        objects: [
          {
            object: {
              main_id: 'M31',
              main_name: 'Andromeda Galaxy',
              ra: 0.712,
              dec: 41.269
            }
          }
        ]
      };

      const params = {
        lat: 40.7128,
        lon: -74.0060,
        timezone: 'America/New_York',
        types: 'galaxy'
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      };

      const result = await client.getTargetHighlights(params);

      expect(client.client.get).toHaveBeenCalledWith('/targets/highlights', { params });
      expect(result).toEqual(mockResponse);
      expect(result.matched).toBe(50);
    });

    test('should work with minimal parameters', async () => {
      const mockResponse = {
        matched: 100,
        objects: []
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      };

      const result = await client.getTargetHighlights({
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      });

      expect(result.matched).toBe(100);
    });
  });

  describe('getTargetLists', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should fetch all target lists successfully', async () => {
      const mockLists = [
        { id: '12345678', name: 'My First List' },
        { id: '87654321', name: 'Messier Objects' },
        { id: '11223344', name: 'NGC Galaxies' }
      ];

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockLists })
      };

      const result = await client.getTargetLists();

      expect(client.client.get).toHaveBeenCalledWith('/targets/lists');
      expect(result).toEqual(mockLists);
      expect(result).toHaveLength(3);
    });

    test('should handle empty lists', async () => {
      client.client = {
        get: jest.fn().mockResolvedValue({ data: [] })
      };

      const result = await client.getTargetLists();

      expect(result).toEqual([]);
    });

    test('should handle API errors', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 401,
            data: { error: 'Invalid API key' }
          }
        })
      };

      await expect(client.getTargetLists()).rejects.toThrow('Unauthorized: Invalid API key');
    });
  });

  describe('getTargetListById', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should fetch target list by ID successfully', async () => {
      const mockList = {
        id: '12345678',
        name: 'My First List',
        targets: [
          { main_id: 'M31', main_name: 'Andromeda Galaxy' },
          { main_id: 'M42', main_name: 'Orion Nebula' }
        ]
      };

      const listId = '12345678';
      const params = {
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockList })
      };

      const result = await client.getTargetListById(listId, params);

      expect(client.client.get).toHaveBeenCalledWith(`/targets/lists/${listId}`, { params });
      expect(result).toEqual(mockList);
    });

    test('should work without optional parameters', async () => {
      const mockList = { id: '12345678', name: 'Test List' };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockList })
      };

      const result = await client.getTargetListById('12345678');

      expect(client.client.get).toHaveBeenCalledWith('/targets/lists/12345678', { params: {} });
      expect(result).toEqual(mockList);
    });

    test('should handle not found error', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 404,
            data: { error: 'List not found' }
          }
        })
      };

      await expect(client.getTargetListById('invalid-id')).rejects.toThrow('API Error (404): List not found');
    });
  });

  describe('getSolarSystemTimes', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should fetch solar system times successfully', async () => {
      const mockTimes = {
        sun: {
          rise: '06:30',
          set: '18:45',
          transit: '12:37'
        },
        moon: {
          rise: '20:15',
          set: '08:30',
          transit: '02:22',
          phase: 0.75
        },
        mercury: {
          rise: '05:45',
          set: '17:20'
        }
      };

      const params = {
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockTimes })
      };

      const result = await client.getSolarSystemTimes(params);

      expect(client.client.get).toHaveBeenCalledWith('/solar-system/times', { params });
      expect(result).toEqual(mockTimes);
      expect(result.sun).toBeDefined();
      expect(result.moon).toBeDefined();
    });

    test('should support time format parameter', async () => {
      const mockTimes = { sun: {}, moon: {} };

      const params = {
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon',
        time_format: 'iso'
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockTimes })
      };

      await client.getSolarSystemTimes(params);

      expect(client.client.get).toHaveBeenCalledWith('/solar-system/times', { params });
    });

    test('should handle API errors', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: { error: 'Invalid coordinates' }
          }
        })
      };

      await expect(client.getSolarSystemTimes({
        lat: 'invalid',
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      })).rejects.toThrow('Bad Request: Invalid coordinates');
    });
  });

  describe('searchPictures', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should search pictures with parameters', async () => {
      const mockResponse = {
        results: [
          {
            id: '12345',
            title: 'Andromeda Galaxy',
            username: 'sebagr',
            is_featured: true
          }
        ],
        total: 100
      };

      const params = {
        results_per_page: 120,
        order: 'is_featured',
        page: 1,
        username: 'sebagr'
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      };

      const result = await client.searchPictures(params);

      expect(client.client.get).toHaveBeenCalledWith('/pictures/search', { params });
      expect(result).toEqual(mockResponse);
    });

    test('should work without parameters', async () => {
      const mockResponse = { results: [], total: 0 };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      };

      const result = await client.searchPictures();

      expect(client.client.get).toHaveBeenCalledWith('/pictures/search', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    test('should handle errors', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: { error: 'Invalid parameters' }
          }
        })
      };

      await expect(client.searchPictures({ page: -1 })).rejects.toThrow('Bad Request');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should handle 401 Unauthorized error', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 401,
            data: { message: 'Invalid credentials' }
          }
        })
      };

      await expect(client.getQuoteOfTheDay()).rejects.toThrow('Unauthorized: Invalid credentials');
    });

    test('should handle 429 Rate Limit error', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 429,
            data: { error: 'Rate limit exceeded' }
          }
        })
      };

      await expect(client.searchTargets({
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      })).rejects.toThrow('Too Many Requests: Rate limit exceeded');
    });

    test('should handle network errors', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          request: {}
        })
      };

      await expect(client.getQuoteOfTheDay()).rejects.toThrow('No response from API server');
    });

    test('should handle generic errors', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 500,
            data: { error: 'Internal server error' }
          }
        })
      };

      await expect(client.getQuoteOfTheDay()).rejects.toThrow('API Error (500): Internal server error');
    });

    test('should handle errors without data', async () => {
      client.client = {
        get: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: {}
          }
        })
      };

      await expect(client.getQuoteOfTheDay()).rejects.toThrow('Bad Request: Invalid parameters');
    });

    test('should rethrow unexpected errors', async () => {
      const customError = new Error('Custom error');
      client.client = {
        get: jest.fn().mockRejectedValue(customError)
      };

      await expect(client.getQuoteOfTheDay()).rejects.toThrow('Custom error');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      client = new TelescopiusClient({ apiKey: mockApiKey });
    });

    test('should pass all parameters correctly to searchTargets', async () => {
      const params = {
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon',
        datetime: '2024-01-15T20:00:00',
        types: 'galaxy,eneb,pneb',
        name: 'Andromeda',
        name_exact: false,
        con: 'AND',
        min_alt: 30,
        min_alt_minutes: 60,
        moon_dist_min: 30,
        mag_max: 10,
        mag_min: 5,
        order: 'mag',
        order_asc: true,
        results_per_page: 20,
        page: 1
      };

      client.client = {
        get: jest.fn().mockResolvedValue({ data: { matched: 0, objects: [] } })
      };

      await client.searchTargets(params);

      expect(client.client.get).toHaveBeenCalledWith('/targets/search', { params });
    });

    test('should handle multiple consecutive API calls', async () => {
      const mockQuote = { text: 'Quote', author: 'Author' };
      const mockTargets = { matched: 5, objects: [] };

      let callCount = 0;
      client.client = {
        get: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: mockQuote });
          } else {
            return Promise.resolve({ data: mockTargets });
          }
        })
      };

      const quote = await client.getQuoteOfTheDay();
      const targets = await client.searchTargets({
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      });

      expect(quote).toEqual(mockQuote);
      expect(targets).toEqual(mockTargets);
      expect(client.client.get).toHaveBeenCalledTimes(2);
    });
  });
});
