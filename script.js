const EMOJIS = [
  "🍎","🍌","🍇","🍓","🍉","🍍","🥝","🍒","🍑","🍋",
  "🥥","🥭","🍐","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
  "🌷","🪷","🌸","🪻","🌺","🌼","🐼","🦄","🍂","🍄","🌿",
  "🐥","🐔","🦜","🕊️","🦢","🦋","🍨","🍧","🍭",
  "🍬","☕","🗿","🎂","🧸","🎹","💎","🔮","🐱",
  "🦚","🪕" // Added Peacock and Banjo emojis for sound effects as per list
];
const MAX_LEVEL = 100;
const MAX_CARDS_BEFORE_TIMER_DIFFICULTY = 30; // Constant to indicate when timer difficulty starts decreasing per card

// Ad Keys (Replace with your actual keys if they are different from placeholders)
const IMMEDIATE_TOP_AD_KEY_468x60 = 'f3980c7d80f3803dbaf4228f02da605b'; // For immediate top-center 468x60 ad
const TOP_RIGHT_AD_KEY_468x60 = 'f3980c7d80f3803dbaf4228f02da605b'; // This key should be unique if it's a different ad unit
const MIDDLE_AD_KEY_300x250 = '3606c322c11ecc95fb215e54122b24b9';
const RESPONSIVE_AD_SCRIPT_SRC = '//pl26778951.profitableratecpm.com/ce2d3cde4fcc3769cce04418ad7b7d93/invoke.js';
const RESPONSIVE_AD_CONTAINER_ID = 'container-ce2d3cde4fcc3769cce04418ad7b7d93';

// DOM Elements
const pageOverlay = document.getElementById('pageOverlay');
const splash = document.getElementById('splash');
const splashCards = document.querySelector('.splash-cards');
const auth = document.getElementById('auth');
const home = document.getElementById('home');
const game = document.getElementById('game');
const board = document.getElementById('board');
const winPopup = document.getElementById('winPopup');
const losePopup = document.getElementById('losePopup');
const continuePopup = document.getElementById('continuePopup');
const adOverlay = document.getElementById('adOverlay'); // Simple 5-second ad overlay
const adOverlayMessage = document.getElementById('adOverlayMessage');
const adOverlayTimer = document.getElementById('adOverlayTimer');
const stickyFooter = document.getElementById('stickyFooter');
const bannerAdContainer = document.getElementById('bannerAdContainer'); 
const customRewardScreen = document.getElementById('customRewardScreen'); // The new complex reward screen
const rewardCountdownTimer = document.getElementById('rewardCountdownTimer');
const rewardGuaranteedLabel = document.getElementById('rewardGuaranteedLabel');
const rewardBackButton = document.getElementById('rewardBackButton');
const rewardTopLeftContainer = document.getElementById('rewardTopLeftContainer'); // For the timer/back button
const rewardTopRightContainer = document.getElementById('rewardTopRightContainer'); // For the reward guaranteed label and ad stack
const immediateAdPlaceholder = document.getElementById('immediateAdPlaceholder'); // For the top-center 468x60 ad
const rewardAdBannerContainer_468x60 = document.getElementById('rewardAdBannerContainer_468x60');
const rewardAdBannerContainer_300x250 = document.getElementById('rewardAdBannerContainer_300x250');
const rewardAdBannerContainer_responsive = document.getElementById('rewardAdBannerContainer_responsive');

// Auth Buttons/Inputs
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Home/Start Buttons
const startBtn = document.getElementById('startBtn');

// Continue Popup Buttons
const watchAdContinueBtn = document.getElementById('watchAdContinueBtn');
const continueHomeBtn = document.getElementById('continueHomeBtn');
const startFromLevel1Btn = document.getElementById('startFromLevel1Btn');

// Win Popup Buttons
const nextLevelBtn = document.getElementById('nextLevelBtn');
const homeBtn1 = document.getElementById('homeBtn1');

