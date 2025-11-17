const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  // Initialize the client
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    // Get quote of the day
    console.log('=== Quote of the Day ===');
    const quote = await client.getQuoteOfTheDay();
    console.log(`"${quote.text}"`);
    console.log(`- ${quote.author}\n`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
