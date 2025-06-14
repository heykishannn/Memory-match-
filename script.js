// CONSTANTS
const EMOJIS = [
"🍎","🍌","🍇","🍓","🍉","🍍","🥝","🍒","🍑","🍋",
"🥥","🥭","🍐","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
"🌷","🪷","🌸","🪻","🌺","🌼","🐼","🦄","🍂","🍄","🌿",
"🐥","🐔","🦜","🕊️","🦢","🦋","🍨","🍧","🍭",
"🍬","☕","🗿","🎂","🧸","🎹","💎","🔮","🐱",
"🦚","🪕" // Added Peacock and Banjo emojis for sound effects as per list
];
const MAX_LEVEL = 100;
const MAX_CARDS_BEFORE_TIMER_DIFFICULTY = 30;

// Ad Keys
const IMMEDIATE_TOP_AD_KEY_468x60 = 'f3980c7d80f3803dbaf4228f02da605b'; // For immediate top-center 468x60 ad
const TOP_RIGHT_AD_KEY_468x60 = 'PLEASE_REPLACE_WITH_ACTUAL_KEY_468x60'; // Placeholder for the 468x60 ad in top-right stack
const MIDDLE_AD_KEY_300x250 = '3606c322c11ecc95fb215e54122b24b9';
const RESPONSIVE_AD_SCRIPT_SRC = '//pl26778951.profitableratecpm.com/ce2d3cde4fcc3769cce04418ad7b7d93/invoke.js';
const RESPONSIVE_AD_CONTAINER_ID = 'container-ce2d3cde4fcc3769cce04418ad7b7d93';

// DOM ELEMENT VARIABLES
const pageOverlay = document.getElementById('pageOverlay'); // Added pageOverlay
const splash = document.getElementById('splash');
const splashCards = document.querySelector('.splash-cards');
const auth = document.getElementById('auth');
const home = document.getElementById('home');
const game = document.getElementById('game');
const board = document.getElementById('board');
const winPopup = document.getElementById('winPopup');
const losePopup = document.getElementById('losePopup');
const continuePopup = document.getElementById('continuePopup'); // Added
const adOverlay = document.getElementById('adOverlay');
const adOverlayMessage = document.getElementById('adOverlayMessage');
const adOverlayTimer = document.getElementById('adOverlayTimer');
const stickyFooter = document.getElementById('stickyFooter');
const bannerAdContainer = document.getElementById('bannerAdContainer'); // Though likely controlled by stickyFooter visibility
const customRewardScreen = document.getElementById('customRewardScreen');
const rewardCountdownTimer = document.getElementById('rewardCountdownTimer');
const rewardGuaranteedLabel = document.getElementById('rewardGuaranteedLabel');
const rewardBackButton = document.getElementById('rewardBackButton');
const rewardTopRightContainer = document.getElementById('rewardTopRightContainer');
// const rewardAdBannerContainer = document.getElementById('rewardAdBannerContainer'); // Old one, replaced
const immediateAdPlaceholder = document.getElementById('immediateAdPlaceholder');
const rewardAdBannerContainer_468x60 = document.getElementById('rewardAdBannerContainer_468x60');
const rewardAdBannerContainer_300x250 = document.getElementById('rewardAdBannerContainer_300x250');
const rewardAdBannerContainer_responsive = document.getElementById('rewardAdBannerContainer_responsive');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const startBtn = document.getElementById('startBtn');
const resumeHomeBtn = document.getElementById('resumeHomeBtn');
const restartFrom1Btn = document.getElementById('restartFrom1Btn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const homeBtn1 = document.getElementById('homeBtn1');
const playAgainBtn = document.getElementById('playAgainBtn'); // This is for the lose popup's "Play Again"
const winPlayAgainBtn = document.getElementById('winPlayAgainBtn'); // For the win popup's "Play Again"
const loseWatchAdBtn = document.getElementById('loseWatchAdBtn'); // For the lose popup's "Watch Ad"
const loseRestartHomeBtn = document.getElementById('loseRestartHomeBtn'); // For the lose popup's "Home"

// Buttons for Continue Popup
// const watchAdContinueBtn = document.getElementById('watchAdContinueBtn'); // Replaced by continueGameBtn
const continueGameBtn = document.getElementById('continueGameBtn'); // New ID
const continueHomeBtn = document.getElementById('continueHomeBtn');
const startFromLevel1Btn = document.getElementById('startFromLevel1Btn');

// Changed IDs for input elements for toggle switches
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');
const pauseBtn = document.getElementById('pauseBtn');

const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const audioTap = document.getElementById('audio-tap');
const audioWin = document.getElementById('audio-win');
const audioLose = document.getElementById('audio-lose');
const audioPause = document.getElementById('audio-pause');
const audioRestart = document.getElementById('audio-restart');
// New Match Sounds DOM references
const audioGwak = document.getElementById('audio-gwak');
const audioTamatar = document.getElementById('audio-tamatar');
const audioMor = document.getElementById('audio-mor');
const audioSigma = document.getElementById('audio-sigma');
const audioBirthday = document.getElementById('audio-birthday');
const audioSitar = document.getElementById('audio-sitar');
const audioBell = document.getElementById('audio-bell');
// New sound for Continue window

const resultLevel = document.getElementById('resultLevel');
const resultScore = document.getElementById('resultScore');
const resultTime = document.getElementById('resultTime');
const resultLevelL = document.getElementById('resultLevelL');
const resultScoreL = document.getElementById('resultScoreL');
const resultTimeL = document.getElementById('resultTimeL');

// STATE OBJECT
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
resumeData: null,
adTimeout: null,
playingSound: null,
// isMaxCardsReached: false, // No longer needed with fixed card/container size
// levelCardsCapped: 0, // No longer needed
isGameActive: true, // Added for visibility change sound control
awaitingTapForBonusTime: false, // Renamed
postAdCallback: null, // Added for new rewarded ad logic
customSoundPlayedForWin: false,
pausedByVisibility: false
};

