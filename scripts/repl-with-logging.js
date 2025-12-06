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
const readline = require('readline');

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

// Helper to strip ANSI codes (colors, cursor movement, etc.)
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '');
}

// Intercept console.log/error/warn for debug output from the client
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function(...args) {
  const message = args.map(arg =>
    typeof arg === 'object' ? util.inspect(arg, { depth: null, colors: false }) : String(arg)
  ).join(' ');
  logStream.write(message + '\n');
  originalConsoleLog.apply(console, args);
};

console.error = function(...args) {
  const message = args.map(arg =>
    typeof arg === 'object' ? util.inspect(arg, { depth: null, colors: false }) : String(arg)
  ).join(' ');
  logStream.write(message + '\n');
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.map(arg =>
    typeof arg === 'object' ? util.inspect(arg, { depth: null, colors: false }) : String(arg)
  ).join(' ');
  logStream.write(message + '\n');
  originalConsoleWarn.apply(console, args);
};

// Load the Telescopius SDK
const TelescopiusClient = require('../src/index.js');

// Print startup messages before creating REPL
if (process.env.TELESCOPIUS_API_KEY) {
  console.log('✅ TelescopiusClient loaded and "client" instance created');
  console.log('   Available: TelescopiusClient (class), client (instance)');
  console.log('   Debug mode: ENABLED (shows HTTP request/response details)');
} else {
  console.log('⚠️  TelescopiusClient loaded (no API key in .env)');
  console.log('   Available: TelescopiusClient (class)');
  console.log('   Create instance: const client = new TelescopiusClient({ apiKey: "YOUR_KEY" })');
}

console.log('\nType .help for REPL commands, .exit to quit\n');

// Create REPL instance
const replServer = repl.start({
  prompt: 'telescopius> ',
  input: process.stdin,
  output: process.stdout,
  useColors: true,
  ignoreUndefined: true,
  breakEvalOnSigint: true,
  writer: (output) => {
    // Log the output to file (without colors)
    const outputStr = util.inspect(output, {
      colors: false,
      depth: null,
      maxArrayLength: null,
      breakLength: 80,
      compact: false
    });
    logStream.write(outputStr + '\n');

    // Return formatted output for console (with colors)
    return util.inspect(output, {
      colors: true,
      depth: null,
      maxArrayLength: null,
      breakLength: 80,
      compact: false
    });
  }
});

// Store reference to original eval
const originalEval = replServer.eval;

// Track the last command to avoid duplicates
let lastLoggedCommand = '';

// Override eval to capture commands
replServer.eval = function(cmd, context, filename, callback) {
  // Call original eval
  return originalEval.call(this, cmd, context, filename, (err, result) => {
    // Only log if evaluation was successful and result is not undefined
    // This filters out incomplete multi-line input
    if (!err && result !== undefined) {
      const trimmed = cmd.trim();
      if (trimmed && trimmed !== '(undefined)') {
        // Remove the wrapping parentheses that REPL adds
        const cleanCmd = trimmed.replace(/^\(/, '').replace(/\n\)$/, '').trim();

        // Filter out autocomplete/inspection try-catch statements
        // These are internal REPL mechanisms and not user commands
        // Match patterns like: try { expr } catch {}, try { expr } catch {}
        const isTryCatch = /^try\s*\{[^}]+\}\s*catch\s*\{\s*\}$/s.test(cleanCmd);

        // Only log if this is different from the last command and not a try-catch
        if (!isTryCatch && cleanCmd !== lastLoggedCommand) {
          logStream.write(`telescopius> ${cleanCmd}\n`);
          lastLoggedCommand = cleanCmd;
        }
      }
    }
    callback(err, result);
  });
};

// Add TelescopiusClient to REPL context
replServer.context.TelescopiusClient = TelescopiusClient;

// If API key is available, create a pre-configured client instance
if (process.env.TELESCOPIUS_API_KEY) {
  replServer.context.client = new TelescopiusClient({
    apiKey: process.env.TELESCOPIUS_API_KEY,
    debug: true  // Enable debug mode by default
  });
}

// Handle REPL exit
replServer.on('exit', () => {
  const sessionEnd = `\nREPL Session Ended: ${new Date().toISOString()}\n`;
  logStream.write(sessionEnd);

  logStream.end(() => {
    process.stdout.write(`\n✅ Log saved to: ${logFilePath}\n`);
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
