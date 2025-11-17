const TelescopiusClient = require('../src/index');

// Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

async function main() {
  const client = new TelescopiusClient({
    apiKey: API_KEY
  });

  try {
    console.log('=== My Target Lists ===\n');

    // Get all lists
    const lists = await client.getTargetLists();

    if (lists.length === 0) {
      console.log('You have no target lists yet.');
      console.log('Create lists on https://telescopius.com to see them here.\n');
      return;
    }

    console.log(`You have ${lists.length} target list(s):\n`);

    lists.forEach((list, index) => {
      console.log(`${index + 1}. ${list.name} (ID: ${list.id})`);
    });

    // Get details for the first list
    if (lists.length > 0) {
      const firstListId = lists[0].id;
      console.log(`\n=== Details for "${lists[0].name}" ===\n`);

      const listDetails = await client.getTargetListById(firstListId, {
        lat: 38.7223,
        lon: -9.1393,
        timezone: 'Europe/Lisbon'
      });

      console.log(`List Name: ${listDetails.name}`);

      if (listDetails.targets && listDetails.targets.length > 0) {
        console.log(`Total Targets: ${listDetails.targets.length}\n`);
        console.log('Targets:');

        listDetails.targets.forEach((target, index) => {
          console.log(`  ${index + 1}. ${target.main_name || target.main_id}`);

          if (target.tonight_times) {
            console.log(`     Transit tonight: ${target.tonight_times.transit || 'N/A'}`);
          }

          if (target.transit_observation) {
            console.log(`     Max altitude: ${target.transit_observation.alt.toFixed(1)}°`);
          }
        });
      } else {
        console.log('This list is empty.');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
