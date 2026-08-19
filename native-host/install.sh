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

NODE_BIN="$(command -v node)"
if [ -z "$NODE_BIN" ]; then
  echo "node not found on PATH. Install Node.js and re-run." >&2
  exit 1
fi

mkdir -p "$DEST_DIR" "$CHROME_DIR"
install -m 755 "$SRC_DIR/keyhost.js" "$DEST_DIR/keyhost.js"

# GUI-launched Chrome does not inherit the shell PATH (e.g. mise-managed
# Node lives outside /usr/bin:/bin), so bake the resolved node path into the
# installed shebang.
sed -i "1s|^#!.*|#!$NODE_BIN|" "$DEST_DIR/keyhost.js"
if ! "$NODE_BIN" -e '1' >/dev/null 2>&1; then
  echo "node at $NODE_BIN is not runnable." >&2
  exit 1
fi

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