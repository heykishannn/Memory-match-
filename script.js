// --- Emoji Set ---
const EMOJIS = [
  "🍎","🍌","🍇","🍓","🍉","🍍","🥝","🍒","🍑","🍋",
  "🥥","🥭","🍐","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
  "🌷","🌸","🌺","🌼","🐼","🦄","🌺","🍂","🍄","🌿",
  "🐥","🐤","🦜","🕊️","🦢","🦋","🍨","🍧","🍭",
  "🍬","☕","🗿","🛕","🎂","🧸","🎹","💎","🔮","🔔"
];

const MAX_LEVEL = 100;
const MIN_GRID = 2, MAX_GRID = 10;

// --- DOM Elements ---
const splash = document.getElementById('splash');
const auth = document.getElementById('auth');
const game = document.getElementById('game');
const board = document.getElementById('board');
const winPopup = document.getElementById('winPopup');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const soundBtn = document.getElementById('soundBtn');
const vibrationBtn = document.getElementById('vibrationBtn');
const pauseBtn = document.getElementById('pauseBtn');

// --- State ---
let state = {
  level: 1,
  score: 0,
  timeLeft: 0,
  timer: null,
  paused: false,
  sound: true,
  vibration: true,
  user: null,
  matches: 0,
  cards: [],
  flipped: [],
  busy: false,
  progress: {}
};

// --- Splash Screen ---
window.onload = () => {
  splash.classList.remove('hidden');
  setTimeout(() => {
    splash.classList.add('hidden');
    checkAuth();
  }, 3000);
};

// --- Auth Logic ---
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('emojimatch_user'));
  if (user && user.email) {
    state.user = user;
    loadProgress();
    showGame();
  } else {
    auth.classList.remove('hidden');
  }
}

loginBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return alert('Enter email and password.');
  const user = JSON.parse(localStorage.getItem('emojimatch_user'));
  if (user && user.email === email && user.password === password) {
    state.user = user;
    loadProgress();
    auth.classList.add('hidden');
    showGame();
  } else {
    alert('Invalid credentials or user does not exist.');
  }
};

signupBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return alert('Enter email and password.');
  localStorage.setItem('emojimatch_user', JSON.stringify({email, password}));
  state.user = {email, password};
  state.progress = {};
  saveProgress();
  auth.classList.add('hidden');
  showGame();
};

// --- Progress ---
function saveProgress() {
  if (state.user) {
    state.progress.level = state.level;
    state.progress.score = state.score;
    localStorage.setItem(`emojimatch_progress_${state.user.email}`, JSON.stringify(state.progress));
  }
}
function loadProgress() {
  if (state.user) {
    const p = JSON.parse(localStorage.getItem(`emojimatch_progress_${state.user.email}`));
    if (p) {
      state.level = p.level || 1;
      state.score = p.score || 0;
    }
  }
}

// --- Game Logic ---
function showGame() {
  game.classList.remove('hidden');
  setupTopBar();
  startLevel(state.level);
}

function getGrid(level) {
  // Level 1: 2x2, Level 2: 3x2, Level 3: 3x3, ... up to 10x10
  let size = Math.min(MAX_GRID, Math.ceil(Math.sqrt(level + 1)));
  let rows = size, cols = size;
  if (level === 1) { rows = 2; cols = 2; }
  else if (level === 2) { rows = 2; cols = 3; }
  else if (level === 3) { rows = 3; cols = 3; }
  else if (level === 4) { rows = 2; cols = 4; }
  else if (level === 5) { rows = 2; cols = 5; }
  return {rows, cols};
}

function startLevel(level) {
  winPopup.classList.add('hidden');
  state.level = level;
  state.matches = 0;
  state.flipped = [];
  state.busy = false;
  updateHUD();
  const {rows, cols} = getGrid(level);
  const numCards = rows * cols;
  const numPairs = Math.floor(numCards / 2);
  let emojis = shuffle(EMOJIS).slice(0, numPairs);
  let cards = shuffle([...emojis, ...emojis]).slice(0, numCards);
  state.cards = cards.map((emoji, i) => ({
    id: i,
    emoji,
    matched: false,
    flipped: false
  }));
  renderBoard(rows, cols);
  state.timeLeft = Math.floor(numPairs * 5);
  startTimer();
}