// updateHUD (new placeholder)
function updateHUD() {
  // Placeholder: Implement HUD update logic
  console.log('updateHUD called - level:', state.level, 'score:', state.score, 'time:', state.timeLeft);
  if (levelDisplay) levelDisplay.textContent = `Level: ${state.level}`;
  if (scoreDisplay) scoreDisplay.textContent = `Score: ${state.score}`;
  if (timerDisplay) timerDisplay.textContent = `Time: ${state.timeLeft}`;
}

// UTILITY FUNCTIONS
function showOverlay() {
if (pageOverlay) pageOverlay.classList.remove('hidden');
}

function hideOverlay() {
if (pageOverlay) pageOverlay.classList.add('hidden');
}

function showFooterAndBanner() {
if (stickyFooter) stickyFooter.classList.remove('hidden');
// If bannerAdContainer had its own 'hidden' class management:
// if (bannerAdContainer) bannerAdContainer.classList.remove('hidden');
}

function hideFooterAndBanner() {
if (stickyFooter) stickyFooter.classList.add('hidden');
// If bannerAdContainer had its own 'hidden' class management:
// if (bannerAdContainer) bannerAdContainer.classList.add('hidden');
}

// POPUP MANAGEMENT
let adOverlayTimeoutId = null; // To store timeout ID for clearing if needed
function showAdOverlay(message, duration, callback) {
hideFooterAndBanner(); // Hide footer when ad overlay is shown
if (adOverlayMessage) adOverlayMessage.textContent = message;
if (adOverlayTimer) adOverlayTimer.textContent = duration;

if (adOverlay) adOverlay.classList.remove('hidden');
showOverlay(); // Show the general page overlay to disable background clicks

let countdown = duration;
if (adOverlayTimeoutId) clearInterval(adOverlayTimeoutId); // Clear any existing timer

adOverlayTimeoutId = setInterval(() => {
countdown--;
if (adOverlayTimer) adOverlayTimer.textContent = countdown;
if (countdown <= 0) {
clearInterval(adOverlayTimeoutId);
adOverlayTimeoutId = null;
if (adOverlay) adOverlay.classList.add('hidden');
hideOverlay(); // Hide general page overlay
if (callback) callback();
}
}, 1000);
}

function showContinuePopup() {
  hideFooterAndBanner(); // Ensure footer is hidden
  if (continuePopup) continuePopup.classList.remove('hidden');
  showOverlay();
}

function hideContinuePopup() {
  if (continuePopup) continuePopup.classList.add('hidden');
  hideOverlay();
}

// Helper function to clear game state for starting over
function clearFullGameState() {
  state.level = 1;
  state.score = 0;
  state.cards = [];
  state.timeLeft = 0; // Will be reset by initializeNewLevel
  state.matchedCount = 0;
  state.flippedIndices = [];
  state.paused = false;
  // state.user remains
  // state.soundOn and state.vibrationOn remain as user preferences

  localStorage.removeItem('memorymatch_gameState');
  console.log('Full game state cleared.');
}

