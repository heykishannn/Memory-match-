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

// DOM
const pageOverlay = document.getElementById('pageOverlay'); // Added pageOverlay
const splash = document.getElementById('splash');
const splashCards = document.querySelector('.splash-cards');
const auth = document.getElementById('auth');
const home = document.getElementById('home');
const game = document.getElementById('game');
const board = document.getElementById('board');
const resumePopup = document.getElementById('resumePopup');
const winPopup = document.getElementById('winPopup');
const losePopup = document.getElementById('losePopup');
const adPopup = document.getElementById('adPopup');
const adTimer = document.getElementById('adTimer');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const startBtn = document.getElementById('startBtn');
const resumeHomeBtn = document.getElementById('resumeHomeBtn');
const watchAdResumeBtn = document.getElementById('watchAdResumeBtn');
const restartFrom1Btn = document.getElementById('restartFrom1Btn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const homeBtn1 = document.getElementById('homeBtn1');
const playAgainBtn = document.getElementById('playAgainBtn');
const loseHomeBtn = document.getElementById('loseHomeBtn');
const watchAdBtn = document.getElementById('watchAdBtn');

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
const audioKoni = document.getElementById('audio-koni');


const resultLevel = document.getElementById('resultLevel');
const resultScore = document.getElementById('resultScore');
const resultTime = document.getElementById('resultTime');
const resultLevelL = document.getElementById('resultLevelL');
const resultScoreL = document.getElementById('resultScoreL');
const resultTimeL = document.getElementById('resultTimeL');

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
  awaitingFirstTapAfterAd: false, // Added for new rewarded ad logic
  postAdCallback: null, // Added for new rewarded ad logic
  customSoundPlayedForWin: false,
  pausedByVisibility: false
};

// Overlay helper functions
function showOverlay() {
  if (pageOverlay) pageOverlay.classList.remove('hidden');
}

function hideOverlay() {
  if (pageOverlay) pageOverlay.classList.add('hidden');
}

// Splash: 3 blank gradient cards, flip animation
function showSplash() {
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

// Auth
function checkLogin() {
  const savedUser = JSON.parse(localStorage.getItem('memorymatch_user'));
  if(savedUser && savedUser.email) {
    state.user = savedUser;
    showHome();
  } else {
    showAuth();
  }
}
function showAuth() {
  showOverlay(); // Show overlay
  auth.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  emailInput.value = '';
  passwordInput.value = '';
}
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
  localStorage.setItem('memorymatch_progress', JSON.stringify({level:1, score:0}));
  hideOverlay(); // Hide overlay on successful signup
  showHome();
};

// Home
function showHome() {
  // Ensure overlay is hidden when navigating to home, in case it was shown by auth
  hideOverlay();
  auth.classList.add('hidden');
  home.classList.remove('hidden');
  game.classList.add('hidden');
}
startBtn.onclick = () => {
  const progress = JSON.parse(localStorage.getItem('memorymatch_progress'));
  if(progress && progress.level && progress.level > 1) {
    showOverlay(); // Show overlay for resumePopup
    resumePopup.classList.remove('hidden');
    popupSound('koni'); // Play sound when continue window appears
  } else {
    state.level = 1;
    state.score = 0;
    saveGameState(); // saveProgress -> saveGameState
    showGame();
  }
};
// Home button clicks from any popup/screen should save data and show resume window
resumeHomeBtn.onclick = () => {
  stopAllSounds();
  resumePopup.classList.add('hidden');
  hideOverlay(); // Hide overlay
  state.awaitingFirstTapAfterAd = false;
  state.postAdCallback = null;
  clearTimeout(state.adTimeout);
  state.paused = false;
  if(pauseBtn) pauseBtn.textContent = "||";
  clearFullGameState(); // Added
  saveGameState();
  showHome();
};
watchAdResumeBtn.onclick = () => {
  saveGameState(); // Added before window.open
  window.open('https://www.profitableratecpm.com/cbqpeyncv?key=41a7ead40af57cd33ff5f4604f778cb9', '_blank');
  resumePopup.classList.add('hidden');
  // Overlay for startInGameAdTimer will be handled by startInGameAdTimer itself.
  // No need to call hideOverlay() here directly as resumePopup is hidden and another (ad timer) popup appears.
  startInGameAdTimer(() => { // Define original callback for resuming
    // Assuming loadFullGameState has already populated the state if page didn't reload,
    // or it will run on page load.
    showGame(true); // Pass true to resume from loaded state
  });
};
restartFrom1Btn.onclick = () => {
  stopAllSounds();
  resumePopup.classList.add('hidden');
  hideOverlay(); // Hide overlay
  state.awaitingFirstTapAfterAd = false;
  state.postAdCallback = null;
  clearTimeout(state.adTimeout);
  state.paused = false;
  if(pauseBtn) pauseBtn.textContent = "||";
  clearFullGameState(); // Added
  state.level = 1;
  state.score = 0;
  saveGameState();
  showGame();
};

