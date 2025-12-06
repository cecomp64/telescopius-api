require('dotenv').config();
const TelescopiusClient = require('../src/index');

async function main() {
  // Create client with debug mode enabled
  const client = new TelescopiusClient({
    apiKey: process.env.TELESCOPIUS_API_KEY,
    debug: true  // Enable debug logging
  });

  console.log('=== Testing Debug Mode ===\n');
  console.log('Debug mode is enabled. You will see detailed HTTP request/response logs.\n');

  try {
    // Example 1: Simple request
    console.log('--- Example 1: Getting quote of the day ---');
    const quote = await client.getQuoteOfTheDay();
    console.log('\n[Result] Quote:', quote.text);

    // Example 2: Request with parameters
    console.log('\n\n--- Example 2: Searching for targets ---');
    const results = await client.searchTargets({
      lat: 38.7223,
      lon: -9.1393,
      timezone: 'Europe/Lisbon',
      types: 'gxy,eneb',
      min_alt: 30,
      mag_max: 10,
      results_per_page: 5
    });
    const objectsArray = results.objects || results.page_results;
    console.log(`\n[Result] Found ${results.matched} targets, showing ${objectsArray.length}`);

  } catch (error) {
    console.error('\n[Error]', error.message);
  }
}

main();
