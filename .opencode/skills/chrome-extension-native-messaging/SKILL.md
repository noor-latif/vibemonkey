---
name: chrome-extension-native-messaging
description: >
  Design, debug, or install a Chrome extension native messaging host — the bridge that lets
  an extension read shell environment variables or local files. Use whenever a Chrome
  extension must reuse an API key that lives in the environment (e.g. OPENCODE_API_KEY),
  or when connectNative reports "Native host not found", or when the task mentions
  NativeMessagingHosts, allowed_origins, com.vibemonkey.keyhost, connectNative, or
  native-host/install.sh.
---

# Chrome Extension Native Messaging (field-tested pitfalls)

Chrome extensions are sandboxed and cannot read shell env vars or local files. A
**native messaging host** is the only way to hand the extension an API key that already
exists on the machine. These are the traps found the hard way; verify against
https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging if in doubt.

## Architecture

- Extension declares `"nativeMessaging"` in `manifest.json` permissions.
- Extension connects via `chrome.runtime.connectNative('<host-name>')` and posts JSON.
- Chrome spawns the host process (Linux: direct `execve`, no shell). Host reads
  length-prefixed JSON from stdin, writes length-prefixed JSON to stdout.
- Protocol: each message = 4-byte **little-endian** length + UTF-8 JSON body. Host must use
  raw fd 0/1 reads/writes (`fs.readSync`/`fs.writeSync`), not the console.

## Registration (Linux / Google Chrome)

Host manifest at `~/.config/google-chrome/NativeMessagingHosts/<host-name>.json`:

```json
{
  "name": "com.vibemonkey.keyhost",
  "description": "...",
  "path": "/absolute/path/to/host.js",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://<EXTENSION_ID>/"]
}
```

- `<host-name>` must match the manifest `name` field exactly.
- `allowed_origins` is scoped to ONE extension ID; Chrome ignores the file if it doesn't
  match the connecting extension.
- The host file MUST be executable (`chmod +x`) and must not need a shell.
- Chrome reads the manifest only at browser START — registering while Chrome is running
  requires a full restart before the extension can connect.

## Extension ID for unpacked extensions (how to know it without guessing)

The ID is a pure function of the extension's absolute load path, NOT stored in manifest:

```python
import hashlib
def ext_id(path):
    h = hashlib.sha256(path.encode()).hexdigest()
    return ''.join(chr(97 + int(c, 16)) for c in h[:32])  # 0-9→a-j, a-f→k-p
```

Verify the running extension against this. To confirm the loaded ID/permissions, read
`~/.config/google-chrome/Default/Preferences` →
`extensions.settings.<id>.path` (should equal your path) and
`granted_permissions.api` (must include `nativeMessaging`).

## Pitfall 1 — shebang must be an ABSOLUTE node path

`#!/usr/bin/env node` breaks when Chrome is launched from a GUI: it inherits a minimal PATH
(`/usr/bin:/bin`) that does NOT include mise/volta/nvm node binaries. The host then fails to
launch and Chrome reports "Specified native messaging host not found" — indistinguishable
from "not registered". Fix: resolve node once at install time and bake it into the installed
copy's shebang:

```bash
NODE_BIN="$(command -v node)"
install -m 755 src/host.js ~/.local/share/<app>-keyhost/host.js
sed -i "1s|^#!.*|#!$NODE_BIN|" ~/.local/share/<app>-keyhost/host.js
```

## Pitfall 2 — the host MUST stay alive after replying

If the host exits right after writing its response, Chrome fires `onDisconnect` with
`lastError` ("native host has exited"). An options page that treats ANY disconnect as
failure will overwrite a successful import with a bogus "Native host not found" error.
Keep the host in a read loop until stdin closes:

```js
while (true) {
  const req = readMessage();
  if (!req) break;          // stdin closed by Chrome → exit
  writeMessage(handle(req));
}
```

## Pitfall 3 — guard the disconnect handler in the extension

In the extension, `port.onDisconnect` fires even after a clean exchange. Only show an error
when a reply was NEVER received:

```js
let received = false;
port.onMessage.addListener((msg) => { if (msg.ok) received = true; /* ... */ });
port.onDisconnect.addListener(() => {
  if (!received && chrome.runtime.lastError) { /* real failure: show install instructions */ }
});
```

## Environment fallback for GUI-launched Chrome

Even with a fixed shebang, a GUI-launched Chrome still has no `OPENCODE_API_KEY` in its
env. The host should fall back to an optional key file (e.g. `~/.config/<app>/zen.key`,
mode 600) after checking the environment. Document this fallback in the README.

## Testing without Chrome

Replicate Chrome's spawn exactly — `child_process.spawn(host, [], {stdio:['pipe','pipe','inherit']})`,
no shell, clean or restricted PATH — then send a length-prefixed message and assert the reply:

```js
const host = spawn('/abs/path/host.js', [], { stdio: ['pipe', 'pipe', 'inherit'] });
const b = Buffer.from(JSON.stringify({ type: 'get-key' }));
const h = Buffer.alloc(4); h.writeUInt32LE(b.length, 0);
host.stdin.write(Buffer.concat([h, b]));
// parse 4-byte length + JSON from host.stdout; assert ok & apiKey present
```

Restricted-PATH smoke test that catches Pitfall 1 before the user does:
`printf '<len>{"type":"get-key"}' | env PATH=/usr/bin:/bin host.js`.

## User workflow (what to tell the user)

1. Load unpacked extension, copy ID from `chrome://extensions`.
2. `./native-host/install.sh <extension-id>` (installs manifest + host, bakes node shebang).
3. Restart Chrome (full quit, not just window close). Extension reload alone is NOT enough
   for the host; it IS needed after a manifest permission change.
4. In the options page, trigger import; expect a success message, then Save.