// Game
function rebuildBoardFromState() {
  board.innerHTML = '';
  state.cards.forEach((card, i) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.index = i;
    cardEl.tabIndex = 0; // For accessibility
    cardEl.innerHTML = `
      <div class="front">${card.emoji}</div>
      <div class="back"></div>
    `;
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

function showGame(resumingSavedGame = false) { // Added resumingSavedGame parameter
  home.classList.add('hidden');
  game.classList.remove('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  resumePopup.classList.add('hidden');

  if (resumingSavedGame) {
    // Ensure overlay is hidden if resuming directly to game
    hideOverlay();

    rebuildBoardFromState();
    updateHUD(); // Update with loaded level, score, time
    setupSwitches(); // Apply loaded sound/vibration settings

    // loadFullGameState currently sets state.paused to false.
    // If we want to preserve a paused state from save, loadFullGameState should also load/set it.
    // For now, assume we unpause on resume, unless awaitingFirstTapAfterAd is true (handled in onCardClick).
    if (!state.awaitingFirstTapAfterAd) {
        state.paused = false;
    }
    // Ensure pause button text reflects the loaded/actual pause state
    pauseBtn.textContent = state.paused ? "▶" : "||";

    if (state.timeLeft > 0 && !state.paused) { // Only start timer if time is left and not paused
        startTimer();
    } else {
        updateHUD(); // Ensure timer display is correct even if not starting (e.g. 0 time left or paused)
    }

  } else {
    // This is for starting a new game/level normally (not resuming a saved full state)
    updateHUD();
    setupSwitches();
    startLevel(state.level); // This creates a new board, resets score for level etc.
  }
}

function getGridSize(level) {
    let pairs;
    if (level === 1) {
        pairs = 1;
    } else {
        pairs = 1 + Math.floor((level - 1) / 2); // Existing progression
    }
    let totalCardsForLevel = pairs * 2;
    // Ensure it's an even number, at least 2.
    if (totalCardsForLevel % 2 !== 0) totalCardsForLevel++; // Should not happen with current pair logic
    totalCardsForLevel = Math.max(2, totalCardsForLevel);

    // Removed all layout calculations like maxColsPossible, maxRowsPossible, etc.
    // actualCardsToDisplay will be totalCardsForLevel, as the grid will auto-fit.
    // The timer difficulty logic will need to be adjusted in a subsequent step
    // as maxPhysicalCards is no longer calculated here.
    return { totalCardsForLevel: totalCardsForLevel };
}

function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseBtn.textContent = "||"; // Set to pause symbol
  state.flippedIndices = [];
  state.matchedCount = 0;
  state.busy = false;

  const { totalCardsForLevel } = getGridSize(level);
  const actualCardsToDisplay = totalCardsForLevel; // For auto-fitting grid, we display all cards for the level.
  
  // state.maxPhysicalCards is no longer set here or used by this simplified layout approach.
  // board.style.setProperty('--cols', cols); // Removed, CSS auto-fit handles columns.

  // Use actualCardsToDisplay for board setup
  const totalPairs = Math.floor(actualCardsToDisplay / 2);
  let emojisForLevel = shuffle(EMOJIS).slice(0,totalPairs);
  let cardsArray = shuffle([...emojisForLevel,...emojisForLevel]);
  
  // Ensure enough emojis for larger boards if actualCardsToDisplay > EMOJIS.length
  if(cardsArray.length < actualCardsToDisplay) {
      const needed = actualCardsToDisplay - cardsArray.length;
      const additionalEmojis = shuffle(EMOJIS).slice(0, Math.ceil(needed / 2));
      cardsArray.push(...additionalEmojis, ...additionalEmojis);
      cardsArray = shuffle(cardsArray);
  }
  cardsArray = cardsArray.slice(0,actualCardsToDisplay); // Trim to exact actualCardsToDisplay

  state.cards = cardsArray.map((emoji,idx)=>({
    emoji, flipped:false, matched:false, idx
  }));
  
  board.innerHTML = '';
  state.cards.forEach((card,i)=>{
    const cardEl = document.createElement('div');
    cardEl.className = 'card'; // Removed 'cover' class
    cardEl.tabIndex = 0;
    cardEl.dataset.index = i;
    // Direct front/back children for full card flip
    cardEl.innerHTML = `
      <div class="front">${card.emoji}</div>
      <div class="back"></div>
    `;
    cardEl.addEventListener('click',()=>onCardClick(i));
    cardEl.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onCardClick(i);}
    });
    board.appendChild(cardEl);
  });
  

  // Timer calculation
  let baseTime;
  if (actualCardsToDisplay > MAX_CARDS_BEFORE_TIMER_DIFFICULTY) {
      const levelsPastThreshold = Math.floor((actualCardsToDisplay - MAX_CARDS_BEFORE_TIMER_DIFFICULTY) / 2); // Assuming 2 cards per effective difficulty step
      const timeForThresholdCards = MAX_CARDS_BEFORE_TIMER_DIFFICULTY * 2.0; // Base time for 30 cards, e.g., 2.0 seconds per card
      baseTime = Math.max(10, timeForThresholdCards - (levelsPastThreshold * 2)); // Reduce by 2s per step, min 10s
  } else {
      baseTime = actualCardsToDisplay * 2.0; // Time for cards up to the threshold, e.g., 2.0 seconds per card
  }
  state.timeLeft = baseTime;
  updateHUD();
  startTimer();
}
function onCardClick(index) {
  if (state.awaitingFirstTapAfterAd) {
    state.awaitingFirstTapAfterAd = false;
    state.paused = false; // Unpause the game logic state
    if (pauseBtn) pauseBtn.textContent = "||"; // Update UI

    if (typeof state.postAdCallback === 'function') {
        state.postAdCallback(); // Execute the stored callback
        state.postAdCallback = null; // Clear it after use
    } else {
        // Fallback if no specific callback, though one should always be set by startInGameAdTimer
        startTimer(); // This starts the main game countdown
    }

    // Critical: Check if the game is still paused for other reasons or if callback re-paused.
    // Only proceed with card flip if not paused.
    if (state.paused) return;
  }

  if(state.busy||state.paused) return;
  const card = state.cards[index];
  if(card.flipped||card.matched) return;
  playSound('tap');
  flipCard(index);
  state.flippedIndices.push(index);
  if(state.flippedIndices.length===2) {
    state.busy = true;
    setTimeout(checkMatch, 500);
  }
}
function flipCard(index) {
  const card = state.cards[index];
  card.flipped = true;
  const cardEl = board.children[index];
  cardEl.classList.add('flipped'); // Add flipped class directly to the card
}
function unflipCard(index) {
  const card = state.cards[index];
  card.flipped = false;
  const cardEl = board.children[index];
  cardEl.classList.remove('flipped'); // Remove flipped class directly from the card
}
function checkMatch() {
  const [i1,i2] = state.flippedIndices;
  const card1 = state.cards[i1], card2 = state.cards[i2];
  if(card1.emoji===card2.emoji) {
    card1.matched = card2.matched = true;
    board.children[i1].classList.add('matched');
    board.children[i2].classList.add('matched');
    vibrate();
    state.matchedCount++;
    state.score += 10+state.timeLeft;
    updateHUD();
    
    // Play specific sound for matched emoji
    playMatchSound(card1.emoji);

    if(state.matchedCount===Math.floor(state.cards.length/2)) setTimeout(winLevel, 400);
  } else {
    setTimeout(()=>{
      unflipCard(i1); unflipCard(i2);
    }, 400);
  }
  state.flippedIndices = [];
  state.busy = false;
}
function winLevel() {
  clearInterval(state.timerId);
  if (!state.customSoundPlayedForWin) {
    popupSound('win');
  }
  // Always reset the flag after checking, or at the start of a new level.
  // For safety, let's reset it here.
  state.customSoundPlayedForWin = false;
  vibrate();
  state.score += state.timeLeft*2;
  saveGameState(); // saveProgress -> saveGameState
  updateHUD();
  resultLevel.textContent = "Level: " + state.level;
  resultScore.textContent = "Score: " + state.score;
  resultTime.textContent = "Time Left: " + Math.round(state.timeLeft) + "s";
  losePopup.classList.add('hidden'); // Ensure losePopup is hidden
  showOverlay(); // Show overlay for winPopup
  winPopup.classList.remove('hidden');
}
nextLevelBtn.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  hideOverlay(); // Hide overlay
  clearFullGameState(); // Added
  if(state.level<MAX_LEVEL) state.level++;
  else { state.level=1; state.score=0; } // Restart if MAX_LEVEL is reached
  saveGameState();
  startLevel(state.level);
};
homeBtn1.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  hideOverlay(); // Hide overlay
  // Data should not reset when clicking home button
  clearFullGameState(); // Added
  saveGameState();
  showHome();
};
function loseLevel() {
  clearInterval(state.timerId);
  popupSound('lose');
  resultLevelL.textContent = "Level: " + state.level;
  resultScoreL.textContent = "Score: " + state.score;
  resultTimeL.textContent = "Time Left: 0s";
  showOverlay(); // Show overlay for losePopup
  losePopup.classList.remove('hidden');
}
playAgainBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  hideOverlay(); // Hide overlay
  state.awaitingFirstTapAfterAd = false;
  state.postAdCallback = null;
  clearTimeout(state.adTimeout);
  state.paused = false;
  if(pauseBtn) pauseBtn.textContent = "||";
  clearFullGameState(); // Added
  startLevel(state.level);
};
loseHomeBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  hideOverlay(); // Hide overlay
  state.awaitingFirstTapAfterAd = false;
  state.postAdCallback = null;
  clearTimeout(state.adTimeout);
  state.paused = false;
  if(pauseBtn) pauseBtn.textContent = "||";
  // Data should not reset when clicking home button
  clearFullGameState(); // Added
  saveGameState();
  showHome();
};
watchAdBtn.onclick = () => {
  saveGameState(); // Added before window.open
  window.open('https://www.profitableratecpm.com/cbqpeyncv?key=41a7ead40af57cd33ff5f4604f778cb9', '_blank');
  losePopup.classList.add('hidden');
  // Overlay for startInGameAdTimer will be handled by startInGameAdTimer itself.
  // No need to call hideOverlay() here directly.
  startInGameAdTimer(() => { // Define original callback for continuing after loss
    // Assuming loadFullGameState has populated the state.
    // This will rebuild board, update HUD, and start timer based on loaded state.
    showGame(true); // Pass true to resume from loaded state
  });
};
function updateHUD() {
  levelDisplay.textContent = `Level: ${state.level}`;
  // Ensure time is formatted with leading zero if less than 10
  timerDisplay.textContent = `Time: ${state.timeLeft < 10 ? '0' + Math.round(state.timeLeft) : Math.round(state.timeLeft)}`;
  scoreDisplay.textContent = `Score: ${state.score}`;
}
function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(()=>{
    if(!state.paused) {
      state.timeLeft--;
      updateHUD();
      if(state.timeLeft<=0) {
        clearInterval(state.timerId);
        winPopup.classList.add('hidden'); // Ensure winPopup is hidden
        loseLevel();
      }
    }
  },1000);
}
function setupSwitches() {
  soundToggle.checked = state.soundOn;
  vibrationToggle.checked = state.vibrationOn;

  soundToggle.onchange = ()=>{ state.soundOn=soundToggle.checked; };
  vibrationToggle.onchange = ()=>{ state.vibrationOn=vibrationToggle.checked; };

  pauseBtn.onclick = ()=>{
    state.paused = !state.paused;
    // Changed text to symbols for pause/resume
    pauseBtn.textContent = state.paused ? "▶" : "||";
    popupSound(state.paused ? 'pause' : 'restart');
  };
}
function playSound(type) {
  if(!state.soundOn || !state.isGameActive) return;
  stopAllSounds();
  if(type==="tap") { audioTap.currentTime=0; audioTap.play(); state.playingSound=audioTap; }
}
function popupSound(type) {
  if(!state.soundOn || !state.isGameActive) return;
  stopAllSounds();
  if(type==="win") { audioWin.currentTime=0; audioWin.loop=false; audioWin.play(); state.playingSound=audioWin; }
  if(type==="lose") { audioLose.currentTime=0; audioLose.loop=false; audioLose.play(); state.playingSound=audioLose; }
  if(type==="pause") { audioPause.currentTime=0; audioPause.loop=false; audioPause.play(); state.playingSound=audioPause; }
  if(type==="restart") { audioRestart.currentTime=0; audioRestart.loop=false; audioRestart.play(); state.playingSound=audioRestart; }
  if(type==="koni") { audioKoni.currentTime=0; audioKoni.loop=false; audioKoni.play(); state.playingSound=audioKoni; }
}

