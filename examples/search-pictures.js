const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    console.log('=== Featured Astrophotography Pictures ===\n');

    // Get featured pictures
    const featured = await client.searchPictures({
      results_per_page: 10,
      order: 'is_featured',
      page: 1
    });

    if (featured.results && featured.results.length > 0) {
      console.log(`Found ${featured.results.length} featured pictures:\n`);

      featured.results.forEach((picture, index) => {
        console.log(`${index + 1}. ${picture.title || 'Untitled'}`);
        if (picture.username) {
          console.log(`   By: ${picture.username}`);
        }
        if (picture.description) {
          const shortDesc = picture.description.substring(0, 60);
          console.log(`   ${shortDesc}${picture.description.length > 60 ? '...' : ''}`);
        }
        if (picture.url) {
          console.log(`   URL: https://telescopius.com${picture.url}`);
        }
        console.log();
      });
    }

    // Search pictures by a specific user
    console.log('\n=== Pictures by sebagr ===\n');

    const userPictures = await client.searchPictures({
      username: 'sebagr',
      results_per_page: 5,
      page: 1
    });

    if (userPictures.results && userPictures.results.length > 0) {
      console.log(`Found ${userPictures.results.length} pictures:\n`);

      userPictures.results.forEach((picture, index) => {
        console.log(`${index + 1}. ${picture.title || 'Untitled'}`);
        if (picture.object_names && picture.object_names.length > 0) {
          console.log(`   Objects: ${picture.object_names.join(', ')}`);
        }
        if (picture.acquisition_date) {
          console.log(`   Acquired: ${picture.acquisition_date}`);
        }
        console.log();
      });
    } else {
      console.log('No pictures found for this user.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
