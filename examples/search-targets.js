const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    console.log('=== Searching for Galaxies and Nebulae ===\n');

    // Search for galaxies and emission nebulae visible tonight
    // Example location: Lisbon, Portugal
    const results = await client.searchTargets({
      lat: 38.7223,
      lon: -9.1393,
      timezone: 'Europe/Lisbon',
      sp_types: 'galaxy,eneb',
      sp_min_alt: 30,           // At least 30 degrees above horizon
      sp_mag_max: 10,           // Magnitude 10 or brighter
      sp_moon_dist_min: 30,     // At least 30 degrees from moon
      sp_order: 'mag',          // Order by magnitude
      sp_order_asc: true,       // Brightest first
      sp_results_per_page: 10
    });

    console.log(`Found ${results.matched} objects matching criteria\n`);
    console.log('Top 10 targets for tonight:\n');

    results.objects.forEach((item, index) => {
      const obj = item.object;
      console.log(`${index + 1}. ${obj.main_name || obj.main_id}`);
      console.log(`   Type: ${obj.types[0] === 'galaxy' ? 'Galaxy' : 'Emission Nebula'}`);
      console.log(`   Constellation: ${obj.con_name} (${obj.con})`);
      console.log(`   Magnitude: ${obj.visual_mag || obj.photo_mag || 'Unknown'}`);

      if (obj.major_axis) {
        console.log(`   Size: ${(obj.major_axis / 60).toFixed(1)}' × ${(obj.minor_axis / 60).toFixed(1)}'`);
      }

      if (item.tonight_times) {
        console.log(`   Rise: ${item.tonight_times.rise || 'N/A'}, Transit: ${item.tonight_times.transit || 'N/A'}, Set: ${item.tonight_times.set || 'N/A'}`);
      }

      if (item.transit_observation) {
        console.log(`   Altitude at transit: ${item.transit_observation.alt.toFixed(1)}°`);
      }

      console.log();
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
