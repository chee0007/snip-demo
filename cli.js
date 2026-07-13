#!/usr/bin/env node

const BASE_URL = process.env.SNIP_API || 'http://localhost:3000';

function printUsage() {
  console.log(`Usage:
  snip add <url>      Create a short link
  snip ls             List all links
  snip open <code>    Open a short link in the browser
  snip help           Show this help message
`);
}

async function addLink(url) {
  if (!url) {
    console.error('Error: URL is required');
    printUsage();
    process.exit(1);
  }

  // Validate URL
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      console.error('Error: URL must use http or https protocol');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error: Invalid URL format');
    process.exit(1);
  }

  try {
    const response = await fetch(`${BASE_URL}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Error: ${error.error || 'Failed to create short link'}`);
      process.exit(1);
    }

    const link = await response.json();
    console.log(link.shortUrl);
  } catch (err) {
    console.error(`Error: Unable to reach backend at ${BASE_URL}`);
    process.exit(1);
  }
}

async function listLinks() {
  try {
    const response = await fetch(`${BASE_URL}/api/links`);

    if (!response.ok) {
      console.error('Error: Failed to fetch links');
      process.exit(1);
    }

    const links = await response.json();

    if (links.length === 0) {
      console.log('No links yet.');
      return;
    }

    // Calculate column widths
    const codeWidth = Math.max(4, ...links.map(l => l.code.length));
    const hitsWidth = Math.max(4, ...links.map(l => String(l.hits).length));

    // Print header
    console.log(
      padEnd('CODE', codeWidth) + '  ' +
      padEnd('HITS', hitsWidth) + '  ' +
      'URL'
    );
    console.log('-'.repeat(codeWidth + hitsWidth + 50));

    // Print links
    links.forEach(link => {
      console.log(
        padEnd(link.code, codeWidth) + '  ' +
        padEnd(String(link.hits), hitsWidth) + '  ' +
        link.url
      );
    });
  } catch (err) {
    console.error(`Error: Unable to reach backend at ${BASE_URL}`);
    process.exit(1);
  }
}

async function openLink(code) {
  if (!code) {
    console.error('Error: Short code is required');
    printUsage();
    process.exit(1);
  }

  try {
    const response = await fetch(`${BASE_URL}/${code}`, {
      method: 'GET',
      redirect: 'manual'
    });

    if (response.status === 302) {
      const location = response.headers.get('location');
      if (!location) {
        console.error('Error: No redirect location found');
        process.exit(1);
      }

      // Open in browser based on platform
      const { exec } = require('child_process');
      const platform = process.platform;
      
      let command;
      if (platform === 'win32') {
        command = `start "" "${location}"`;
      } else if (platform === 'darwin') {
        command = `open "${location}"`;
      } else {
        command = `xdg-open "${location}"`;
      }

      exec(command, (error) => {
        if (error) {
          console.error('Error: Failed to open browser');
          process.exit(1);
        }
      });

      console.log(`Opening: ${location}`);
    } else if (response.status === 404) {
      console.error(`Error: Short code "${code}" not found`);
      process.exit(1);
    } else {
      console.error('Error: Unexpected response from server');
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: Unable to reach backend at ${BASE_URL}`);
    process.exit(1);
  }
}

function padEnd(str, width) {
  return str + ' '.repeat(Math.max(0, width - str.length));
}

// Main CLI logic
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help') {
  printUsage();
  process.exit(0);
}

switch (command) {
  case 'add':
    addLink(args[1]);
    break;
  case 'ls':
    listLinks();
    break;
  case 'open':
    openLink(args[1]);
    break;
  default:
    console.error(`Error: Unknown command "${command}"`);
    printUsage();
    process.exit(1);
}
