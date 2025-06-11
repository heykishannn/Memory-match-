const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const capturedErrors = [];
  const capturedConsoleMessages = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      capturedErrors.push(text);
      console.error(`Browser Console Error: ${text}`);
    } else {
      capturedConsoleMessages.push(text);
      // console.log(`Browser Console Log: ${text}`); // Optional: Log all console messages
    }
  });

  const clearLocalStorage = async (key = 'memorymatch_user') => {
    await page.evaluate(k => localStorage.removeItem(k), key);
    console.log(`Cleared localStorage item: ${key}`);
  };

  const setLocalStorage = async (key, value) => {
    await page.evaluate(({k, v}) => localStorage.setItem(k, v), {k: key, v: value});
    console.log(`Set localStorage: ${key} = "${value}"`);
  };

  const reloadAndWaitForSplash = async () => {
    console.log("Reloading page...");
    await page.reload({ waitUntil: 'networkidle' });
    console.log("Page reloaded. Waiting for splash screen to pass (3.5s)...");
    await page.waitForTimeout(3500); // Wait for splash
  };

  const checkScreenVisibility = async (screenName, selector) => {
    const isVisible = await page.isVisible(selector);
    if (isVisible) {
      console.log(`SUCCESS: ${screenName} screen is visible as expected.`);
    } else {
      console.error(`FAILURE: ${screenName} screen is NOT visible. Auth visible: ${await page.isVisible('#auth')}, Home visible: ${await page.isVisible('#home')}`);
    }
    return isVisible;
  };

  try {
    console.log("Initial page load for setup...");
    await page.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle' });

    // --- Scenario A: Fresh start (no user data) ---
    console.log("\n--- Scenario A: Fresh start ---");
    await clearLocalStorage();
    await reloadAndWaitForSplash();
    await checkScreenVisibility("Auth (Scenario A)", "#auth");
    console.log("Scenario A finished.");

    // --- Scenario B: Valid user data ---
    console.log("\n--- Scenario B: Valid user data ---");
    await setLocalStorage('memorymatch_user', JSON.stringify({email: 'test@example.com', password: 'password'}));
    await reloadAndWaitForSplash();
    await checkScreenVisibility("Home (Scenario B)", "#home");
    console.log("Scenario B finished.");

    // --- Scenario C: Invalid JSON data in localStorage ---
    console.log("\n--- Scenario C: Invalid JSON data ---");
    capturedErrors.length = 0; // Clear previous errors
    capturedConsoleMessages.length = 0;
    await setLocalStorage('memorymatch_user', 'this is not valid json');
    await reloadAndWaitForSplash();
    await checkScreenVisibility("Auth (Scenario C)", "#auth");
    const foundJsonError = capturedErrors.some(msg => msg.includes("Error parsing saved user from localStorage"));
    if (foundJsonError) {
      console.log("SUCCESS: 'Error parsing saved user' message found in console for Scenario C.");
    } else {
      console.error("FAILURE: 'Error parsing saved user' message NOT found in console for Scenario C. All errors:", capturedErrors);
    }
    console.log("Scenario C finished.");

    // --- Scenario D: Null in localStorage (as string) ---
    console.log("\n--- Scenario D: 'null' string in localStorage ---");
    await setLocalStorage('memorymatch_user', 'null');
    await reloadAndWaitForSplash();
    await checkScreenVisibility("Auth (Scenario D)", "#auth");
    console.log("Scenario D finished.");

  } catch (e) {
    console.error('Test script error:', e.message, e.stack);
    capturedErrors.push(`Test Script Error: ${e.message}`);
  } finally {
    console.log("\n--- Test Run Summary ---");
    if (capturedErrors.length > 0) {
      console.error("Overall errors captured during the test run:\n", capturedErrors.join('\n'));
    } else {
      console.log("No script or unexpected browser console errors captured during the test run.");
    }
    await browser.close();
  }
})();
