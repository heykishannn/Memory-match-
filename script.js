const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
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
const homeBtn = document.getElementById('homeBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const loseSound = document.getElementById('loseSound');

let level = 1;
let score = 0;
let timer = 0;
let timerInterval = null;

let flippedCards = [];
let matchedCards = [];

let cardsArray = [];

const maxLevels = 100;

// Emoji pool for cards (20 unique emojis max for variety)
const emojiPool = [
  '🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🍑','🍋',
  '🥥','🥭','🍐','🍊','🍈','🍏','🥑','🍅','🥕','🌽'
];

// Helper: shuffle array
function shuffle(array) {
  for(let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate cards for current level based on difficulty
// Difficulty increases: more pairs and less time
function generateCards(level) {
  // Number of pairs increases every 5 levels, max 10 pairs (20 cards)
  let pairs = Math.min(2 + Math.floor(level / 5), 10);
  let selectedEmojis = shuffle(emojiPool).slice(0, pairs);

  let cards = [];
  selectedEmojis.forEach((emoji, index) => {
    cards.push({name: emoji, id: index * 2});
    cards.push({name: emoji, id: index * 2 + 1});
  });

  return shuffle(cards);
}

// Calculate timer based on level (harder = less time)
// Starts at 60 seconds, reduces by 0.5 seconds per level, minimum 15 seconds
function calculateTimer(level) {
  return Math.max(15, 60 - (level * 0.5));
}

// Create the game board UI
function createBoard() {
  gameContainer.innerHTML = '';
  cardsArray.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.name = card.name;
    cardElement.dataset.id = card.id;

    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${card.name}</div>
      </div>
    `;

    cardElement.addEventListener('click', flipCard);
    gameContainer.appendChild(cardElement);
  });

  // Adjust grid columns based on number of cards (pairs)
  let pairs = cardsArray.length / 2;
  let cols = Math.min(5, Math.ceil(Math.sqrt(cardsArray.length)));
  gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gameContainer.setAttribute('data-cols', cols);
}

// Flip card handler
function flipCard() {
  if (flippedCards.length === 2) return;
  if (this.classList.contains('flipped') || matchedCards.includes(this)) return;

  this.classList.add('flipped');
  flippedCards.push(this);

  if (soundToggle.checked) flipSound.play();

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

// Check if two flipped cards match
function checkForMatch() {
  const [cardOne, cardTwo] = flippedCards;
  if (cardOne.dataset.name === cardTwo.dataset.name) {
    matchedCards.push(cardOne, cardTwo);
    score += 10;
    scoreDisplay.textContent = score;

    if (vibrationToggle.checked && navigator.vibrate) {
      navigator.vibrate(150);
    }
    if (soundToggle.checked) {
      matchSound.play();
    }

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
  timerDisplay.textContent = timer.toFixed(1);
  timerInterval = setInterval(() => {
    timer -= 0.1;
    timerDisplay.textContent = timer.toFixed(1);
    if (timer <= 0) {
      clearInterval(timerInterval);
      showPopup(false, 'Time up! Game over.');
    }
  }, 100);
}

// Show popup modal with zoom animation
function showPopup(win, message) {
  popupTitle.textContent = win ? 'You Win!' : 'Time Out!';
  popupMessage.textContent = message;
  popup.classList.remove('hidden');
  popup.style.animation = 'zoomIn 0.3s ease forwards';

  // Disable game interaction
  gameContainer.style.pointerEvents = 'none';
  restartBtn.disabled = true;

  // Vibration and sound on popup
  if (vibrationToggle.checked && navigator.vibrate) {
    navigator.vibrate(300);
  }
  if (soundToggle.checked) {
    if (win) {
      matchSound.play();
    } else {
      loseSound.play();
    }
  }
}

// Hide popup modal with zoom out animation
function hidePopup(callback) {
  popup.style.animation = 'zoomOut 0.3s ease forwards';
  setTimeout(() => {
    popup.classList.add('hidden');
    gameContainer.style.pointerEvents = 'auto';
    restartBtn.disabled = false;
    if (callback) callback();
  }, 300);
}

// Start a level
function startLevel() {
  flippedCards = [];
  matchedCards = [];
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;

  cardsArray = generateCards(level);
  createBoard();

  timer = calculateTimer(level);
  clearInterval(timerInterval);
  startTimer();
}

// Reset the entire game
function resetGame() {
  clearInterval(timerInterval);
  level = 1;
  score = 0;
  flippedCards = [];
  matchedCards = [];
  startScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  popup.classList.add('hidden');
  gameContainer.style.pointerEvents = 'auto';
  restartBtn.disabled = false;
}

// Event Listeners
startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startLevel();
});

restartBtn.addEventListener('click', () => {
  resetGame();
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

// Disable double tap zoom on mobile for better UX
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });
