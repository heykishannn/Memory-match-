const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameScreen = document.getElementById('game-screen');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game');
const levelDisplay = document.getElementById('levelDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const vibrationToggle = document.getElementById('vibrationToggle');
const soundToggle = document.getElementById('soundToggle');

const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');
const popupLevel = document.getElementById('popupLevel');
const popupScore = document.getElementById('popupScore');
const popupTime = document.getElementById('popupTime');
const homeBtn = document.getElementById('homeBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

const resumePopup = document.getElementById('resumePopup');
const newGameBtn = document.getElementById('newGameBtn');
const continueBtn = document.getElementById('continueBtn');

const timeoutPopup = document.getElementById('timeoutPopup');
const timeoutContinueBtn = document.getElementById('timeoutContinueBtn');
const timeoutPlayAgainBtn = document.getElementById('timeoutPlayAgainBtn');

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
  '🥥','🥭','🍐','🍊','🍈','🍏','🥑','🍅','🥕','🌽'
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
      showTimeoutPopup();
    }
  }, 1000);
}

// Show timeout popup
function showTimeoutPopup() {
  timeoutPopup.classList.remove('hidden');
  gameScreen.style.pointerEvents = 'none';
  popup.classList.add('hidden');
  resumePopup.classList.add('hidden');

  if (soundToggle.checked) {
    stopAllSounds();
    loseSound.currentTime = 0;
    loseSound.play();
  }
  vibratePattern(300);
}

// Hide timeout popup
function hideTimeoutPopup(callback) {
  timeoutPopup.classList.add('hidden');
  gameScreen.style.pointerEvents = 'auto';
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
  timeoutPopup.classList.add('hidden');
  gameContainer.style.pointerEvents = 'auto';
}

// Resume popup
function showResumePopup(progress) {
  resumePopup.classList.remove('hidden');
  startScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  popup.classList.add('hidden');
  timeoutPopup.classList.add('hidden');
}

function continueGame(progress) {
  level = progress.level;
  score = progress.score;
  resumePopup.classList.add('hidden');
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  timeoutPopup.classList.add('hidden');
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
  alert('Watch ad placeholder - after watching ad, game will continue.');
  const progress = loadProgress();
  if (progress) {
    continueGame(progress);
  }
});

// Timeout popup buttons
timeoutContinueBtn.addEventListener('click', () => {
  // Show rewarded ad simulation before continue
  showRewardedAd(() => {
    hideTimeoutPopup(() => {
      continueGame({level, score});
    });
  });
});

timeoutPlayAgainBtn.addEventListener('click', () => {
  hideTimeoutPopup(() => {
    startLevel();
  });
});

// On load check saved progress
window.addEventListener('load', () => {
  initAdMob();
  const progress = loadProgress();
  if (progress) {
    showResumePopup(progress);
  } else {
    startScreen.classList.remove('hidden');
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