// Win Popup specific functions
function showWinPopup() {
  if (resultLevel) resultLevel.textContent = `Level: ${state.level}`;
  if (resultScore) resultScore.textContent = `Score: ${state.score}`;
  if (resultTime) resultTime.textContent = `Time Left: ${state.timeLeft}s`;

  hideFooterAndBanner(); // Ensure footer is hidden
  if (winPopup) winPopup.classList.remove('hidden');
  showOverlay(); // Show semi-transparent background overlay
}

function hideWinPopup() {
  if (winPopup) winPopup.classList.add('hidden');
  hideOverlay(); // Hide semi-transparent background overlay
}

// Lose Popup specific functions
function showLosePopup() {
  if (resultLevelL) resultLevelL.textContent = `Level: ${state.level}`;
  if (resultScoreL) resultScoreL.textContent = `Score: ${state.score}`;
  // resultTimeL is for time left, but when losing, time is 0.
  if (resultTimeL) resultTimeL.textContent = `Time Left: 0s`;

  hideFooterAndBanner(); // Ensure footer is hidden
  if (losePopup) losePopup.classList.remove('hidden');
  showOverlay(); // Show semi-transparent background overlay
}

function hideLosePopup() {
  if (losePopup) losePopup.classList.add('hidden');
  hideOverlay(); // Hide semi-transparent background overlay
}

// GAME LEVEL AND CARD GENERATION LOGIC
function calculateCardsForLevel(level) {
  // Level 1, 2: 2 pairs (4 cards)
  // Level 3, 4: 3 pairs (6 cards)
  // ...
  const calculatedUniqueItems = 2 + Math.floor((Math.max(1, level) - 1) / 2);
  return Math.min(calculatedUniqueItems, EMOJIS.length); // Cap by available unique emojis
}

function generateCardsForLevel(level) {
  const numUniqueItems = calculateCardsForLevel(level);

  // Shuffle EMOJIS to get a random selection for each level
  // Create a copy before shuffling to not alter the original EMOJIS array
  const shuffledEmojis = [...EMOJIS].sort(() => 0.5 - Math.random());
  const selectedEmojis = shuffledEmojis.slice(0, numUniqueItems);

  const newCards = [];
  for (let emoji of selectedEmojis) {
    // Add two cards for each selected emoji
    newCards.push({ emoji: emoji, flipped: false, matched: false, id: null }); // id can be assigned later if needed for DOM
    newCards.push({ emoji: emoji, flipped: false, matched: false, id: null });
  }

  // Shuffle the final set of cards to randomize their positions on the board
  state.cards = newCards.sort(() => 0.5 - Math.random());
  state.matchedCount = 0;
  state.flippedIndices = [];
  state.busy = false; // Reset busy state for the new level

  // Assign unique IDs after shuffling, if necessary for DOM linking or advanced logic
  // For now, card.dataset.index in rebuildBoardFromState serves as a temporary ID
  // state.cards.forEach((card, index) => card.id = index);
}

function initializeNewLevel() {
  // state.level is assumed to be set correctly before this call
  // (e.g., by startBtn.onclick or when proceeding to the next level after a win)

  generateCardsForLevel(state.level);
  rebuildBoardFromState(); // Create/update card elements in the DOM
  // state.timeLeft is set by startTimer
  startTimer(); // Start timer for the new level
  updateHUD(); // Update displayed level, score, time

  // Any other level-specific setup would go here
  console.log(`Initializing level ${state.level} with ${state.cards.length} cards (${state.cards.length / 2} pairs).`);
  saveGameState(); // Save the state of the newly initialized level
}

// GAME BOARD/LOGIC HELPERS

function saveGameState() {
  const gameStateToSave = {
    level: state.level,
    score: state.score,
    timeLeft: state.timeLeft,
    cards: state.cards,
    soundOn: state.soundOn,
    vibrationOn: state.vibrationOn,
    matchedCount: state.matchedCount,
    paused: state.paused // Save pause state
    // flippedIndices: state.flippedIndices, // Usually transient, might not be needed
    // user: state.user // User info might be saved separately (e.g. memorymatch_user)
  };
  localStorage.setItem('memorymatch_gameState', JSON.stringify(gameStateToSave));
  console.log('Game state saved.');
}

