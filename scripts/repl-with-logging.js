#!/usr/bin/env node

/**
 * REPL with logging
 * Launches a Node.js REPL with the Telescopius SDK loaded and captures
 * all console output to a date-based log file in the logs/ directory.
 */

const repl = require('repl');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { Writable } = require('stream');

// Load environment variables
require('dotenv').config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Generate log filename based on current date (YYYY-MM-DD format)
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
const logFileName = `repl-${dateStr}.log`;
const logFilePath = path.join(logsDir, logFileName);

// Create write stream for logging (append mode to reuse logs for same date)
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Write session start marker
const sessionStart = `\n${'='.repeat(80)}\nREPL Session Started: ${now.toISOString()}\n${'='.repeat(80)}\n`;
logStream.write(sessionStart);

console.log(`\n📝 Logging to: ${logFilePath}\n`);

// Store original streams and methods
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// Helper to strip ANSI codes (colors, cursor movement, etc.)
function stripAnsi(str) {
  // Remove all ANSI escape sequences:
  // - Color codes: \x1b[...m
  // - Cursor movement: \x1b[...G, \x1b[...J, \x1b[...K, etc.
  // - Other control sequences: \x1b[...
  return str.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '');
}

// Intercept stdout - capture everything written to stdout
process.stdout.write = (function(write) {
  return function(chunk, encoding, callback) {
    // Write to log file without color codes
    if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
      const str = chunk.toString();
      logStream.write(stripAnsi(str));
    }

    // Call original write with colors intact
    return write.apply(process.stdout, arguments);
  };
})(process.stdout.write);

// Intercept stderr
process.stderr.write = (function(write) {
  return function(chunk, encoding, callback) {
    // Write to log file without color codes
    if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
      const str = chunk.toString();
      logStream.write(stripAnsi(str));
    }

    // Call original write with colors intact
    return write.apply(process.stderr, arguments);
  };
})(process.stderr.write);

// Load the Telescopius SDK
const TelescopiusClient = require('../src/index.js');

// Create REPL instance
const replServer = repl.start({
  prompt: 'telescopius> ',
  useColors: true,
  ignoreUndefined: true,
  breakEvalOnSigint: true,
  writer: (output) => {
    // Use util.inspect to format output
    return util.inspect(output, {
      colors: true,
      depth: null,
      maxArrayLength: null,
      breakLength: 80,
      compact: false
    });
  }
});

// Add TelescopiusClient to REPL context
replServer.context.TelescopiusClient = TelescopiusClient;

// If API key is available, create a pre-configured client instance
if (process.env.TELESCOPIUS_API_KEY) {
  replServer.context.client = new TelescopiusClient({
    apiKey: process.env.TELESCOPIUS_API_KEY,
    debug: true  // Enable debug mode by default
  });
  console.log('✅ TelescopiusClient loaded and "client" instance created');
  console.log('   Available: TelescopiusClient (class), client (instance)');
  console.log('   Debug mode: ENABLED (shows HTTP request/response details)');
} else {
  console.log('⚠️  TelescopiusClient loaded (no API key in .env)');
  console.log('   Available: TelescopiusClient (class)');
  console.log('   Create instance: const client = new TelescopiusClient({ apiKey: "YOUR_KEY" })');
}

console.log('\nType .help for REPL commands, .exit to quit\n');

// Handle REPL exit
replServer.on('exit', () => {
  const sessionEnd = `\nREPL Session Ended: ${new Date().toISOString()}\n`;
  logStream.write(sessionEnd);

  // Restore original streams
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;

  logStream.end(() => {
    console.log(`\n✅ Log saved to: ${logFilePath}`);
    process.exit(0);
  });
});

// Log REPL reset events
replServer.on('reset', () => {
  logStream.write('\n[REPL RESET]\n\n');
});

// Handle cleanup on process termination
process.on('SIGINT', () => {
  replServer.close();
});
