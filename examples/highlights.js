const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    console.log('=== Tonight\'s Highlights ===\n');

    // Get popular targets best seen this time of year
    // Example location: New York, USA
    const highlights = await client.getTargetHighlights({
      lat: 40.7128,
      lon: -74.0060,
      timezone: 'America/New_York',
      types: 'galaxy,eneb,pneb,gcl',
      min_alt: 20,           // At least 20 degrees above horizon
      moon_dist_min: 20      // At least 20 degrees from moon
    });

    console.log(`${highlights.matched} popular targets are well-positioned tonight\n`);

    highlights.objects.slice(0, 15).forEach((item, index) => {
      const obj = item.object;

      // Determine object type name
      let typeName = 'Deep Sky Object';
      if (obj.types.includes('galaxy')) typeName = 'Galaxy';
      else if (obj.types.includes('eneb')) typeName = 'Emission Nebula';
      else if (obj.types.includes('pneb')) typeName = 'Planetary Nebula';
      else if (obj.types.includes('gcl')) typeName = 'Globular Cluster';
      else if (obj.types.includes('ocl')) typeName = 'Open Cluster';

      console.log(`${index + 1}. ${obj.main_name || obj.main_id}`);
      console.log(`   Type: ${typeName}`);
      console.log(`   Constellation: ${obj.con_name}`);

      if (obj.visual_mag || obj.photo_mag) {
        console.log(`   Magnitude: ${obj.visual_mag || obj.photo_mag}`);
      }

      if (item.tonight_times && item.tonight_times.transit) {
        console.log(`   Best viewing time (transit): ${item.tonight_times.transit}`);
      }

      // Show catalog IDs
      if (obj.alt_ids && obj.alt_ids.length > 0) {
        console.log(`   Also known as: ${obj.alt_ids.join(', ')}`);
      }

      console.log();
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
