#!/usr/bin/env bash
# Installs the VibeMonkey native messaging host for Google Chrome.
#
# Usage: ./install.sh <chrome-extension-id>
# Get the extension ID from chrome://extensions after loading VibeMonkey
# (it is shown in the card once Developer mode is enabled).
set -euo pipefail

EXT_ID="${1:-}"
HOST_NAME="com.vibemonkey.keyhost"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="$HOME/.local/share/vibemonkey-keyhost"
CHROME_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"

if [ -z "$EXT_ID" ]; then
  echo "Usage: $0 <chrome-extension-id>" >&2
  echo "Get the ID from chrome://extensions after loading VibeMonkey." >&2
  exit 1
fi

if [ ! -x "$SRC_DIR/keyhost.js" ] && [ ! -x "$DEST_DIR/keyhost.js" ]; then
  echo "keyhost.js not found or not executable." >&2
  exit 1
fi

mkdir -p "$DEST_DIR" "$CHROME_DIR"
install -m 755 "$SRC_DIR/keyhost.js" "$DEST_DIR/keyhost.js"

cat > "$CHROME_DIR/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Reads the OpenCode Zen API key from the environment for VibeMonkey",
  "path": "$DEST_DIR/keyhost.js",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXT_ID/"]
}
EOF

echo "Installed native host '$HOST_NAME' for extension '$EXT_ID'."
echo "Restart Chrome, then use 'Import from system' in VibeMonkey settings."
echo "Tip: if Chrome is launched from a GUI (no shell env), write the key to:"
echo "  $HOME/.config/vibemonkey/zen.key"