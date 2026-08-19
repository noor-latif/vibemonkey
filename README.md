<div align="center">
  <img src="icons/vibemonkey.svg" alt="VibeMonkey Logo" width="150">
  <h1>VibeMonkey</h1>
</div>

VibeMonkey is a Chrome extension that acts as your AI companion for generating userscripts on the fly. Simply describe a visual change you want to make to a webpage, and VibeMonkey will generate a Tampermonkey/Greasemonkey script to accomplish it.

## Features

-   **AI-Powered Script Generation**: Uses Google's Gemini models or free models from OpenCode Zen to understand your requests and generate high-quality userscripts.
-   **Multi-Provider**: Choose between Google Gemini and OpenCode Zen (OpenAI-compatible, `https://opencode.ai/zen/v1`). Only **free** models are listed (e.g. `deepseek-v4-flash-free`).
-   **Key Reuse via Native Messaging**: An optional native messaging host reads your `OPENCODE_API_KEY` from the system, so you never have to paste the Zen key manually.
-   **Context-Aware**: Analyzes the current page's structure to create robust and effective scripts.
-   **Side Panel UI**: An easy-to-use interface that lives in your browser's side panel.
-   **Secure**: Your API key is stored locally and is never exposed.
-   **Customizable**: Choose the model that best suits your needs.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/vibemonkey.git
    ```
2.  **Install dependencies:**
    ```bash
    cd vibemonkey
    npm install
    ```
3.  **Build the extension:**
    ```bash
    npm run build
    ```
4.  **Load the extension in Chrome:**
    -   Open Chrome and navigate to `chrome://extensions`.
    -   Enable "Developer mode" in the top right corner.
    -   Click "Load unpacked".
    -   Select the `vibemonkey` directory.

## Usage

1.  **Set your API Key**:
    -   Click the VibeMonkey icon in the Chrome toolbar.
    -   Click "Settings".
    -   Choose a **Provider** (`Google Gemini` or `OpenCode Zen`). For Zen, either click **"Import from system"** (auto-reads your `OPENCODE_API_KEY`) or paste the key manually, then pick a free model (e.g. `deepseek-v4-flash-free`).
    -   Click "Save".
    -   When using the Nous Research Portal you can point the **Base URL** at any OpenAI-compatible endpoint (the default is `https://inference-api.nousresearch.com/v1`).
    -   Click "Save".
2.  **Generate a Script**:
    -   Open the webpage you want to modify.
    -   Click the VibeMonkey icon and select "Open Sidebar".
    -   In the sidebar, describe the change you want to make (e.g., "Change the background color of the header to blue").
    -   Click "Generate Script".
3.  **Use the Script**:
    -   The generated script will appear in the result area.
    -   You can **Copy** it to your clipboard or **Save** it as a `.user.js` file to be used with a userscript manager like Tampermonkey.

## Development

This project uses `webpack` to bundle the JavaScript files. To watch for changes and automatically rebuild during development, run:

```bash
npm run watch
```

## Native Messaging Host (auto-import the Zen key)

Chrome extensions cannot read your shell environment, so the extension uses a small native host to pull `OPENCODE_API_KEY` for you.

1.  Build and load the extension, then copy its ID from `chrome://extensions`.
2.  Install the host (Linux / Google Chrome):
    ```bash
    chmod +x native-host/keyhost.js native-host/install.sh
    ./native-host/install.sh <chrome-extension-id>
    ```
3.  Restart Chrome. In VibeMonkey settings, click **"Import from system"** — the key, provider and default free model are filled in automatically.

The host reads the key from `$OPENCODE_API_KEY` first. If you launch Chrome from a GUI (so the shell env is not inherited), write the key to `~/.config/vibemonkey/zen.key` and the host will read it from there instead.

---

*This project is experimental. Always review generated scripts before executing them.*
