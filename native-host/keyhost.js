#!/usr/bin/env node
'use strict';

// VibeMonkey native messaging host.
// Reads the OpenCode Zen API key from the environment (or an optional
// plain-text key file) and hands it to the extension, so the user does not
// have to paste the key manually.
//
// Protocol: length-prefixed JSON messages over stdio (Chrome native messaging).

const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(process.env.HOME || '', '.config', 'vibemonkey', 'zen.key');

function readMessage() {
  const header = Buffer.alloc(4);
  let read = 0;
  while (read < 4) {
    const n = fs.readSync(0, header, read, 4 - read, null);
    if (n <= 0) return null;
    read += n;
  }
  const length = header.readUInt32LE(0);
  const body = Buffer.alloc(length);
  read = 0;
  while (read < length) {
    const n = fs.readSync(0, body, read, length - read, null);
    if (n <= 0) return null;
    read += n;
  }
  return JSON.parse(body.toString('utf8'));
}

function writeMessage(message) {
  const body = Buffer.from(JSON.stringify(message));
  const header = Buffer.alloc(4);
  header.writeUInt32LE(body.length, 0);
  fs.writeSync(1, header);
  fs.writeSync(1, body);
}

function readKeyFile() {
  try {
    return fs.readFileSync(KEY_FILE, 'utf8').trim();
  } catch (e) {
    return '';
  }
}

function handle(request) {
  if (request.type !== 'get-key') {
    return { ok: false };
  }

  let apiKey = process.env.OPENCODE_API_KEY || '';
  if (!apiKey) {
    apiKey = readKeyFile();
  }

  return {
    ok: !!apiKey,
    provider: 'zen',
    baseUrl: 'https://opencode.ai/zen/v1',
    model: process.env.VIBEMONKEY_MODEL || 'deepseek-v4-flash-free',
    apiKey: apiKey
  };
}

// Keep the host alive: read messages until stdin closes. Exiting right after
// a reply makes Chrome fire onDisconnect with lastError, which the extension
// would misread as a failure.
while (true) {
  const request = readMessage();
  if (!request) break;
  writeMessage(handle(request));
}