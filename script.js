let gameScreen;
let startScreen;

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameContainer = document.getElementById('game');
const levelDisplay = document.getElementById('levelDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const vibrationToggle = document.getElementById('vibrationToggle');
const soundToggle = document.getElementById('soundToggle');

// Add these with other element selectors
let splashScreen;
let loginSignupScreen;

// Login/Signup Screen Elements
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authMessage = document.getElementById('authMessage');

// Ad Simulation Screen Elements
let adSimulationScreen;
const adTimerDisplay = document.getElementById('adTimerDisplay');

let popup;
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');
const popupLevel = document.getElementById('popupLevel');
const popupScore = document.getElementById('popupScore');
const popupTime = document.getElementById('popupTime');
const homeBtn = document.getElementById('homeBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

let resumePopup;
const newGameBtn = document.getElementById('newGameBtn');
const continueBtn = document.getElementById('continueBtn');

let losePopupWindow; // Renamed
const losePlayAgainBtn = document.getElementById('losePlayAgainBtn'); // New
const loseHomeBtn = document.getElementById('loseHomeBtn'); // New

const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const loseSound = document.getElementById('loseSound');
const pauseSound = document.getElementById('pauseSound');
const restartSound = document.getElementById('restartSound');

let level = 1;
let score = 0;
let timer = 0;
let timerInterval = null;

let flippedCards = [];
let matchedCards = [];

let cardsArray = [];

const maxLevels = 100;

let isPaused = false;

// Emoji pool
const emojiPool = [
  '🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🍑','🍋',
  '🥥','🥭','🍐','🍊','🍈','🍏','🥑','🍅','🥕','🌽',
  '🌷','🪷','🌸','🪻','🐼','🦄','🌺','🍂','🍄','🌿',
  '🐔','🐣','🦜','🕊️','🦢','🦚','🦋','🍧','🍨','🍭',
  '🍬','☕','🗿','🛕','🎂','🧸','🎹','💎','🔮','🔔',
];

// Stop all sounds helper
function stopAllSounds() {
  [flipSound, matchSound, loseSound, pauseSound, restartSound].forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

// Vibrate helper with APK compatibility
function vibratePattern(duration = 200) {
  if (vibrationToggle.checked && navigator.vibrate) {
    try {
      navigator.vibrate([duration]);
    } catch(e) {
      // fallback or ignore errors
    }
  }
}

// Shuffle helper
function shuffle(array) {
  for(let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate cards for current level
function generateCards(level) {
  let pairs = Math.min(2 + Math.floor(level / 5), 10);
  let selectedEmojis = shuffle(emojiPool).slice(0, pairs);

  let cards = [];
  selectedEmojis.forEach((emoji, index) => {
    cards.push({name: emoji, id: index * 2});
    cards.push({name: emoji, id: index * 2 + 1});
  });

  return shuffle(cards);
}

// Calculate timer based on number of cards (2.5 seconds per card)
function calculateTimer(level) {
  const tempCards = generateCards(level);
  return tempCards.length * 2.5; // seconds
}

// Create board
function createBoard() {
  gameContainer.innerHTML = '';
  cardsArray.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.name = card.name;
    cardElement.dataset.id = card.id;

    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${card.name}</div>
      </div>
    `;

    cardElement.addEventListener('click', flipCard);
    gameContainer.appendChild(cardElement);
  });

  let cols = Math.min(5, Math.ceil(Math.sqrt(cardsArray.length)));
  gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gameContainer.setAttribute('data-cols', cols);
}

// Flip card handler
function flipCard() {
  if (isPaused) return;
  if (flippedCards.length === 2) return;
  if (this.classList.contains('flipped') || matchedCards.includes(this)) return;

  this.classList.add('flipped');
  flippedCards.push(this);

  if (soundToggle.checked) {
    stopAllSounds();
    flipSound.currentTime = 0;
    flipSound.play();
  }

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

// Check match
function checkForMatch() {
  const [cardOne, cardTwo] = flippedCards;
  if (cardOne.dataset.name === cardTwo.dataset.name) {
    matchedCards.push(cardOne, cardTwo);
    score += 10;
    scoreDisplay.textContent = score;

    vibratePattern(150);

    flippedCards = [];

    if (matchedCards.length === cardsArray.length) {
      clearInterval(timerInterval);
      setTimeout(() => {
        showPopup(true, `Level ${level} Complete!`);
      }, 500);
    }
  } else {
    setTimeout(() => {
      cardOne.classList.remove('flipped');
      cardTwo.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
  }
}

// Timer countdown
function startTimer() {
  clearInterval(timerInterval);
  timerDisplay.textContent = Math.floor(timer);
  timerInterval = setInterval(() => {
    if (isPaused) return;
    timer -= 1;
    timerDisplay.textContent = Math.max(0, Math.floor(timer));
    if (timer <= 0) {
      clearInterval(timerInterval);
      showLoseWindow(); // Renamed
    }
  }, 1000);
}

// Show lose window
function showLoseWindow() { // Renamed
  losePopupWindow.classList.remove('hidden'); // Use new ID
  // Ensure other popups/screens are not interactive or hidden
  gameScreen.style.pointerEvents = 'none';
  popup.classList.add('hidden');
  resumePopup.classList.add('hidden');

  if (soundToggle.checked) {
    stopAllSounds(); // Stop other sounds first
    loseSound.currentTime = 0;
    loseSound.play(); // Play lose sound
  }
  vibratePattern(300); // Optional: keep vibration
}

// Hide lose window
function hideLoseWindow(callback) { // Renamed
  losePopupWindow.classList.add('hidden'); // Use new ID
  gameScreen.style.pointerEvents = 'auto';

  // Stop the lose sound
  if (soundToggle.checked || !loseSound.paused) { // Check if it was playing
      loseSound.pause();
      loseSound.currentTime = 0;
  }

  if (callback) callback();
}

// Show popup (win or lose)
function showPopup(win, message) {
  popupTitle.textContent = win ? 'You Won!' : 'Time Out!';
  popupMessage.textContent = message;
  popupLevel.textContent = level;
  popupScore.textContent = score;
  popupTime.textContent = Math.max(0, Math.floor(timer));
  popup.classList.remove('hidden');
  popup.style.animation = 'zoomIn 0.3s ease forwards';

  gameContainer.style.pointerEvents = 'none';

  if (vibrationToggle.checked) {
    vibratePattern(300);
  }
  if (soundToggle.checked) {
    stopAllSounds();
    if (win) {
      matchSound.currentTime = 0;
      matchSound.play();
    } else {
      loseSound.currentTime = 0;
      loseSound.play();
    }
  }

  if (win) {
    saveProgress();
  } else {
    clearProgress();
  }
}

// Hide popup
function hidePopup(callback) {
  popup.style.animation = 'zoomOut 0.3s ease forwards';
  setTimeout(() => {
    popup.classList.add('hidden');
    gameContainer.style.pointerEvents = 'auto';
    if (callback) callback();
  }, 300);
}

// Save/load progress
function saveProgress() {
  localStorage.setItem('memoryMatchLevel', level);
  localStorage.setItem('memoryMatchScore', score);
}

function loadProgress() {
  const savedLevel = localStorage.getItem('memoryMatchLevel');
  const savedScore = localStorage.getItem('memoryMatchScore');
  if (savedLevel && savedScore) {
    return {
      level: parseInt(savedLevel, 10),
      score: parseInt(savedScore, 10)
    };
  }
  return null;
}

function clearProgress() {
  localStorage.removeItem('memoryMatchLevel');
  localStorage.removeItem('memoryMatchScore');
}

// Start level
function startLevel() {
  flippedCards = [];
  matchedCards = [];
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;

  cardsArray = generateCards(level);
  createBoard();

  timer = calculateTimer(level);
  clearInterval(timerInterval);
  isPaused = false;
  startTimer();
}

// Reset game
function resetGame() {
  clearInterval(timerInterval);
  stopAllSounds();
  level = 1;
  score = 0;
  flippedCards = [];
  matchedCards = [];
  startScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  popup.classList.add('hidden');
  resumePopup.classList.add('hidden');
  if (losePopupWindow) losePopupWindow.classList.add('hidden'); // Ensure losePopupWindow is hidden
  gameContainer.style.pointerEvents = 'auto';
}

// Resume popup
function showResumePopup(progress) { // progress parameter is important
  resumePopup.classList.remove('hidden');
  startScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  popup.classList.add('hidden');
  if (losePopupWindow) losePopupWindow.classList.add('hidden'); // Ensure losePopupWindow is also hidden
  loginSignupScreen.classList.add('hidden'); // Ensure login screen is hidden
}

function continueGame(progress) {
  level = progress.level;
  score = progress.score;
  resumePopup.classList.add('hidden');
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  if (losePopupWindow) losePopupWindow.classList.add('hidden'); // Ensure losePopupWindow is hidden
  isPaused = false;
  startTimer();
}

// Pause toggle with pause and restart sounds
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '▶' : '❚❚';

  if (soundToggle.checked) {
    stopAllSounds();
    if (isPaused) {
      pauseSound.currentTime = 0;
      pauseSound.play();
    } else {
      restartSound.currentTime = 0;
      restartSound.play();
    }
  }
});

// Event listeners
startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startLevel();
});

homeBtn.addEventListener('click', () => {
  hidePopup(() => {
    resetGame();
  });
});

nextLevelBtn.addEventListener('click', () => {
  hidePopup(() => {
    level++;
    if(level > maxLevels) {
      alert(`🎉 Congratulations! You completed all ${maxLevels} levels! Your score: ${score}`);
      resetGame();
    } else {
      startLevel();
    }
  });
});

newGameBtn.addEventListener('click', () => {
  clearProgress();
  resumePopup.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

continueBtn.addEventListener('click', () => {
  const progress = loadProgress();
  if (progress) {
    // Ensure resumePopup is hidden and game screen is shown by continueGame or here
    resumePopup.classList.add('hidden');
    gameScreen.classList.remove('hidden'); // Ensure game screen is shown
    startScreen.classList.add('hidden'); // Ensure start screen is hidden
    continueGame(progress);
  } else {
    // Fallback if progress somehow is null, though showResumePopup usually ensures it's not
    resumePopup.classList.add('hidden');
    startScreen.classList.remove('hidden');
  }
});

if (losePlayAgainBtn) {
  losePlayAgainBtn.addEventListener('click', () => {
    hideLoseWindow(() => { // Pass callback to ensure sound stops before action
      score = 0; // Reset score for the current level attempt or handle as per game rules
      // It should restart the current level.
      // Re-initialize or reset aspects of the current level.
      // For instance, if `startLevel()` resets and starts the current `level`:
      startLevel();
    });
  });
}

if (loseHomeBtn) {
  loseHomeBtn.addEventListener('click', () => {
    hideLoseWindow(() => { // Pass callback
      resetGame(); // resetGame() typically takes user to home/start screen
    });
  });
}

// Function to validate email (basic)
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to handle successful login/signup
function handleSuccessfulAuth(username, email) {
  localStorage.setItem('username', username); // Store username
  localStorage.setItem('userEmail', email); // Store email

  // No success message needed on authMessage as we are past that screen
  // if (authMessage) authMessage.textContent = 'Success!';
  // if (authMessage) authMessage.style.color = '#d4edda';

  // Ensure login and splash are hidden
  if (loginSignupScreen) loginSignupScreen.classList.add('hidden');
  if (splashScreen) splashScreen.classList.add('hidden'); // Explicitly hide splash

  // Hide other potentially visible popups/screens as a cleanup
  if (adSimulationScreen) adSimulationScreen.classList.add('hidden');
  if (gameScreen) gameScreen.classList.add('hidden'); // Game screen should not be visible yet
  if (resumePopup) resumePopup.classList.add('hidden');
  if (losePopupWindow) losePopupWindow.classList.add('hidden');
  if (popup) popup.classList.add('hidden');


  // Show the main game start screen
  if (startScreen) startScreen.classList.remove('hidden');

  // Check for saved game progress (this part is new for this function but uses existing logic)
  const progress = loadProgress();
  if (progress) {
    showResumePopup(progress);
  }
}

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!username) {
      if (authMessage) authMessage.textContent = 'Please enter a username.';
      if (authMessage) authMessage.style.color = '#f8d7da';
      return;
    }
    if (!isValidEmail(email)) {
      if (authMessage) authMessage.textContent = 'Please enter a valid email address.';
      if (authMessage) authMessage.style.color = '#f8d7da';
      return;
    }

    if (authMessage) authMessage.textContent = ''; // Clear any previous error
    handleSuccessfulAuth(username, email);
  });
}

if (signupBtn) {
  signupBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!username) {
      if (authMessage) authMessage.textContent = 'Please enter a username.';
      if (authMessage) authMessage.style.color = '#f8d7da';
      return;
    }
    if (!isValidEmail(email)) {
      if (authMessage) authMessage.textContent = 'Please enter a valid email address.';
      if (authMessage) authMessage.style.color = '#f8d7da';
      return;
    }

    if (authMessage) authMessage.textContent = ''; // Clear any previous error
    handleSuccessfulAuth(username, email);
    // In a real app, signup might have slightly different logic,
    // like checking if user already exists, but for now, it's the same as login.
  });
}

// Remove or comment out the old watchAdBtn listener:
/*
if (watchAdBtn) {
  watchAdBtn.addEventListener('click', () => {
    // ... old logic ...
  });
}
*/

window.addEventListener('load', () => {
  splashScreen = document.getElementById('splash-screen');
  loginSignupScreen = document.getElementById('login-signup-screen');
  startScreen = document.getElementById('start-screen');
  gameScreen = document.getElementById('game-screen');
  adSimulationScreen = document.getElementById('ad-simulation-screen');
  resumePopup = document.getElementById('resumePopup');
  losePopupWindow = document.getElementById('losePopupWindow');
  popup = document.getElementById('popup');

  // Add diagnostic console.error logs if any critical element is not found
  if (!splashScreen) console.error('CRITICAL: splashScreen element not found!');
  if (!loginSignupScreen) console.error('CRITICAL: loginSignupScreen element not found!');
  if (!startScreen) console.error('CRITICAL: startScreen element not found!');
  if (!gameScreen) console.error('CRITICAL: gameScreen element not found!');
  if (!resumePopup) console.error('CRITICAL: resumePopup element not found!');
  if (!popup) console.error('CRITICAL: popup element not found!');
  if (!losePopupWindow) console.error('CRITICAL: losePopupWindow element not found!');
  if (!adSimulationScreen) console.error('CRITICAL: adSimulationScreen element not found!');

  // Ensure all other screens are hidden by default initially
  if (loginSignupScreen) loginSignupScreen.classList.add('hidden');
  if (startScreen) startScreen.classList.add('hidden');
  if (gameScreen) gameScreen.classList.add('hidden');
  if (adSimulationScreen) adSimulationScreen.classList.add('hidden');
  if (resumePopup) resumePopup.classList.add('hidden');
  if (losePopupWindow) losePopupWindow.classList.add('hidden');
  if (popup) popup.classList.add('hidden');

  const proceedWithAppLogic = () => {
    console.log('Proceeding to app logic: Unconditionally showing Login/Signup screen.');

    // Ensure startScreen and gameScreen are hidden
    if (startScreen) startScreen.classList.add('hidden');
    else console.error('CRITICAL: startScreen element not found during proceedWithAppLogic.');

    if (gameScreen) gameScreen.classList.add('hidden');
    else console.error('CRITICAL: gameScreen element not found during proceedWithAppLogic.');

    // Ensure resumePopup is hidden
    if (resumePopup) resumePopup.classList.add('hidden');
    else console.error('CRITICAL: resumePopup element not found during proceedWithAppLogic.');

    // Show loginSignupScreen
    if (loginSignupScreen) {
      loginSignupScreen.classList.remove('hidden');
    } else {
      console.error('CRITICAL: loginSignupScreen element not found, cannot display login page.');
    }
  };

  // Check if splashScreen element exists
  if (splashScreen) {
    console.log('Splash screen found. Displaying for 3 seconds.');
    // It's visible by default via CSS

    setTimeout(() => {
      console.log('Splash timeout reached. Removing splash screen from DOM.');
      splashScreen.remove(); // Remove from DOM
      proceedWithAppLogic(); // Proceed after splash is removed
    }, 3000); // Splash screen duration: 3 seconds
  } else {
    // If splash screen element isn't found for some reason, proceed directly
    console.log('Splash screen element not found. Proceeding without splash.');
    proceedWithAppLogic();
  }
});

// Disable double tap zoom on mobile
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Stop sounds on page unload (game exit)
window.addEventListener('beforeunload', () => {
  stopAllSounds();
});

// AdMob Rewarded Ad simulation (replace with real SDK for native apps)
let rewardedAdLoaded = true; // Simulate ad loaded

function showRewardedAd(onComplete) {
  if (!rewardedAdLoaded) {
    alert('Ad not loaded yet, please try again later.');
    return;
  }
  const watched = confirm('Watch rewarded ad to continue? Click OK to simulate watching ad.');
  if (watched) {
    onComplete();
  } else {
    alert('You need to watch the ad to continue.');
  }
}

// Initialize AdMob Banner Ad
function initAdMob() {
  if (!window.adsbygoogle) return;
  (adsbygoogle = window.adsbygoogle || []).push({});
}