// Lose Popup Buttons
const playAgainBtn = document.getElementById('playAgainBtn');
const loseWatchAdBtn = document.getElementById('loseWatchAdBtn');
const loseRestartHomeBtn = document.getElementById('loseRestartHomeBtn');

// Game Control Toggles/Buttons
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');
const pauseBtn = document.getElementById('pauseBtn');

// Game Stat Displays
const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');

// Audio Elements
const audioTap = document.getElementById('audio-tap');
const audioWin = document.getElementById('audio-win');
const audioLose = document.getElementById('audio-lose');
const audioPause = document.getElementById('audio-pause');
const audioRestart = document.getElementById('audio-restart');
const audioGwak = document.getElementById('audio-gwak');
const audioTamatar = document.getElementById('audio-tamatar');
const audioMor = document.getElementById('audio-mor');
const audioSigma = document.getElementById('audio-sigma');
const audioBirthday = document.getElementById('audio-birthday');
const audioSitar = document.getElementById('audio-sitar');
const audioBell = document.getElementById('audio-bell');
const audioKoni = document.getElementById('audio-koni');

// Result Popups' Displays
const resultLevel = document.getElementById('resultLevel');
const resultScore = document.getElementById('resultScore');
const resultTime = document.getElementById('resultTime');
const resultLevelL = document.getElementById('resultLevelL');
const resultScoreL = document.getElementById('resultScoreL');
const resultTimeL = document.getElementById('resultTimeL');

// Global State Object
let state = {
  user: null,
  level: 1,
  score: 0,
  timeLeft: 0,
  timerId: null,
  paused: false,
  soundOn: true,
  vibrationOn: true,
  cards: [],
  flippedIndices: [],
  matchedCount: 0,
  busy: false,
  isGameActive: true, // Flag to prevent multiple end-game states
  isMaxCardsReached: false, // Tracks if card count is capped by screen size
  levelCardsCapped: 0, // Stores the level number when cards were first capped
  hasFullState: false, // Indicates if a full game state is saved, for continue prompt
  pausedByVisibility: false, // Tracks if game was paused due to tab/window visibility
};

// --- Overlay & UI Visibility Helper Functions ---
function showOverlay() {
  if (pageOverlay) pageOverlay.classList.remove('hidden');
}

function hideOverlay() {
  if (pageOverlay) pageOverlay.classList.add('hidden');
}

function showFooterAndBanner() {
  if (stickyFooter) stickyFooter.classList.remove('hidden');
}

function hideFooterAndBanner() {
  if (stickyFooter) stickyFooter.classList.add('hidden');
}

