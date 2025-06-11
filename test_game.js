const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const screenSequence = ['Splash'];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error(`Console Error: ${msg.text()}`);
    } else {
      // console.log(`Console Log: ${msg.text()}`); // Optional: Log all console messages
    }
  });

  try {
    // 1. Load index.html
    console.log("Test Step 1: Loading index.html...");
    await page.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle' });
    console.log("index.html loaded.");

    // 2. Verify splash screen and transition to Auth or Home
    console.log("Test Step 2: Verifying splash screen transition...");
    await page.waitForTimeout(3500); // Wait for splash screen (3s) + buffer

    const authVisible = await page.isVisible('#auth');
    const homeVisible = await page.isVisible('#home');

    if (authVisible) {
      screenSequence.push('Auth');
      console.log("Splash transitioned to Auth screen.");

      // 3. Simulate signup and proceed to home
      console.log("Test Step 3: Auth screen visible. Simulating signup...");
      await page.evaluate(() => {
        localStorage.setItem('memorymatch_user', JSON.stringify({email: 'test@example.com', password: 'password'}));
      });
      // Directly call checkLogin if possible, or trigger an action that calls it.
      // For simplicity, we'll reload and let initializeGame handle it,
      // as checkLogin is normally called after splash.
      // Alternatively, if checkLogin is globally accessible (it isn't now), one could use: await page.evaluate(() => checkLogin());
      // Re-evaluating the most robust way: A reload will trigger initializeGame -> showSplash -> (new) checkLogin
      console.log("Simulating reload to trigger checkLogin after signup...");
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3500); // Wait for splash again after reload

      if (await page.isVisible('#home')) {
        screenSequence.push('Home (after signup)');
        console.log("Successfully transitioned to Home screen after simulated signup and reload.");
      } else if (await page.isVisible('#auth')) {
        screenSequence.push('Auth (still, after signup attempt)');
        console.error("Still on Auth screen after simulated signup and reload. Manual checkLogin might be needed if script allows.");
        // If this happens, it means checkLogin() was not effective or not called as expected by the test logic.
      } else {
        screenSequence.push('Unknown (after signup attempt)');
        console.error("Neither Auth nor Home screen visible after simulated signup and reload.");
      }

    } else if (homeVisible) {
      screenSequence.push('Home');
      console.log("Splash transitioned to Home screen (previous login).");
    } else {
      screenSequence.push('Unknown (after Splash)');
      console.error("Neither Auth nor Home screen visible after splash. Errors:", errors.join('\n'));
    }

    // 4. From home screen, click 'Start' for a new game
    if (await page.isVisible('#home')) {
      console.log("Test Step 4: Clicking 'Start' button for new game...");
      await page.click('#startBtn');
      await page.waitForTimeout(1000); // Wait for game to initialize
      if (await page.isVisible('#game')) {
        screenSequence.push('Game (New)');
        console.log("New game started successfully.");
      } else {
        screenSequence.push('Home (still, after Start click)');
        console.error("Game screen did not appear after clicking Start for new game.");
      }
    } else {
      console.log("Skipping Test Step 4 as Home screen is not visible.");
    }
    if (errors.length > 0) {
      console.error('Errors after new game attempt:', errors.join('\n'));
      errors.length = 0;
    }


    // 5. Simulate a game in progress
    console.log("Test Step 5: Simulating a game in progress via localStorage...");
    await page.evaluate(() => {
      localStorage.setItem('memorymatch_has_full_state', 'true');
      localStorage.setItem('memorymatch_full_state', JSON.stringify({
        level: 2, score: 100, timeLeft: 50,
        cards: [{emoji: '🍎', flipped: false, matched: false, idx: 0}, {emoji: '🍌', flipped: false, matched: false, idx: 1}],
        flippedIndices: [], matchedCount: 0, soundOn: true, vibrationOn: true, paused: false
      }));
    });
    console.log("localStorage set for resume.");

    // 6. Simulate page reload
    console.log("Test Step 6: Simulating page reload...");
    await page.reload({ waitUntil: 'networkidle' });
    console.log("Page reloaded.");

    // 7. After splash, click 'Start'. Game should resume.
    console.log("Test Step 7: Verifying splash and clicking 'Start' to resume game...");
    await page.waitForTimeout(3500); // Wait for splash screen

    // After reload, it should ideally go to Home if user was "logged in" (step 3) or if no auth is needed
    // Then, clicking start should use the full_state.
    if (await page.isVisible('#home')) {
        console.log("On Home screen after reload. Clicking 'Start' to resume...");
        await page.click('#startBtn');
        await page.waitForTimeout(1000); // Wait for game to resume

        if (await page.isVisible('#game')) {
            const levelDisplay = await page.textContent('#levelDisplay');
            if (levelDisplay.includes('Level: 2')) {
                screenSequence.push('Game (Resumed, Level 2)');
                console.log("Game resumed successfully to Level 2.");
            } else {
                screenSequence.push('Game (Resumed, Wrong Level)');
                console.error(`Game resumed, but to wrong level. Display: ${levelDisplay}`);
            }
        } else {
            screenSequence.push('Home (still, after resume attempt)');
            console.error("Game screen did not appear after clicking Start for resume.");
        }
    } else if (await page.isVisible('#auth')) {
        screenSequence.push('Auth (after reload for resume)');
        console.error("Landed on Auth screen after reload when trying to resume. Login state might have been lost or was never set for this part of test.");
    } else {
        screenSequence.push('Unknown (after reload for resume)');
        console.error("Neither Auth nor Home visible after reload for resume.");
    }


    if (errors.length > 0) {
      console.error('Errors during resume attempt:', errors.join('\n'));
    }

  } catch (e) {
    console.error('Test script error:', e.message, e.stack);
    errors.push(e.message);
  } finally {
    console.log("\n--- Test Summary ---");
    console.log("Screen Sequence:", screenSequence.join(' -> '));
    if (errors.length > 0) {
      console.error("Final recorded JavaScript errors:\n", errors.join('\n'));
    } else {
      console.log("No JavaScript errors recorded during the test.");
    }
    await browser.close();
  }
})();
