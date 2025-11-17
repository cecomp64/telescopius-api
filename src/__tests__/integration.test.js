require('dotenv').config();
const TelescopiusClient = require('../client');

// These are integration tests that make real API calls
// They require a valid API key in the .env file

describe('Telescopius API Integration Tests', () => {
  let client;

  beforeAll(() => {
    const apiKey = process.env.TELESCOPIUS_API_KEY;

    if (!apiKey) {
      throw new Error('TELESCOPIUS_API_KEY not found in .env file');
    }

    client = new TelescopiusClient({ apiKey });
  });

  // Test location: Lisbon, Portugal
  const testLocation = {
    lat: 38.7223,
    lon: -9.1393,
    timezone: 'Europe/Lisbon'
  };

  describe('getQuoteOfTheDay', () => {
    test('should fetch quote of the day from real API', async () => {
      const quote = await client.getQuoteOfTheDay();

      expect(quote).toBeDefined();
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
      expect(typeof quote.text).toBe('string');
      expect(typeof quote.author).toBe('string');
      expect(quote.text.length).toBeGreaterThan(0);

      console.log(`\nQuote: "${quote.text}" - ${quote.author}`);
    });
  });

  describe('searchTargets', () => {
    test('should search for galaxies from real API', async () => {
      const results = await client.searchTargets({
        ...testLocation,
        types: 'gxy',
        min_alt: 20,
        mag_max: 12,
        results_per_page: 5
      });

      expect(results).toBeDefined();
      expect(results).toHaveProperty('matched');
      expect(typeof results.matched).toBe('number');

      // API returns either 'objects' or 'page_results'
      const objectsArray = results.objects || results.page_results;
      expect(objectsArray).toBeDefined();
      expect(Array.isArray(objectsArray)).toBe(true);

      if (objectsArray && objectsArray.length > 0) {
        const firstObject = objectsArray[0];
        expect(firstObject).toHaveProperty('object');
        expect(firstObject.object).toHaveProperty('main_id');

        console.log(`\nFound ${results.matched} results`);
        console.log(`First result: ${firstObject.object.main_name || firstObject.object.main_id}`);
      }
    }, 10000); // 10 second timeout

    test('should search by object name from real API', async () => {
      const results = await client.searchTargets({
        ...testLocation,
        name: 'Andromeda',
        name_exact: false
      });

      expect(results).toBeDefined();
      expect(results.matched).toBeGreaterThan(0);

      const objectsArray = results.objects || results.page_results;
      expect(objectsArray).toBeDefined();

      if (objectsArray && objectsArray.length > 0) {
        const andromeda = objectsArray.find(obj =>
          obj.object.main_id === 'M 31' || obj.object.main_name === 'Andromeda Galaxy'
        );

        if (andromeda) {
          console.log(`\nFound Andromeda Galaxy:`);
          console.log(`  ID: ${andromeda.object.main_id}`);
          console.log(`  Name: ${andromeda.object.main_name}`);
          console.log(`  Magnitude: ${andromeda.object.visual_mag || andromeda.object.photo_mag}`);
        }
      }
    }, 10000);
  });

  describe('getTargetHighlights', () => {
    test('should fetch target highlights from real API', async () => {
      const highlights = await client.getTargetHighlights({
        ...testLocation,
        types: 'gxy,eneb,pneb',
        min_alt: 20
      });

      expect(highlights).toBeDefined();
      expect(highlights).toHaveProperty('matched');
      expect(typeof highlights.matched).toBe('number');

      const objectsArray = highlights.objects || highlights.page_results;
      expect(objectsArray).toBeDefined();
      expect(Array.isArray(objectsArray)).toBe(true);

      if (objectsArray && objectsArray.length > 0) {
        console.log(`\nTonight's highlights: ${highlights.matched} objects`);
        console.log(`Top 3:`);
        objectsArray.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.object.main_name || item.object.main_id}`);
        });
      }
    }, 10000);
  });

  describe('getTargetLists', () => {
    test('should fetch user target lists from real API', async () => {
      const lists = await client.getTargetLists();

      expect(lists).toBeDefined();
      expect(Array.isArray(lists)).toBe(true);

      if (lists.length > 0) {
        const firstList = lists[0];
        expect(firstList).toHaveProperty('id');
        expect(firstList).toHaveProperty('name');
        expect(typeof firstList.id).toBe('string');
        expect(typeof firstList.name).toBe('string');

        console.log(`\nFound ${lists.length} target list(s):`);
        lists.forEach(list => {
          console.log(`  - ${list.name} (${list.id})`);
        });
      } else {
        console.log('\nNo target lists found for this account');
      }
    }, 10000);
  });

  describe('getTargetListById', () => {
    test('should fetch a specific target list from real API', async () => {
      // First get all lists
      const lists = await client.getTargetLists();

      if (lists.length > 0) {
        const listId = lists[0].id;

        const listDetails = await client.getTargetListById(listId, testLocation);

        expect(listDetails).toBeDefined();
        expect(listDetails).toHaveProperty('id');
        expect(listDetails.id).toBe(listId);

        console.log(`\nList Details: ${listDetails.name || 'Unnamed'}`);
        if (listDetails.targets && listDetails.targets.length > 0) {
          console.log(`  ${listDetails.targets.length} targets in list`);
          console.log(`  First target: ${listDetails.targets[0].main_name || listDetails.targets[0].main_id}`);
        }
      } else {
        console.log('\nSkipping test - no target lists available');
        expect(lists.length).toBe(0); // Still pass the test
      }
    }, 10000);
  });

  describe('getSolarSystemTimes', () => {
    test('should fetch solar system times from real API', async () => {
      const times = await client.getSolarSystemTimes(testLocation);

      expect(times).toBeDefined();
      expect(times).toHaveProperty('sun');
      expect(times).toHaveProperty('moon');

      // Sun times
      expect(times.sun).toHaveProperty('rise');
      expect(times.sun).toHaveProperty('set');
      expect(times.sun).toHaveProperty('transit');

      // Moon times
      expect(times.moon).toHaveProperty('rise');
      expect(times.moon).toHaveProperty('set');
      expect(times.moon).toHaveProperty('transit');

      console.log('\nSolar System Times:');
      console.log(`  Sun: Rise ${times.sun.rise}, Set ${times.sun.set}`);
      console.log(`  Moon: Rise ${times.moon.rise}, Set ${times.moon.set}`);

      if (times.moon.phase !== undefined) {
        const phasePercent = (times.moon.phase * 100).toFixed(1);
        console.log(`  Moon Phase: ${phasePercent}% illuminated`);
      }

      // Check for planets
      const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
      planets.forEach(planet => {
        if (times[planet]) {
          console.log(`  ${planet.charAt(0).toUpperCase() + planet.slice(1)}: Rise ${times[planet].rise}, Set ${times[planet].set}`);
        }
      });
    }, 10000);

    test('should support different time formats', async () => {
      const timesISO = await client.getSolarSystemTimes({
        ...testLocation,
        time_format: 'iso'
      });

      expect(timesISO).toBeDefined();
      expect(timesISO.sun).toBeDefined();

      console.log(`\nSun times (ISO format): ${timesISO.sun.rise}`);
    }, 10000);
  });

  describe('Error Handling', () => {
    test('should handle invalid coordinates gracefully', async () => {
      await expect(client.searchTargets({
        lat: 999, // Invalid latitude
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      })).rejects.toThrow();
    });

    test('should handle invalid list ID gracefully', async () => {
      await expect(client.getTargetListById('invalid-list-id-12345')).rejects.toThrow();
    });
  });
});
