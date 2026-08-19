const saveButton = document.getElementById('save-button');
const apiKeyInput = document.getElementById('api-key');
const providerSelect = document.getElementById('provider-select');
const baseUrlGroup = document.getElementById('base-url-group');
const baseUrlInput = document.getElementById('base-url');
const modelSelect = document.getElementById('model-select');
const status = document.getElementById('status');

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
    nous: {
        label: 'Nous Research Portal',
        baseUrl: 'https://inference-api.nousresearch.com/v1',
        models: [
            { value: 'deepseek-v4-flash-0731-free', label: 'DeepSeek V4 Flash 0731 (Free)' },
            { value: 'deepseek-v4-flash-0731', label: 'DeepSeek V4 Flash 0731' },
            { value: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
            { value: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
            { value: 'hermes-4-70b', label: 'Hermes 4 70B' }
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

    if (provider === 'nous') {
        baseUrlGroup.style.display = 'flex';
        if (!baseUrlInput.value) {
            baseUrlInput.value = PROVIDERS.nous.baseUrl;
        }
    } else {
        baseUrlGroup.style.display = 'none';
    }
}

saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const provider = providerSelect.value;
    const model = modelSelect.value;
    const baseUrl = provider === 'nous' ? baseUrlInput.value : '';
    chrome.storage.local.set({ apiKey: apiKey, provider: provider, model: model, baseUrl: baseUrl }, () => {
        status.textContent = 'Settings saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

providerSelect.addEventListener('change', renderProvider);

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
    });
});