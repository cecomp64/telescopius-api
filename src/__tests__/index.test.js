const TelescopiusClient = require('../index');
const ClientClass = require('../client');

describe('Index Module', () => {
  test('should export TelescopiusClient as default export', () => {
    expect(TelescopiusClient).toBe(ClientClass);
  });

  test('should export TelescopiusClient as named export', () => {
    expect(TelescopiusClient.TelescopiusClient).toBe(ClientClass);
  });

  test('should export TelescopiusClient as default property', () => {
    expect(TelescopiusClient.default).toBe(ClientClass);
  });

  test('should be able to instantiate client from default export', () => {
    const client = new TelescopiusClient({ apiKey: 'test-key' });
    expect(client).toBeInstanceOf(ClientClass);
  });

  test('should be able to instantiate client from named export', () => {
    const client = new TelescopiusClient.TelescopiusClient({ apiKey: 'test-key' });
    expect(client).toBeInstanceOf(ClientClass);
  });
});
