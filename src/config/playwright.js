const { chromium } = require('playwright');

async function getBrowser() {
    const browser = await chromium.launch({ headless: true });
    return browser;
}

module.exports = getBrowser;