// Function to show the *new custom reward screen* with multiple ads
let rewardScreenTimerId = null;
function showCustomRewardScreen(context) { // context can be 'continue' or 'lose'
  hideFooterAndBanner();
  // Ensure other popups/overlays are hidden before showing custom reward screen
  if (adOverlay) adOverlay.classList.add('hidden');
  hideOverlay(); // Hides the general page overlay

  if (customRewardScreen) customRewardScreen.classList.remove('hidden');
  stopAllSounds(); // Stop any game sounds for ad experience

  // --- IMMEDIATE AD INJECTION (ALL ADS) ---
  // Ad 1 (Immediate Top-Center 468x60)
  if (immediateAdPlaceholder) {
    immediateAdPlaceholder.innerHTML = ''; // Clear previous ad content
    const script_opt = document.createElement('script');
    script_opt.type = 'text/javascript';
    script_opt.textContent = `atOptions = {'key' : '${IMMEDIATE_TOP_AD_KEY_468x60}', 'format' : 'iframe', 'height' : 60, 'width' : 468, 'params' : {}};`;
    immediateAdPlaceholder.appendChild(script_opt);
    const script_invoke = document.createElement('script');
    script_invoke.type = 'text/javascript';
    script_invoke.src = `//www.highperformanceformat.com/${IMMEDIATE_TOP_AD_KEY_468x60}/invoke.js`;
    script_invoke.async = true;
    immediateAdPlaceholder.appendChild(script_invoke);
  }
  // Ad 2 (468x60 in Top-Right stack)
  if (rewardAdBannerContainer_468x60) {
    rewardAdBannerContainer_468x60.innerHTML = '';
    // Use TOP_RIGHT_AD_KEY_468x60 for this unit, if it's different from IMMEDIATE_TOP_AD_KEY_468x60
    const script1_opt = document.createElement('script');
    script1_opt.type = 'text/javascript';
    script1_opt.textContent = `atOptions = {'key' : '${TOP_RIGHT_AD_KEY_468x60}', 'format' : 'iframe', 'height' : 60, 'width' : 468, 'params' : {}};`;
    rewardAdBannerContainer_468x60.appendChild(script1_opt);
    const script1_invoke = document.createElement('script');
    script1_invoke.type = 'text/javascript';
    script1_invoke.src = `//www.highperformanceformat.com/${TOP_RIGHT_AD_KEY_468x60}/invoke.js`;
    script1_invoke.async = true;
    rewardAdBannerContainer_468x60.appendChild(script1_invoke);
  }

  // Ad 3 (300x250)
  if (rewardAdBannerContainer_300x250) {
    rewardAdBannerContainer_300x250.innerHTML = '';
    const script2_opt = document.createElement('script');
    script2_opt.type = 'text/javascript';
    script2_opt.textContent = `atOptions = {'key' : '${MIDDLE_AD_KEY_300x250}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {}};`;
    rewardAdBannerContainer_300x250.appendChild(script2_opt);
    const script2_invoke = document.createElement('script');
    script2_invoke.type = 'text/javascript';
    script2_invoke.src = `//www.highperformanceformat.com/${MIDDLE_AD_KEY_300x250}/invoke.js`;
    script2_invoke.async = true;
    rewardAdBannerContainer_300x250.appendChild(script2_invoke);
  }

  // Ad 4 (Responsive)
  if (rewardAdBannerContainer_responsive) {
    rewardAdBannerContainer_responsive.innerHTML = '';
    const ad3_script = document.createElement('script');
    ad3_script.async = true;
    ad3_script.setAttribute('data-cfasync', 'false');
    ad3_script.src = RESPONSIVE_AD_SCRIPT_SRC;
    rewardAdBannerContainer_responsive.appendChild(ad3_script);
    const ad3_div = document.createElement('div');
    ad3_div.id = RESPONSIVE_AD_CONTAINER_ID;
    rewardAdBannerContainer_responsive.appendChild(ad3_div);
  }

  // --- Countdown Timer & Initial UI State ---
  let countdown = 5;
  if (rewardCountdownTimer) {
    rewardCountdownTimer.textContent = countdown;
    rewardCountdownTimer.classList.remove('hidden'); // Show countdown timer
  }
  if (rewardGuaranteedLabel) rewardGuaranteedLabel.classList.add('hidden'); // Hide "Reward Guaranteed" label initially
  if (rewardBackButton) rewardBackButton.classList.add('hidden'); // Hide back button initially

  if (rewardScreenTimerId) clearInterval(rewardScreenTimerId); // Clear any existing timer

  rewardScreenTimerId = setInterval(() => {
    countdown--;
    if (rewardCountdownTimer) rewardCountdownTimer.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(rewardScreenTimerId);
      rewardScreenTimerId = null;

      if (rewardCountdownTimer) rewardCountdownTimer.classList.add('hidden'); // Hide countdown
      if (rewardBackButton) rewardBackButton.classList.remove('hidden'); // Show back button
      if (rewardGuaranteedLabel) rewardGuaranteedLabel.classList.remove('hidden'); // Show "Reward Guaranteed" label
    }
  }, 1000);

  // --- Back Button onClick Assignment ---
  // Remove old listener and add new to prevent multiple bindings.
  const oldBackButton = document.getElementById('rewardBackButton');
  const newBackButton = oldBackButton.cloneNode(true);
  if (oldBackButton.parentNode) {
      oldBackButton.parentNode.replaceChild(newBackButton, oldBackButton);
  }
  // Now assign event listener to the new button
  newBackButton.onclick = () => {
    if (customRewardScreen) customRewardScreen.classList.add('hidden');
    // Clear all ad containers when leaving reward screen
    if (immediateAdPlaceholder) immediateAdPlaceholder.innerHTML = '';
    if (rewardAdBannerContainer_468x60) rewardAdBannerContainer_468x60.innerHTML = '';
    if (rewardAdBannerContainer_300x250) rewardAdBannerContainer_300x250.innerHTML = '';
    if (rewardAdBannerContainer_responsive) rewardAdBannerContainer_responsive.innerHTML = '';

    stopAllSounds(); // Stop any background ad sounds
    showFooterAndBanner(); // Show footer/banner again

    // Apply reward based on context (where did the ad come from?)
    state.timeLeft += 10; // All ad rewards give +10 seconds
    updateHUD(); // Update display with new time

    if (context === 'continue') {
        loadFullGameState(); // Load saved game state (level, score, cards)
        state.paused = false; // Unpause the game
        if (pauseBtn) pauseBtn.textContent = "||"; // Set pause symbol
        saveGameState(); // Save the updated state (with bonus time)
        showGame(); // Show game screen to resume
        // If the game was already in a win state (all matched before ad), trigger winLevel
        if (state.cards && state.cards.length > 0 && state.matchedCount === Math.floor(state.cards.length / 2)) {
          setTimeout(winLevel, 100);
        }
    } else if (context === 'lose') {
        state.paused = false; // Ensure game is unpaused
        if (pauseBtn) pauseBtn.textContent = "||"; // Set pause symbol
        startLevel(state.level); // Restart the current level (this also saves game state)
        showGame(); // Show game screen
    }
  };
}


