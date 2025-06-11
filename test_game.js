// Simulate DOM and browser APIs
global.localStorage = {
  data: {},
  getItem: function(key) { return this.data[key] || null; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; }
};
global.window = {
  navigator: { vibrate: () => {} },
  open: () => {},
  addEventListener: () => {} // Mock window.addEventListener
};
global.Audio = function() {
  return {
    play: () => {}, pause: () => {}, load: () => {}, addEventListener: () => {}, removeEventListener: () => {},
    canPlayType: () => 'probably', volume: 1, muted: false, loop: false, currentTime: 0, duration: 0,
    paused: true, ended: false, src: ''
  };
};

global.document = {
  elementsById: {},
  eventListeners: {}, // Store listeners by type { 'click': [{element, listener}], ... }
  getElementById: function(id) {
    if (!this.elementsById[id]) {
      const element = {
        id: id,
        _classes: new Set(),
        classList: {
          add: function(cn) { element._classes.add(cn); element.className = Array.from(element._classes).join(' '); },
          remove: function(cn) { element._classes.delete(cn); element.className = Array.from(element._classes).join(' '); },
          contains: function(cn) { return element._classes.has(cn); }
        },
        style: {}, className: '', innerHTML: '', textContent: '', value: '', checked: false,
        children: [],
        appendChild: function(child) { this.children.push(child); },
        addEventListener: function(type, listener, options) {
          if (!global.document.eventListeners[type]) global.document.eventListeners[type] = [];
          global.document.eventListeners[type].push({elementId: this.id, listenerFunc: listener});
        },
        click: function() {
          if (this.onclick) {
            this.onclick();
          }
          const eventType = 'click';
          if (global.document.eventListeners[eventType]) {
            global.document.eventListeners[eventType].forEach(reg => {
              if (reg.elementId === this.id) {
                reg.listenerFunc.call(this);
              }
            });
          }
        },
        querySelector: (selector) => {
          if (this.id === 'splash' && selector === '.splash-cards') return global.document.getElementById('splashCards');
          return null;
        },
        setAttribute: (name, value) => { element[name] = value; },
        getAttribute: (name) => element[name],
        remove: () => { }
      };
      this.elementsById[id] = element;
    }
    return this.elementsById[id];
  },
  createElement: function(tagName) {
    const element = {
      tagName: tagName, _classes: new Set(),
      classList: { add: function(cn){element._classes.add(cn)}, remove: function(cn){element._classes.delete(cn)}, contains: function(cn){return element._classes.has(cn)} },
      style: {}, dataset: {}, innerHTML: '', children: [],
      appendChild: function(child) { element.children.push(child); },
      addEventListener: function(type, listener) { },
      setAttribute: (name, value) => { element[name] = value; },
      getAttribute: (name) => element[name],
      remove: () => { }
    };
    if (tagName === 'div') element.className = '';
    return element;
  },
  querySelector: function(selector) {
    if (selector === '.splash-cards') return this.getElementById('splashCards');
    return null;
  },
  _visibilityChangeListeners: [],
  addEventListener: function(type, listener) {
    if (type === 'visibilitychange') {
      this._visibilityChangeListeners.push(listener);
    }
  },
  hidden: false,
  simulateVisibilityChange: function(isHidden) {
    this.hidden = isHidden;
    this._visibilityChangeListeners.forEach(listener => listener());
  }
};

const idsToPrecreate = [
  'splash', 'splashCards', 'auth', 'home', 'game', 'board', 'winPopup', 'losePopup',
  'loginBtn', 'signupBtn', 'email', 'password', 'startBtn', 'resumeHomeBtn',
  'restartFrom1Btn', 'nextLevelBtn', 'homeBtn1', 'playAgainBtn', 'loseHomeBtn',
  'watchAdBtn', 'soundToggle', 'vibrationToggle', 'pauseBtn', 'levelDisplay',
  'timerDisplay', 'scoreDisplay', 'audio-tap', 'audio-win', 'audio-lose',
  'audio-pause', 'audio-restart', 'audio-gwak', 'audio-tamatar', 'audio-mor',
  'audio-sigma', 'audio-birthday', 'audio-sitar', 'audio-bell', 'resultLevel',
  'resultScore', 'resultTime', 'resultLevelL', 'resultScoreL', 'resultTimeL', 'pageOverlay'
];
idsToPrecreate.forEach(id => document.getElementById(id));