function winLevel() {
  stopTimer();
  if (state.soundOn && audioWin) audioWin.play();
  console.log("Level Won! Score:", state.score, "Time Left:", state.timeLeft);
  saveGameState(); // Save state at the moment of winning (before level increment)
  showWinPopup();
}

function loseLevel() {
  stopTimer();
  if (state.soundOn && audioLose) audioLose.play();
  console.log("Level Lost! Score:", state.score);
  saveGameState(); // Save state at the moment of losing
  showLosePopup();
}

function onCardClick(index) {
  if (state.busy || state.cards[index].flipped || state.cards[index].matched) {
    return;
  }

  const clickedCard = state.cards[index];
  clickedCard.flipped = true;
  state.flippedIndices.push(index);

  // Update DOM
  const cardElement = board.children[index];
  if (cardElement) { // Check if element exists
    cardElement.classList.add('flipped');
  } else {
    console.error(`Card element at index ${index} not found in DOM.`);
    // Fallback or error handling, though ideally DOM should always match state.cards
  }


  if (state.soundOn && audioTap) audioTap.play();

  if (state.flippedIndices.length === 2) {
    state.busy = true;
    const [index1, index2] = state.flippedIndices;
    const card1 = state.cards[index1];
    const card2 = state.cards[index2];

    if (card1.emoji === card2.emoji) {
      card1.matched = true;
      card2.matched = true;
      state.matchedCount++;
      state.score += 10; // Or dynamic score based on level/time

      if (board.children[index1]) board.children[index1].classList.add('matched');
      if (board.children[index2]) board.children[index2].classList.add('matched');

      // Play a specific match sound, e.g., gwak
      if (state.soundOn && audioGwak) audioGwak.play();


      state.flippedIndices = [];
      state.busy = false;

      if (state.matchedCount * 2 === state.cards.length) {
        winLevel();
      }
    } else {
      // Play wrong match sound (e.g., bell or a new one)
      if (state.soundOn && audioBell) audioBell.play();
      if (state.vibrationOn && navigator.vibrate) navigator.vibrate(200);

      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        if (board.children[index1]) board.children[index1].classList.remove('flipped');
        if (board.children[index2]) board.children[index2].classList.remove('flipped');

        state.flippedIndices = [];
        state.busy = false;
        updateHUD(); // Update HUD after cards are flipped back
        saveGameState(); // Save state after non-match resolution
      }, 1000);
    }
  }
  updateHUD();
  saveGameState(); // Save state after each valid flip or match resolution
}

function rebuildBoardFromState() {
board.innerHTML = '';
state.cards.forEach((card, i) => {
const cardEl = document.createElement('div');
cardEl.className = 'card';
cardEl.dataset.index = i;
cardEl.tabIndex = 0; // For accessibility
cardEl.innerHTML = `<div class="front">${card.emoji}</div> <div class="back"></div>`;
if (card.flipped) {
cardEl.classList.add('flipped');
}
if (card.matched) {
cardEl.classList.add('matched');
}
cardEl.addEventListener('click', () => onCardClick(i));
cardEl.addEventListener('keydown', e => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
onCardClick(i);
}
});
board.appendChild(cardEl);
});
}

// SCREEN TRANSITION FUNCTIONS
function showGame(resumingSavedGame = false) { // Added resumingSavedGame parameter
hideFooterAndBanner(); // Hide footer when game screen is shown
home.classList.add('hidden');
game.classList.remove('hidden');
winPopup.classList.add('hidden');
losePopup.classList.add('hidden');
if (continuePopup) continuePopup.classList.add('hidden');
// initializeGame or resumeGame logic would be here
// For now, just ensure board is ready if resuming with existing state
if (resumingSavedGame && state.cards && state.cards.length > 0) {
    rebuildBoardFromState();
    updateHUD(); // Ensure HUD reflects resumed state
} else if (!resumingSavedGame) {
    // This is a new game start from showGame, usually after clicking "Start" or "Play Again"
    // state.level, state.score should be reset by the calling context (e.g. startBtn.onclick)
    // initializeNewLevel(); // This function would set up cards, timer etc.
    // For now, we assume the calling context like startBtn.onclick handles state reset
    // and card generation before calling showGame.
    // If showGame is called directly without setup, it might show an empty board or old state.
}
// Timer logic might also start here depending on game flow
}

