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
const playAgainBtn = document.getElementById('playAgainBtn');
// const loseHomeBtn = document.getElementById('loseHomeBtn'); // Removed by new buttons
// const watchAdBtn = document.getElementById('watchAdBtn'); // Removed by new buttons

// Buttons for Continue Popup
const watchAdContinueBtn = document.getElementById('watchAdContinueBtn');
const continueHomeBtn = document.getElementById('continueHomeBtn');
const startFromLevel1Btn = document.getElementById('startFromLevel1Btn');

// Buttons for Lose Popup (new ones)
const loseWatchAdBtn = document.getElementById('loseWatchAdBtn');
const loseRestartHomeBtn = document.getElementById('loseRestartHomeBtn');

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
hideFooterAndBanner(); // Hide footer when continue popup is shown
if (continuePopup) continuePopup.classList.remove('hidden');
showOverlay();
}

function hideContinuePopup() {
if (continuePopup) continuePopup.classList.add('hidden');
hideOverlay();
}

function hideLosePopup() {
if (losePopup) losePopup.classList.add('hidden');
hideOverlay();
}

// GAME BOARD/LOGIC HELPERS
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
showHome();
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
  if (originalContext === 'continuePopup') {
    // This implies the user chose to watch an ad to continue
    // loadFullGameState(); // This might be needed if state was cleared or is complex
    state.paused = false;
    state.awaitingTapForBonusTime = false; // Or similar flag
    if (pauseBtn) pauseBtn.textContent = "||";
    // saveGameState(); // Save the new state (e.g., with bonus time)
    showGame(true); // Resume game
    // Check if level was already won (e.g. if ad shown after win condition met)
    // if (state.cards && state.cards.length > 0 && state.matchedCount === Math.floor(state.cards.length / 2)) {
    //   setTimeout(winLevel, 100); // winLevel needs to be defined
    // }
  } else if (originalContext === 'losePopup') {
    // This implies user watched ad for an extra chance after losing
    state.awaitingTapForBonusTime = true; // Or a specific state to handle post-ad interaction
    state.paused = true; // Keep game paused until user interacts
    if (pauseBtn) pauseBtn.textContent = "▶";
    // saveGameState();
    showGame(true); // Show game, but it might be in a "tap to use bonus" state
  }
  // Potentially other contexts if showCustomRewardScreen is used elsewhere
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
}, 3000);
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
// const hasResumableStateFlag = localStorage.getItem('memorymatch_has_full_state') === 'true';
// if (hasResumableStateFlag && state.cards && state.cards.length > 0 && state.resumeData) {
// showContinuePopup();
// } else {
// clearFullGameState(); // Reset state for a new game
state.level = 1; // Start from level 1
state.score = 0; // Reset score
state.timeLeft = calculateTimeForLevel(state.level); // Calculate initial time
// initializeNewLevel(); // This would generate cards, set up board, update HUD
// For now, let's assume initializeNewLevel does:
// - state.cards = generateCardsForLevel(state.level);
// - state.matchedCount = 0;
// - state.flippedIndices = [];
// - rebuildBoardFromState();
// - updateHUD();
// - startTimer(); // Needs to be defined
saveGameState(); // Save the initial state of the new game.
showGame(); // Show the game screen.
// }
};

// DOMContentLoaded listener calling showSplash()
document.addEventListener('DOMContentLoaded', () => {
  showSplash();
});

// Functions like winLevel, loseLevel, initializeNewLevel, startTimer, onCardClick,
// saveGameState, loadFullGameState, clearFullGameState, calculateTimeForLevel, generateCardsForLevel
// are referenced but not fully defined/provided in the original script snippet for reordering.
// Their definitions would be needed for the game to be fully functional.
// For example, onCardClick is defined inline in rebuildBoardFromState.
// loadFullGameState, saveGameState, clearFullGameState were mentioned in comments for startBtn.onclick
// but their definitions are not present.
// I've added comments where these would integrate.
// The reordering focuses on the explicitly provided functions.
// The `currentRewardBackButton.onclick` is an example of an event handler
// that is logically part of `showCustomRewardScreen` and is kept there.