(async () => {
  const errors = [];
  const logs = [];
  const originalConsoleError = console.error;
  // console.error = (...args) => { errors.push(args.join(' ')); originalConsoleError(...args); };
  const originalConsoleLog = console.log;
  // console.log = (...args) => { logs.push(args.join(' ')); originalConsoleLog(...args); };


  try {
    originalConsoleLog("Test script: Starting execution.");

    originalConsoleLog("Test script: Loading script.js...");
    require('./script.js');
    originalConsoleLog("Test script: script.js loaded.");

    originalConsoleLog('--- Testing new game start ---');
    localStorage.setItem('memorymatch_user', JSON.stringify({email: 'test@example.com', password: 'password'}));
    originalConsoleLog("Test script: User set in localStorage for new game.");

    if (typeof showSplash === 'function') {
      originalConsoleLog("Test script: Calling showSplash()...");
      showSplash();
      originalConsoleLog("Test script: showSplash() finished.");
      await new Promise(resolve => setTimeout(resolve, 20)); // Wait for splash timeout (now 10ms in script.js)
    } else { originalConsoleError("showSplash function not found."); }

    if (typeof checkLogin === 'function') {
      originalConsoleLog("Test script: Calling checkLogin()...");
      checkLogin();
      originalConsoleLog("Test script: checkLogin() finished.");
    } else { originalConsoleError("checkLogin function not found."); }

    if (global.state && global.state.user && document.getElementById('home').classList.contains('hidden')) {
        if (typeof showHome === 'function') {
            originalConsoleLog("Test script: User logged in, home hidden. Calling showHome()...");
            showHome();
            originalConsoleLog("Test script: showHome() called.");
        } else {
            originalConsoleError("showHome function not found when trying to show home for logged in user.");
        }
    }
    await new Promise(resolve => setTimeout(resolve, 50));

    const startBtn = document.getElementById('startBtn');
    if (startBtn && startBtn.onclick) {
      originalConsoleLog("Test script: Clicking start button for new game...");
      startBtn.click();
      originalConsoleLog("Test script: Start button click simulated for new game.");
    } else { originalConsoleError("Start button or its onclick handler not found for new game."); }

    await new Promise(resolve => setTimeout(resolve, 200));

    originalConsoleLog("Test script: Checking results for new game start...");
    let gameScreenVisible = !document.getElementById('game').classList.contains('hidden');
    let homeScreenHidden = document.getElementById('home').classList.contains('hidden');

    if (errors.length > 0) {
      originalConsoleLog('Errors after starting a new game:', errors.join('\n'));
      errors.length = 0;
    } else if (gameScreenVisible && homeScreenHidden) {
      originalConsoleLog('New game started successfully.');
    } else {
      originalConsoleLog('New game did not start as expected.', `Game visible: ${gameScreenVisible}`, `Home hidden: ${homeScreenHidden}`);
    }

    originalConsoleLog('\n--- Testing game resume ---');
    localStorage.setItem('memorymatch_has_full_state', 'true');
    const fullGameState = {
      level: 2, score: 100, timeLeft: 50,
      cards: [{emoji: '🍎', flipped: false, matched: false, idx: 0}, {emoji: '🍌', flipped: false, matched: false, idx: 1}],
      flippedIndices: [], matchedCount: 0, soundOn: true, vibrationOn: true, paused: false
    };
    localStorage.setItem('memorymatch_full_state', JSON.stringify(fullGameState));
    originalConsoleLog("Test script: Full game state set in localStorage for resume.");

    document.getElementById('game').classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
    originalConsoleLog("Test script: UI reset for resume test (game hidden, home shown).");

    if (typeof showHome === 'function') {
        originalConsoleLog("Test script: Calling showHome() for resume context...");
        showHome();
        originalConsoleLog("Test script: showHome() for resume context finished.");
    }
    await new Promise(resolve => setTimeout(resolve, 50));


    if (startBtn && startBtn.onclick) {
      originalConsoleLog("Test script: Clicking start button for resume...");
      startBtn.click();
      originalConsoleLog("Test script: Start button click for resume simulated.");
    } else { originalConsoleError("Start button or its onclick handler not found for resume."); }

    await new Promise(resolve => setTimeout(resolve, 200));

    originalConsoleLog("Test script: Checking results for game resume...");
    gameScreenVisible = !document.getElementById('game').classList.contains('hidden');
    homeScreenHidden = document.getElementById('home').classList.contains('hidden');
    const resumedLevel = global.state ? global.state.level : -1;

    if (errors.length > 0) {
      originalConsoleLog('Errors after resuming game:', errors.join('\n'));
    } else if (gameScreenVisible && homeScreenHidden && resumedLevel === 2) {
      originalConsoleLog(`Game resumed successfully to level ${resumedLevel}.`);
    } else {
      originalConsoleLog('Game did not resume as expected.', `Game visible: ${gameScreenVisible}`, `Home hidden: ${homeScreenHidden}`, `Level: ${resumedLevel}`);
      if (global.state) {
        originalConsoleLog(`State at resume check: Level ${global.state.level}, Score ${global.state.score}, Cards ${global.state.cards ? global.state.cards.length : 'N/A'}`);
      }
    }

  } catch (e) {
    originalConsoleError('Test script error:', e.message, e.stack);
    errors.push(e.message);
  } finally {
    if (errors.length > 0) {
      originalConsoleLog("\nFinal recorded errors:\n", errors.join('\n'));
    } else {
      originalConsoleLog("\nTest script completed. See output above for results.");
    }
  }
})();