function renderBoard(rows, cols) {
  board.innerHTML = '';
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  state.cards.forEach((card, idx) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.idx = idx;
    cardDiv.innerHTML = `
      <div class="front"></div>
      <div class="back">${card.emoji}</div>
    `;
    cardDiv.onclick = () => flipCard(idx);
    board.appendChild(cardDiv);
  });
}

function flipCard(idx) {
  if (state.busy || state.cards[idx].flipped || state.cards[idx].matched || state.paused) return;
  state.cards[idx].flipped = true;
  updateCard(idx);
  playSound('flip');
  state.flipped.push(idx);

  if (state.flipped.length === 2) {
    state.busy = true;
    setTimeout(() => checkMatch(), 700);
  }
}

function updateCard(idx) {
  const cardDiv = board.children[idx];
  if (!cardDiv) return;
  if (state.cards[idx].flipped || state.cards[idx].matched) {
    cardDiv.classList.add('flipped');
  } else {
    cardDiv.classList.remove('flipped');
  }
  if (state.cards[idx].matched) cardDiv.classList.add('matched');
}

function checkMatch() {
  const [i, j] = state.flipped;
  if (state.cards[i].emoji === state.cards[j].emoji) {
    state.cards[i].matched = true;
    state.cards[j].matched = true;
    updateCard(i); updateCard(j);
    state.matches++;
    playSound('match');
    state.score += 10 + state.timeLeft;
    updateHUD();
    if (state.matches === Math.floor(state.cards.length / 2)) {
      setTimeout(() => winLevel(), 600);
    }
  } else {
    playSound('wrong');
    if (state.vibration) vibrate();
    state.cards[i].flipped = false;
    state.cards[j].flipped = false;
    updateCard(i); updateCard(j);
  }
  state.flipped = [];
  state.busy = false;
}

function winLevel() {
  stopTimer();
  state.score += state.timeLeft * 2;
  saveProgress();
  finalScore.textContent = `Score: ${state.score} | Time Left: ${state.timeLeft}s`;
  winPopup.classList.remove('hidden');
}

restartBtn.onclick = () => {
  winPopup.classList.add('hidden');
  startLevel(state.level + 1);
};

function updateHUD() {
  levelDisplay.textContent = `Level: ${state.level}`;
  timerDisplay.textContent = `Time: ${state.timeLeft}`;
  scoreDisplay.textContent = `Score: ${state.score}`;
}

function startTimer() {
  stopTimer();
  state.timer = setInterval(() => {
    if (!state.paused) {
      state.timeLeft--;
      updateHUD();
      if (state.timeLeft <= 0) {
        stopTimer();
        alert('Time up! Try again.');
        startLevel(state.level);
      }
    }
  }, 1000);
}
function stopTimer() { clearInterval(state.timer); }

// --- Top Bar Controls ---
function setupTopBar() {
  soundBtn.textContent = state.sound ? '🔊' : '🔇';
  vibrationBtn.textContent = state.vibration ? '📳' : '📴';
  soundBtn.onclick = () => {
    state.sound = !state.sound;
    soundBtn.textContent = state.sound ? '🔊' : '🔇';
  };
  vibrationBtn.onclick = () => {
    state.vibration = !state.vibration;
    vibrationBtn.textContent = state.vibration ? '📳' : '📴';
  };
  pauseBtn.onclick = () => {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '▶️' : '⏸️';
  };
}

// --- Utility ---
function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function playSound(type) {
  if (!state.sound) return;
  // Optional: Add your own sound files and play here using new Audio('sound.mp3').play();
  // Example:
  // if(type === 'flip') new Audio('flip.mp3').play();
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(200);
    }
