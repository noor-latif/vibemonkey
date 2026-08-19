<div align="center">
  <img src="icons/vibemonkey.svg" alt="VibeMonkey Logo" width="150">
  <h1>VibeMonkey</h1>
</div>

VibeMonkey is a Chrome extension that acts as your AI companion for generating userscripts on the fly. Simply describe a visual change you want to make to a webpage, and VibeMonkey will generate a Tampermonkey/Greasemonkey script to accomplish it.

## Features

-   **AI-Powered Script Generation**: Uses Google's Gemini models or free models from the [Nous Research Portal](https://portal.nousresearch.com) and OpenCode Zen to understand your requests and generate high-quality userscripts.
-   **Multi-Provider**: Choose between Google Gemini, the Nous Research Portal (OpenAI-compatible, `https://inference-api.nousresearch.com/v1`) and OpenCode Zen (OpenAI-compatible, `https://opencode.ai/zen/v1`). Only **free** models are listed (e.g. `tencent/hy3:free` on Nous, `deepseek-v4-flash-free` on Zen).
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
    -   Choose a **Provider** (`Google Gemini`, `Nous Research Portal` or `OpenCode Zen`), enter your API key, and pick a model. Only free models are listed, e.g. `tencent/hy3:free` (Nous) or `deepseek-v4-flash-free` (Zen).
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

---

*This project is experimental. Always review generated scripts before executing them.*