// New function to play specific sound for matched emoji
function playMatchSound(emoji) {
  if(!state.soundOn || !state.isGameActive) return;
  state.customSoundPlayedForWin = false;
  stopAllSounds(); // Stop any currently playing sound

  let soundToPlay = null;
  switch(emoji) {
    case "🍌": soundToPlay = audioGwak; break;
    case "🍅": soundToPlay = audioTamatar; break;
    case "🦚": soundToPlay = audioMor; break;
    case "🗿": soundToPlay = audioSigma; break;
    case "🎂": soundToPlay = audioBirthday; break;
    case "🪕": soundToPlay = audioSitar; break;
    case "🐱": soundToPlay = audioBell; break;
    default: break; // No specific sound for other emojis
  }

  if (soundToPlay) {
    soundToPlay.currentTime = 0;
    soundToPlay.play();
    state.playingSound = soundToPlay;
    state.customSoundPlayedForWin = true;
  }
}

function stopAllSounds() {
  [audioTap, audioWin, audioLose, audioPause, audioRestart,
   audioGwak, audioTamatar, audioMor, audioSigma, audioBirthday, audioSitar, audioBell, audioKoni
  ].forEach(a=>{ a.pause(); a.currentTime=0; });
  state.playingSound = null;
}
function vibrate() {
  if(state.vibrationOn && window.navigator && window.navigator.vibrate) window.navigator.vibrate(220);
}
function saveGameState() { // Renamed saveProgress to saveGameState
  // Existing functionality: save level and score to memorymatch_progress
  localStorage.setItem('memorymatch_progress', JSON.stringify({
    level: state.level,
    score: state.score
  }));

  // New functionality: save full state to memorymatch_full_state
  const fullState = {
    level: state.level,
    score: state.score,
    timeLeft: state.timeLeft,
    cards: state.cards, // Ensure cards are serializable (they should be)
    flippedIndices: state.flippedIndices,
    matchedCount: state.matchedCount,
    soundOn: state.soundOn,
    vibrationOn: state.vibrationOn,
    awaitingFirstTapAfterAd: state.awaitingFirstTapAfterAd,
    paused: state.paused
  };
  localStorage.setItem('memorymatch_full_state', JSON.stringify(fullState));
  localStorage.setItem('memorymatch_has_full_state', 'true');
}