// --- Screen Navigation Functions ---

// Splash Screen
function showSplash() {
  showFooterAndBanner(); // Ensure footer is visible on splash screen
  hideOverlay(); // Hide general overlay
  // Hide all other screens/popups
  splash.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  auth.classList.add('hidden');
  continuePopup.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adOverlay.classList.add('hidden');
  customRewardScreen.classList.add('hidden'); // Ensure custom reward screen is hidden

  splashCards.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = 'splash-card';
    splashCards.appendChild(card);
  }
  setTimeout(() => {
    splash.classList.add('hidden');
    checkLogin(); // Proceed to login check
  }, 3000);
}

// Auth Screen
function checkLogin() {
  let savedUser = null;
  try {
    const savedUserString = localStorage.getItem('memorymatch_user');
    if (savedUserString) {
      savedUser = JSON.parse(savedUserString);
    }
  } catch (error) {
    console.error("Error parsing saved user from localStorage:", error);
    savedUser = null; // Treat as no saved user if parsing fails
  }

  if(savedUser && savedUser.email) {
    state.user = savedUser;
    showHome();
  } else {
    showAuth();
  }
}

function showAuth() {
  showOverlay(); // Show overlay
  // Hide all other screens/popups
  auth.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  continuePopup.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adOverlay.classList.add('hidden');
  customRewardScreen.classList.add('hidden'); // Ensure custom reward screen is hidden
  emailInput.value = '';
  passwordInput.value = '';
}

// Home Screen
function showHome() {
  showFooterAndBanner(); // Ensure footer is visible on home screen
  hideOverlay(); // Ensure overlay is hidden

  // Hide all other screens/popups
  auth.classList.add('hidden');
  home.classList.remove('hidden');
  game.classList.add('hidden');
  continuePopup.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adOverlay.classList.add('hidden');
  customRewardScreen.classList.add('hidden'); // Ensure custom reward screen is hidden
}