function showAuth() {
hideFooterAndBanner(); // Ensure footer is hidden on auth screen
showOverlay(); // Show overlay
auth.classList.remove('hidden');
home.classList.add('hidden');
game.classList.add('hidden');
emailInput.value = '';
passwordInput.value = '';
}

function showHome() {
showFooterAndBanner(); // Show footer on home screen
// Ensure overlay is hidden when navigating to home, in case it was shown by auth
hideOverlay();
auth.classList.add('hidden');
home.classList.remove('hidden');
game.classList.add('hidden');
if (continuePopup) continuePopup.classList.add('hidden'); // Ensure continue popup is hidden
if (winPopup) winPopup.classList.add('hidden');
if (losePopup) losePopup.classList.add('hidden');
}

function checkLogin() {
let savedUser = null;
try {
const savedUserString = localStorage.getItem('memorymatch_user');
if (savedUserString) {
savedUser = JSON.parse(savedUserString);
}
} catch (error) {
console.error("Error parsing saved user from localStorage:", error);
// If parsing fails, treat as no saved user
savedUser = null;
}

if(savedUser && savedUser.email) {
  state.user = savedUser;
  // check for resumable game state
  const canResume = loadGameState(); // loadGameState now also fully restores state if resumable
  if (canResume && state.cards && state.cards.length > 0 && !isTrivialState()) {
    // isTrivialState helps avoid showing continue for a game that's effectively new
    showContinuePopup();
  } else {
    showHome();
  }
} else {
  showAuth();
}
}