function clearFullGameState() {
  localStorage.removeItem('memorymatch_full_state');
  localStorage.setItem('memorymatch_has_full_state', 'false');
}

function loadFullGameState() {
  if (localStorage.getItem('memorymatch_has_full_state') === 'true') {
    try {
      const fullStateString = localStorage.getItem('memorymatch_full_state');
      if (fullStateString) {
        const loadedState = JSON.parse(fullStateString);

        // Update global state object
        state.level = loadedState.level;
        state.score = loadedState.score;
        state.timeLeft = loadedState.timeLeft;
        state.cards = loadedState.cards;
        state.flippedIndices = loadedState.flippedIndices;
        state.matchedCount = loadedState.matchedCount;
        state.soundOn = loadedState.soundOn;
        state.vibrationOn = loadedState.vibrationOn;

        state.awaitingFirstTapAfterAd = loadedState.awaitingFirstTapAfterAd || false;
        state.paused = loadedState.paused || false;

        if (state.awaitingFirstTapAfterAd) {
          state.postAdCallback = () => { showGame(true); };
          // Also ensure the pause button UI is correct if the game loads into this paused state.
          if (pauseBtn && state.paused) { // Check pauseBtn exists
            pauseBtn.textContent = "▶";
          }
        } else {
          state.postAdCallback = null;
        }

        // Potentially reset other state properties not in fullState
        // For example, timerId should be cleared and recreated by game logic if resuming.
        state.timerId = null;
        // state.paused is now handled above by loading from loadedState.paused
        state.busy = false;
        // Consider other transient state properties like postAdCallback are handled above.
        // For now, only loading the core persistent state.

        return true; // Successfully loaded and applied state
      }
    } catch (error) {
      console.error("Error loading full game state:", error);
      // Optionally, clear the possibly corrupted state
      // localStorage.removeItem('memorymatch_full_state');
      // localStorage.removeItem('memorymatch_has_full_state');
      return false; // Parsing failed
    }
  }
  return false; // No full state found or flag not set
}

