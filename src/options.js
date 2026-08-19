const saveButton = document.getElementById('save-button');
const apiKeyInput = document.getElementById('api-key');
const providerSelect = document.getElementById('provider-select');
const baseUrlGroup = document.getElementById('base-url-group');
const baseUrlInput = document.getElementById('base-url');
const modelSelect = document.getElementById('model-select');
const status = document.getElementById('status');
const importButton = document.getElementById('import-button');
const importStatus = document.getElementById('import-status');

const NATIVE_HOST = 'com.vibemonkey.keyhost';

const PROVIDERS = {
    gemini: {
        label: 'Google Gemini',
        baseUrl: null,
        models: [
            { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
            { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
            { value: 'gemini-pro', label: 'Gemini Pro (Vision)' }
        ]
    },
    zen: {
        label: 'OpenCode Zen',
        baseUrl: 'https://opencode.ai/zen/v1',
        models: [
            { value: 'deepseek-v4-flash-free', label: 'DeepSeek V4 Flash (Free)' },
            { value: 'hy3-free', label: 'Hy3 (Free)' },
            { value: 'hy3-preview-free', label: 'Hy3 Preview (Free)' },
            { value: 'ling-3.0-flash-free', label: 'Ling 3.0 Flash (Free)' },
            { value: 'ling-2.6-flash-free', label: 'Ling 2.6 Flash (Free)' },
            { value: 'ling-3.0-tiny-free', label: 'Ling 3.0 Tiny (Free)' },
            { value: 'laguna-s-2.1-free', label: 'Laguna S 2.1 (Free)' },
            { value: 'nemotron-3.5-lightning-free', label: 'Nemotron 3.5 Lightning (Free)' },
            { value: 'nemotron-3-super-free', label: 'Nemotron 3 Super (Free)' },
            { value: 'nemotron-3-ultra-free', label: 'Nemotron 3 Ultra (Free)' },
            { value: 'ring-2.6-1t-free', label: 'Ring 2.6 1T (Free)' },
            { value: 'kimi-k2.5-free', label: 'Kimi K2.5 (Free)' },
            { value: 'north-mini-code-free', label: 'North Mini Code (Free)' },
            { value: 'minimax-m3-free', label: 'MiniMax M3 (Free)' },
            { value: 'minimax-m2.5-free', label: 'MiniMax M2.5 (Free)' },
            { value: 'minimax-m2.1-free', label: 'MiniMax M2.1 (Free)' },
            { value: 'glm-4.7-free', label: 'GLM 4.7 (Free)' },
            { value: 'glm-5-free', label: 'GLM 5 (Free)' },
            { value: 'qwen3.6-plus-free', label: 'Qwen 3.6 Plus (Free)' },
            { value: 'mimo-v2-pro-free', label: 'MiMo V2 Pro (Free)' },
            { value: 'mimo-v2-flash-free', label: 'MiMo V2 Flash (Free)' },
            { value: 'mimo-v2.5-free', label: 'MiMo V2.5 (Free)' },
            { value: 'mimo-v2-omni-free', label: 'MiMo V2 Omni (Free)' },
            { value: 'trinity-large-preview-free', label: 'Trinity Large Preview (Free)' },
            { value: 'longcat-2.0-free', label: 'LongCat 2.0 (Free)' }
        ]
    }
};

function renderProvider() {
    const provider = providerSelect.value;
    const models = PROVIDERS[provider].models;

    modelSelect.innerHTML = '';
    models.forEach((m) => {
        const option = document.createElement('option');
        option.value = m.value;
        option.textContent = m.label;
        modelSelect.appendChild(option);
    });

    if (PROVIDERS[provider].baseUrl) {
        baseUrlGroup.style.display = 'flex';
        baseUrlInput.value = PROVIDERS[provider].baseUrl;
    } else {
        baseUrlGroup.style.display = 'none';
    }
}

saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const provider = providerSelect.value;
    const model = modelSelect.value;
    const baseUrl = PROVIDERS[provider].baseUrl ? baseUrlInput.value : '';
    chrome.storage.local.set({ apiKey: apiKey, provider: provider, model: model, baseUrl: baseUrl }, () => {
        status.textContent = 'Settings saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

providerSelect.addEventListener('change', renderProvider);

function importFromSystem() {
    importStatus.textContent = 'Reading key from system...';
    importStatus.classList.remove('error');

    let port;
    try {
        port = chrome.runtime.connectNative(NATIVE_HOST);
    } catch (e) {
        importStatus.textContent = 'Native host not available. Run native-host/install.sh with your extension ID.';
        importStatus.classList.add('error');
        return;
    }

    let received = false;

    port.onMessage.addListener((msg) => {
        if (msg.ok && msg.apiKey) {
            received = true;
            apiKeyInput.value = msg.apiKey;
            const provider = PROVIDERS[msg.provider] ? msg.provider : 'zen';
            providerSelect.value = provider;
            if (PROVIDERS[provider].baseUrl) {
                baseUrlInput.value = msg.baseUrl || PROVIDERS[provider].baseUrl;
            }
            renderProvider();
            if (msg.model && Array.from(modelSelect.options).some((o) => o.value === msg.model)) {
                modelSelect.value = msg.model;
            }
            importStatus.textContent = 'Imported from system. Click Save to store it.';
        } else {
            importStatus.textContent = 'No key found on system. Is OPENCODE_API_KEY set and the native host installed?';
            importStatus.classList.add('error');
        }
    });

    port.onDisconnect.addListener(() => {
        if (!received && chrome.runtime.lastError) {
            importStatus.textContent = 'Native host not found. Run native-host/install.sh with your extension ID.';
            importStatus.classList.add('error');
        }
    });

    port.postMessage({ type: 'get-key' });
}

importButton.addEventListener('click', importFromSystem);

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['apiKey', 'provider', 'model', 'baseUrl'], (data) => {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
        if (data.provider && PROVIDERS[data.provider]) {
            providerSelect.value = data.provider;
        }
        if (data.baseUrl) {
            baseUrlInput.value = data.baseUrl;
        }
        renderProvider();
        if (data.model && Array.from(modelSelect.options).some((o) => o.value === data.model)) {
            modelSelect.value = data.model;
        }
        if (!data.apiKey) {
            importFromSystem();
        }
    });
});