// Game Screen
function showGame() {
  hideFooterAndBanner(); // Hide footer when game screen is active
  hideOverlay(); // Ensure overlay is hidden

  // Hide all other screens/popups
  home.classList.add('hidden');
  auth.classList.add('hidden');
  continuePopup.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adOverlay.classList.add('hidden');
  customRewardScreen.classList.add('hidden'); // Ensure custom reward screen is hidden

  game.classList.remove('hidden');
  updateHUD();
  setupSwitches();

  // If coming from a loaded/resumed state, rebuild the board.
  // Otherwise, start a fresh level.
  if (state.hasFullState && state.cards && state.cards.length > 0) {
      rebuildBoardFromState();
      startTimer(); // Resume timer
      state.paused = false; // Ensure game is unpaused
      if (pauseBtn) pauseBtn.textContent = "||";
      state.isGameActive = true; // Ensure game is active when resuming
  } else {
      // If no full state found, start a new game from level 1
      clearFullGameState(); // Ensure a clean slate
      state.level = 1;
      state.score = 0;
      saveGameState(); // Save this initial state (level 1, score 0)
      startLevel(state.level); // This also sets gameActive and saves state
  }
}


// --- Game Logic Functions ---

function getGridSize(level) {
    let pairs;
    pairs = 1 + Math.floor((level - 1) / 2); // 1 pair per 2 levels from level 2
    let totalCards = pairs * 2;

    let maxColsPossible;
    if (window.innerWidth <= 400) { maxColsPossible = 3; }
    else if (window.innerWidth <= 600) { maxColsPossible = 4; }
    else if (window.innerWidth <= 900) { maxColsPossible = 6; }
    else { maxColsPossible = 8; }

    const gameHeader = document.querySelector('.game-header');
    const stats = document.querySelector('.stats');
    const stickyFooter = document.getElementById('stickyFooter');

    const headerHeight = gameHeader ? gameHeader.offsetHeight : 100;
    const statsHeight = stats ? stats.offsetHeight : 50;
    const footerHeight = stickyFooter ? stickyFooter.offsetHeight : 85;
    
    const availableHeightForBoard = window.innerHeight - headerHeight - statsHeight - footerHeight - 30; // 30px buffer

    // Estimate card height based on current CSS max-width for mobile (.card @media (max-width: 600px))
    // which is 110px. Add row-gap.
    const estimatedCardHeightWithGap = 110 + 12; // 110px card + 12px row-gap for mobile
    let maxRowsPossible = Math.floor(availableHeightForBoard / estimatedCardHeightWithGap);
    if (maxRowsPossible < 2) maxRowsPossible = 2; // Minimum 2 rows for any grid

    let maxCardsCanFit = maxColsPossible * maxRowsPossible;
    maxCardsCanFit = Math.floor(maxCardsCanFit / 2) * 2; // Ensure even number

    let currentTotalCards = totalCards;
    if (totalCards > maxCardsCanFit) {
        currentTotalCards = maxCardsCanFit;
        if (!state.isMaxCardsReached) { // If it's the first time we cap cards
            state.levelCardsCapped = level;
        }
        state.isMaxCardsReached = true;
    } else {
        state.isMaxCardsReached = false;
        state.levelCardsCapped = 0; // Reset if we are no longer capped
    }
    
    let cols = Math.ceil(Math.sqrt(currentTotalCards));
    if (cols > maxColsPossible) {
        cols = maxColsPossible;
    }
    let rows = Math.ceil(currentTotalCards / cols);

    while (rows * cols < currentTotalCards && cols < (maxColsPossible + 2)) { // Allow slight overflow if needed
        cols++;
        rows = Math.ceil(currentTotalCards / cols);
    }
    
    return {
        rows: rows,
        cols: cols,
        totalCards: currentTotalCards,
        isMaxCardsReached: state.isMaxCardsReached
    };
}

function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseBtn.textContent = "||";
  state.flippedIndices = [];
  state.matchedCount = 0;
  state.busy = false;
  state.isGameActive = true; // Game is active when a level starts

  const {rows,cols,totalCards, isMaxCardsReached} = getGridSize(level);
  board.style.setProperty('--cols', cols); // Update CSS variable for grid columns

  const totalPairs = Math.floor(totalCards/2);
  let emojisForLevel = shuffle(EMOJIS).slice(0,totalPairs);
  let cardsArray = shuffle([...emojisForLevel,...emojisForLevel]);
  
  if(cardsArray.length < totalCards) { // If not enough unique emojis 