function shuffle(arr) {
  let a = arr.slice();
  for(let i=a.length-1;i>0;i--) {
    let j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function startInGameAdTimer(callback) {
  showOverlay(); // Show overlay for ad timer popup
  adPopup.classList.remove('hidden');
  popupSound('pause'); // Optional: play a sound when timer starts
  let secondsLeft = 5;
  adTimer.textContent = secondsLeft;
  state.adTimeout && clearTimeout(state.adTimeout); // Clear any existing ad timeout

  function tick() {
    secondsLeft--;
    adTimer.textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearTimeout(state.adTimeout); // Use clearTimeout as we're using setTimeout for recursion
      hideOverlay(); // Hide overlay when ad timer finishes
      adPopup.classList.add('hidden');
      stopAllSounds(); // Stop pause sound

      state.timeLeft += 10; // Add 10 seconds to game timer
      updateHUD(); // Update timer display

      // Instead of calling callback directly, set up for first tap resume
      state.awaitingFirstTapAfterAd = true;
      state.paused = true; // Keep game paused
      if (pauseBtn) pauseBtn.textContent = "▶"; // Update pause button text
      state.postAdCallback = callback; // Store the original callback
      // Do not call callback() here anymore
    } else {
      state.adTimeout = setTimeout(tick, 1000);
    }
  }
  state.adTimeout = setTimeout(tick, 1000); // Start the timer
}

// function showAd(callback) {
//   // adPopup.classList.remove('hidden'); // No longer show internal popup
//   // popupSound('pause'); // No longer play internal sound
//   // let t = 5;
//   // adTimer.textContent = t;
//   // state.adTimeout && clearTimeout(state.adTimeout);
//   // function tick() {
//   //   t--;
//   //   adTimer.textContent = t;
//   //   if(t<=0) {
//   //     adPopup.classList.add('hidden');
//   //     stopAllSounds();
//   //     callback && callback(); // Execute callback
//   //   } else {
//   //     state.adTimeout = setTimeout(tick,1000);
//   //   }
//   // }
//   // state.adTimeout = setTimeout(tick,1000);
//
//   // Immediately execute the callback if provided, as ad is external.
//   // if (callback) {
//   //   callback();
//   // }
// }

// Lose/Win/Popup sound only while popup is open
[winPopup, losePopup, adPopup, resumePopup].forEach(popup => {
  if(popup) popup.addEventListener('transitionend', ()=>{ if(popup.classList.contains('hidden')) stopAllSounds(); });
});

// Init
// showSplash(); // Will be called by initializeGame if needed

// Initial game load sequence
function initializeGame() {
  if (loadFullGameState()) {
    // Successfully loaded a full game state
    splash.classList.add('hidden'); // Ensure splash is hidden
    auth.classList.add('hidden');   // Ensure auth is hidden
    home.classList.add('hidden');   // Ensure home is hidden
    // game.classList.remove('hidden'); // showGame will handle this
    hideOverlay(); // Ensure no overlay is showing from a previous session if not handled
    showGame(true); // Resume the game
  } else {
    // No full game state found, or error during load, proceed with normal splash and login flow
    showSplash();
  }
}

initializeGame(); // Call the new initialization function

// Event listener for page visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveGameState(); // Save full game state when page is hidden
    state.isGameActive = false; // Keep this
    stopAllSounds(); // Keep this

    // If the game is active and not already paused by the user or ad flow
    if (game.classList.contains('hidden') === false && !state.paused) {
      state.paused = true;
      state.pausedByVisibility = true;
      if(pauseBtn) pauseBtn.textContent = "▶";
      // No need to call popupSound('pause') here as it's a background event
    }
  } else {
    state.isGameActive = true; // Keep this

    // If the game was paused by visibility change
    if (state.pausedByVisibility) {
      state.paused = false;
      state.pausedByVisibility = false;
      if(pauseBtn) pauseBtn.textContent = "||";
      // No need to call popupSound('restart') here as it's a background event
      // The game timer will resume automatically if it was running
    }
    // If the game is showing and was paused for other reasons (e.g. ad popup),
    // it should remain paused until user interaction or ad completion.
    // The existing logic for state.awaitingFirstTapAfterAd should handle ad resumes.
  }
});