// COMPLEX UI
let rewardScreenTimerId = null;
function showCustomRewardScreen(originalContext) {
hideFooterAndBanner();
if (adOverlay) adOverlay.classList.add('hidden');
hideOverlay();

if (customRewardScreen) customRewardScreen.classList.remove('hidden');

// --- Immediate Ad Injection (Top-Center 468x60) ---
if (immediateAdPlaceholder) {
immediateAdPlaceholder.innerHTML = ''; // Clear previous
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

// --- Countdown Timer & Initial UI State for elements appearing after countdown ---
if (rewardCountdownTimer) {
rewardCountdownTimer.textContent = '5';
rewardCountdownTimer.classList.remove('hidden');
}
if (rewardBackButton) rewardBackButton.classList.add('hidden');
if (rewardTopRightContainer) rewardTopRightContainer.classList.add('hidden');

// Clear previous ads in top-right stack
if (rewardAdBannerContainer_468x60) rewardAdBannerContainer_468x60.innerHTML = '';
if (rewardAdBannerContainer_300x250) rewardAdBannerContainer_300x250.innerHTML = '';
if (rewardAdBannerContainer_responsive) rewardAdBannerContainer_responsive.innerHTML = '';

let countdown = 5;
if (rewardScreenTimerId) clearInterval(rewardScreenTimerId);

rewardScreenTimerId = setInterval(() => {
countdown--;
if (rewardCountdownTimer) rewardCountdownTimer.textContent = countdown;
if (countdown <= 0) {
clearInterval(rewardScreenTimerId);
rewardScreenTimerId = null;

if (rewardCountdownTimer) rewardCountdownTimer.classList.add('hidden');
  if (rewardBackButton) rewardBackButton.classList.remove('hidden');
  if (rewardTopRightContainer) rewardTopRightContainer.classList.remove('hidden');

  // --- Inject Ads in Top-Right Stack ---
  // Ad 1 (468x60) - Top in stack
  if (rewardAdBannerContainer_468x60) {
    rewardAdBannerContainer_468x60.innerHTML = '';
    if (TOP_RIGHT_AD_KEY_468x60 !== 'PLEASE_REPLACE_WITH_ACTUAL_KEY_468x60') {
      const script1_opt = document.createElement('script');
      script1_opt.type = 'text/javascript';
      script1_opt.textContent = `atOptions = {'key' : '${TOP_RIGHT_AD_KEY_468x60}', 'format' : 'iframe', 'height' : 60, 'width' : 468, 'params' : {}};`;
      rewardAdBannerContainer_468x60.appendChild(script1_opt);
      const script1_invoke = document.createElement('script');
      script1_invoke.type = 'text/javascript';
      script1_invoke.src = `//www.highperformanceformat.com/${TOP_RIGHT_AD_KEY_468x60}/invoke.js`;
      script1_invoke.async = true;
      rewardAdBannerContainer_468x60.appendChild(script1_invoke);
    } else {
      rewardAdBannerContainer_468x60.textContent = 'Placeholder for 468x60 Ad (Key Missing)';
    }
  }

  // Ad 2 (300x250) - Middle in stack
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

  // Ad 3 (Responsive) - Bottom in stack
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
}
}, 1000);

// --- Back Button onClick Assignment ---
// NOTE: This is an internal event handler assignment for the reward screen's back button.
// It's kept within showCustomRewardScreen because it's specific to its lifecycle.
if (rewardBackButton) {
const newBackButton = rewardBackButton.cloneNode(true); // Clone to remove old listeners
if (rewardBackButton.parentNode) {
rewardBackButton.parentNode.replaceChild(newBackButton, rewardBackButton);
}
// Update the variable to point to the new button in the DOM
const currentRewardBackButton = document.getElementById('rewardBackButton');

currentRewardBackButton.onclick = () => {
  if (customRewardScreen) customRewardScreen.classList.add('hidden');

  // Clear all ad containers when leaving screen
  if (immediateAdPlaceholder) immediateAdPlaceholder.innerHTML = '';
  if (rewardAdBannerContainer_468x60) rewardAdBannerContainer_468x60.innerHTML = '';
  if (rewardAdBannerContainer_300x250) rewardAdBannerContainer_300x250.innerHTML = '';
  if (rewardAdBannerContainer_responsive) rewardAdBannerContainer_responsive.innerHTML = '';

  state.timeLeft += 10; // Example: Award bonus time
  updateHUD(); // Update display

  // Logic to return to the correct game state based on where the reward screen was triggered from
  state.paused = false; // Ensure game is not paused
  state.busy = false;   // Ensure game is not busy

  if (originalContext === 'losePopup') {
    // state.timeLeft was already increased by 10 in the previous version of this handler.
    // Now, we ensure it's applied correctly.
    updateHUD(); // Reflect new timeLeft (if it was changed, though not in this version)
    showGame(true); // Show the game screen, cards should be as they were
    startTimer();   // Restart the timer with the current timeLeft (which includes the bonus)
  } else if (originalContext === 'continuePopup') {
    // This context is for a potential "continue game after closing app" feature,
    // which might have different logic (e.g. from showContinuePopup).
    // For now, let's assume similar behavior to 'losePopup' if it were implemented.
    updateHUD();
    showGame(true);
    startTimer();
  }
  // Potentially other contexts if showCustomRewardScreen is used elsewhere

  saveGameState(); // Save the new state (e.g., with bonus time and unpaused)
};
}
}

// SPLASH FUNCTION
function showSplash() {
showFooterAndBanner(); // Show footer on splash screen
splash.classList.remove('hidden');
home.classList.add('hidden');
game.classList.add('hidden');
auth.classList.add('hidden');
splashCards.innerHTML = '';
for (let i = 0; i < 3; i++) {
const card = document.createElement('div');
card.className = 'splash-card';
splashCards.appendChild(card);
}
setTimeout(() => {
splash.classList.add('hidden');
checkLogin();
}, 2500); // Adjusted timeout to 2.5 seconds
}

// EVENT HANDLER ASSIGNMENTS
loginBtn.onclick = () => {
const email = emailInput.value.trim().toLowerCase();
const password = passwordInput.value;
if(!email || !password) { alert('Please enter email and password.'); return; }
const saved = JSON.parse(localStorage.getItem('memorymatch_user'));
if(saved && saved.email === email && saved.password === password) {
state.user = {email, password};
localStorage.setItem('memoryMatchUserEmail', email);
hideOverlay(); // Hide overlay on successful login
showHome();
} else {
alert('Invalid credentials or user does not exist.');
}
};

signupBtn.onclick = () => {
const email = emailInput.value.trim().toLowerCase();
const password = passwordInput.value;
if(!email || !password) { alert('Please enter email and password.'); return; }
localStorage.setItem('memorymatch_user', JSON.stringify({email, password}));
state.user = {email, password};
localStorage.setItem('memoryMatchUserEmail', email);
localStorage.setItem('memorymatch_progress', JSON.stringify({level:1, score:0})); // Initialize progress for new signup
hideOverlay(); // Hide overlay on successful signup
showHome();
};

startBtn.onclick = () => {
  const canResume = loadGameState(); // Attempt to load, also get status
  if (canResume && state.cards && state.cards.length > 0 && !isTrivialState()) {
    showContinuePopup();
  } else {
    // No resumable game or user chose not to continue from a previous prompt
    clearFullGameState(); // Ensure a fresh start
    // state.level, state.score, etc. are reset by clearFullGameState
    initializeNewLevel();
    showGame(); // Show the game screen for the new game
    // saveGameState(); // initializeNewLevel or subsequent actions will save.
  }
};

// Helper to determine if the loaded state is a "trivial" state (e.g. fresh game)
function isTrivialState() {
  // A game is trivial if it's level 1, score 0, and essentially full time for that level, and no cards flipped/matched
  // This helps avoid showing "Continue?" for a game that was just started and immediately exited.
  const isDefaultLevelAndScore = state.level === 1 && state.score === 0;
  const isFullTime = state.timeLeft >= calculateTimeForLevel(1) - 2; // Allow a couple seconds difference
  const noProgressInLevel = state.matchedCount === 0 && state.flippedIndices.length === 0;

  // If cards array is empty, it's trivial (or not properly loaded for resume)
  if (!state.cards || state.cards.length === 0) return true;

  return isDefaultLevelAndScore && isFullTime && noProgressInLevel && !state.paused;
}

// DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
  loadGameState(); // Load game state on start
  // Set initial state of toggles based on loaded state or defaults
  if (soundToggle) soundToggle.checked = state.soundOn;
  if (vibrationToggle) vibrationToggle.checked = state.vibrationOn;
  showSplash();
});

