const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    console.log('=== Solar System Times ===\n');

    // Example location: Lisbon, Portugal
    const times = await client.getSolarSystemTimes({
      lat: 38.7223,
      lon: -9.1393,
      timezone: 'Europe/Lisbon',
      time_format: 'user'  // 'user', 'iso', or 'utc'
    });

    // Sun information
    if (times.sun) {
      console.log('SUN:');
      console.log(`  Sunrise:  ${times.sun.rise || 'N/A'}`);
      console.log(`  Transit:  ${times.sun.transit || 'N/A'}`);
      console.log(`  Sunset:   ${times.sun.set || 'N/A'}`);
      console.log();
    }

    // Moon information
    if (times.moon) {
      console.log('MOON:');
      console.log(`  Moonrise: ${times.moon.rise || 'N/A'}`);
      console.log(`  Transit:  ${times.moon.transit || 'N/A'}`);
      console.log(`  Moonset:  ${times.moon.set || 'N/A'}`);

      if (times.moon.phase !== undefined) {
        const phasePercent = (times.moon.phase * 100).toFixed(1);
        console.log(`  Phase:    ${phasePercent}% illuminated`);

        // Determine moon phase name
        const phase = times.moon.phase;
        let phaseName = '';
        if (phase < 0.05) phaseName = 'New Moon';
        else if (phase < 0.25) phaseName = 'Waxing Crescent';
        else if (phase < 0.30) phaseName = 'First Quarter';
        else if (phase < 0.50) phaseName = 'Waxing Gibbous';
        else if (phase < 0.55) phaseName = 'Full Moon';
        else if (phase < 0.75) phaseName = 'Waning Gibbous';
        else if (phase < 0.80) phaseName = 'Last Quarter';
        else phaseName = 'Waning Crescent';

        console.log(`            (${phaseName})`);
      }
      console.log();
    }

    // Planet information
    const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    console.log('PLANETS:');
    planets.forEach(planet => {
      if (times[planet]) {
        const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
        console.log(`\n  ${planetName}:`);
        console.log(`    Rise:    ${times[planet].rise || 'N/A'}`);
        console.log(`    Transit: ${times[planet].transit || 'N/A'}`);
        console.log(`    Set:     ${times[planet].set || 'N/A'}`);

        if (times[planet].magnitude !== undefined) {
          console.log(`    Magnitude: ${times[planet].magnitude.toFixed(1)}`);
        }
      }
    });

    console.log('\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
