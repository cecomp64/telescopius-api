const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    console.log('=== Search for Andromeda Galaxy ===\n');

    // Search for a specific object by name
    const results = await client.searchTargets({
      lat: 38.7223,
      lon: -9.1393,
      timezone: 'Europe/Lisbon',
      name: 'Andromeda',
      name_exact: false  // Partial match
    });

    console.log(`Found ${results.matched} object(s) matching "Andromeda"\n`);

    results.objects.forEach((item) => {
      const obj = item.object;

      console.log(`Name: ${obj.main_name || obj.main_id}`);
      console.log(`All IDs: ${obj.ids.join(', ')}`);
      console.log(`Constellation: ${obj.con_name}`);
      console.log(`Type: ${obj.types.join(', ')}`);
      console.log(`Coordinates: RA ${obj.ra.toFixed(4)}h, Dec ${obj.dec.toFixed(4)}°`);

      if (obj.visual_mag) {
        console.log(`Visual Magnitude: ${obj.visual_mag}`);
      }

      if (obj.major_axis && obj.minor_axis) {
        const majArcmin = (obj.major_axis / 60).toFixed(1);
        const minArcmin = (obj.minor_axis / 60).toFixed(1);
        console.log(`Apparent Size: ${majArcmin}' × ${minArcmin}'`);
      }

      if (item.tonight_times) {
        console.log('\nTonight:');
        console.log(`  Rise: ${item.tonight_times.rise || 'Circumpolar/Never rises'}`);
        console.log(`  Transit: ${item.tonight_times.transit || 'N/A'}`);
        console.log(`  Set: ${item.tonight_times.set || 'Circumpolar/Never sets'}`);
      }

      if (item.transit_observation) {
        console.log('\nAt Transit:');
        console.log(`  Altitude: ${item.transit_observation.alt.toFixed(1)}°`);
        console.log(`  Azimuth: ${item.transit_observation.az.toFixed(1)}°`);
      }

      if (obj.main_image_url) {
        console.log(`\nImage: ${obj.main_image_url}`);
      }

      if (obj.url) {
        console.log(`More info: https://telescopius.com${obj.url}`);
      }

      console.log('\n' + '='.repeat(60) + '\n');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