// TIMER FUNCTIONS
function calculateTimeForLevel(level) {
  // Example: Base 60s, -2s per level, +5s per unique pair beyond the initial 2.
  // Max time 120s, Min time 15s.
  const baseTime = 60;
  const timeReductionPerLevel = (level -1) * 1.5; // Gets more aggressive faster
  const uniquePairs = calculateCardsForLevel(level);
  const timeBonusForPairs = Math.max(0, (uniquePairs - 2)) * 5; // Bonus for more than 2 pairs

  let calculatedTime = baseTime - timeReductionPerLevel + timeBonusForPairs;
  return Math.max(15, Math.min(calculatedTime, 120)); // Clamp between 15 and 120 seconds
}

function startTimer() {
  if (state.timerId) clearInterval(state.timerId); // Clear existing timer
  state.timeLeft = calculateTimeForLevel(state.level);
  updateHUD(); // Initial display of time

  state.timerId = setInterval(() => {
    if (state.paused) return; // Don't count down if paused

    state.timeLeft--;
    updateHUD();

    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      state.timerId = null;
      loseLevel();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
}


// Function to load game state from localStorage
function loadGameState() {
  const savedStateString = localStorage.getItem('memorymatch_gameState');
  if (savedStateString) {
    try {
      const savedState = JSON.parse(savedStateString);
      // Restore only what's necessary and makes sense
      // Avoid restoring transient state like flippedIndices or busy
      state.level = savedState.level || 1;
      state.score = savedState.score || 0;
      state.level = savedState.level || 1;
      state.score = savedState.score || 0;
      state.timeLeft = savedState.timeLeft || 0; // Restore timeLeft
      state.soundOn = typeof savedState.soundOn === 'boolean' ? savedState.soundOn : true;
      state.vibrationOn = typeof savedState.vibrationOn === 'boolean' ? savedState.vibrationOn : true;
      state.paused = typeof savedState.paused === 'boolean' ? savedState.paused : false;

      // Restore card state only if it seems valid (e.g., not an empty array if level > 1 or score > 0)
      // And generally, only if the game was paused. If it was won/lost, level should restart.
      if (savedState.cards && savedState.cards.length > 0 && (state.paused || state.timeLeft < calculateTimeForLevel(state.level))) {
         state.cards = savedState.cards;
         state.matchedCount = savedState.matchedCount || 0;
         state.flippedIndices = savedState.flippedIndices || []; // Restore flipped cards if mid-turn
      } else {
        // If not restoring cards (e.g. level completed, or no valid card array), ensure they are reset
        // for a clean start of the loaded level if `continueGameBtn` is pressed.
        // However, `initializeNewLevel` would typically handle this if not resuming.
        // For now, we rely on `isTrivialState` and `startFromLevel1Btn` to manage fresh starts.
        state.cards = savedState.cards || []; // Keep potentially valid cards for isTrivialState check
        state.matchedCount = savedState.matchedCount || 0;
        state.flippedIndices = savedState.flippedIndices || [];
      }

      console.log('Game state loaded.');
      if (pauseBtn) pauseBtn.textContent = state.paused ? "▶" : "||";
      return true; // Indicate successful load
    } catch (error) {
      console.error('Error loading game state:', error);
      localStorage.removeItem('memorymatch_gameState');
      // clearFullGameState(); // Call the new helper to reset state vars
      // Manual reset for now as clearFullGameState might not be defined yet in this part of the script
      state.level = 1; state.score = 0; state.cards = []; state.timeLeft = 0;
      state.matchedCount = 0; state.flippedIndices = []; state.paused = false;
      state.soundOn = true; state.vibrationOn = true;
      return false; // Indicate failed load
    }
  }
  return false;
}

// EVENT HANDLERS FOR TOGGLES AND PAUSE (moved from bottom)

if (soundToggle) {
  soundToggle.onchange = () => {
    state.soundOn = soundToggle.checked;
    localStorage.setItem('memorymatch_soundOn', state.soundOn); // Persist preference
    saveGameState(); // Save overall game state which includes this setting
  };
}

if (vibrationToggle) {
  vibrationToggle.onchange = () => {
    state.vibrationOn = vibrationToggle.checked;
    localStorage.setItem('memorymatch_vibrationOn', state.vibrationOn); // Persist preference
    saveGameState(); // Save overall game state
  };
}

if (pauseBtn) {
  pauseBtn.onclick = () => {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "▶" : "||";
    if (state.soundOn && audioPause) audioPause.play();
    // Timer logic already handles state.paused in its interval
    updateHUD(); // Might update a visual indicator for pause
    saveGameState(); // Save pause state
  };
}

// WIN POPUP BUTTON HANDLERS
if (nextLevelBtn) {
  nextLevelBtn.onclick = () => {
    state.level++;
    if (state.level > MAX_LEVEL) {
      console.log("CONGRATULATIONS! Game Completed! Restarting from level 1.");
      clearFullGameState(); // Reset everything for a true fresh start
      // state.level is set to 1 in clearFullGameState
    }
    hideWinPopup();
    initializeNewLevel();
    saveGameState();
  };
}

if (winPlayAgainBtn) {
  winPlayAgainBtn.onclick = () => {
    hideWinPopup();
    // Score is preserved, current level is replayed
    // state.timeLeft will be reset by initializeNewLevel
    initializeNewLevel();
    saveGameState();
  };
}

if (homeBtn1) { // Home button in Win Popup
  homeBtn1.onclick = () => {
    hideWinPopup();
    showHome();
    // Game state is already saved from winLevel or other actions.
    // No need to save again unless specific changes were made by this action.
  };
}

// LOSE POPUP BUTTON HANDLERS
if (playAgainBtn) { // Play Again button in Lose Popup (ID: playAgainBtn)
  playAgainBtn.onclick = () => {
    hideLosePopup();
    // Score is preserved, current level is replayed
    initializeNewLevel();
    saveGameState();
  };
}

if (loseWatchAdBtn) {
  loseWatchAdBtn.onclick = () => {
    hideLosePopup();
    showCustomRewardScreen('losePopup'); // Call the reward screen
  };
}

if (loseRestartHomeBtn) { // Home button in Lose Popup
  loseRestartHomeBtn.onclick = () => {
    hideLosePopup();
    showHome();
    // Game state already saved from loseLevel.
  };
}

// CONTINUE POPUP BUTTON HANDLERS
if (continueGameBtn) {
  continueGameBtn.onclick = () => {
    hideContinuePopup();
    state.paused = false; // Explicitly unpause
    if (pauseBtn) pauseBtn.textContent = "||";

    rebuildBoardFromState(); // Render the loaded cards
    updateHUD(); // Show loaded stats
    showGame(true); // Show the game screen with existing state
    startTimer(); // Resume timer with loaded timeLeft
    // saveGameState(); // State is already loaded, timer starting will update timeLeft and save if needed
  };
}

if (startFromLevel1Btn) {
  startFromLevel1Btn.onclick = () => {
    hideContinuePopup();
    clearFullGameState(); // Reset state
    initializeNewLevel(); // Setup Level 1
    showGame(); // Show game screen for new L1 game
    // saveGameState(); // initializeNewLevel calls saveGameState
  };
}

if (continueHomeBtn) {
  continueHomeBtn.onclick = () => {
    hideContinuePopup();
    showHome();
    // No specific state change here that needs immediate saving,
    // game state remains as loaded.
  };
}
