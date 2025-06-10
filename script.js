// --- Emoji Set ---
const EMOJIS = [
  "🍎","🍌","🍇","🍓","🍉","🍍","🥝","🍒","🍑","🍋",
  "🥥","🥭","🍐","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
  "🌷","🌸","🌺","🌼","🐼","🦄","🌺","🍂","🍄","🌿",
  "🐥","🐤","🦜","🕊️","🦢","🦋","🍨","🍧","🍭",
  "🍬","☕","🗿","🛕","🎂","🧸","🎹","💎","🔮","🔔"
];
const MAX_LEVEL = 100;

// DOM
const splash = document.getElementById('splash');
const animCards = splash.querySelector('.anim-cards');
const auth = document.getElementById('auth');
const game = document.getElementById('game');
const board = document.getElementById('board');
const winPopup = document.getElementById('winPopup');
const winDesc = document.getElementById('winDesc');
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

// State
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
};

// --- Splash Animation Cards ---
function createSplashAnimCards() {
  const emojis = shuffle(EMOJIS).slice(0, 6);
  animCards.innerHTML = '';
  for(let i=0;i<12;i++) {
    const card = document.createElement('div');
    card.className = 'anim-card';
    const inner = document.createElement('div');
    inner.className = 'anim-card-inner';
    inner.style.animationDelay = (i%2===0?'0s':'1s');
    inner.textContent = emojis[i%emojis.length];
    card.appendChild(inner);
    animCards.appendChild(card);
  }
}

// --- LocalStorage Keys ---
function userKey(email) { return `memorymatch_user_${email}`; }
function progressKey(email) { return `memorymatch_progress_${email}`; }

// --- Utility ---
function shuffle(arr) {
  let a = arr.slice();
  for(let i=a.length-1;i>0;i--) {
    let j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function formatTime(seconds) {
  return seconds<10?`0${seconds}`:seconds;
}
function vibrate() {
  if(state.vibrationOn && navigator.vibrate) navigator.vibrate(200);
}
function playSound(type) {
  if(!state.soundOn) return;
  // Optionally add sound here
}

// --- Splash Screen ---
function showSplash() {
  splash.classList.remove('hidden');
  auth.classList.add('hidden');
  game.classList.add('hidden');
  createSplashAnimCards();
  setTimeout(() => {
    splash.classList.add('hidden');
    checkLogin();
  }, 3000);
}

// --- Auth ---
function checkLogin() {
  const savedUser = JSON.parse(localStorage.getItem('memorymatch_current_user'));
  if(savedUser && savedUser.email) {
    state.user = savedUser;
    loadProgress();
    showGame();
  } else {
    showAuth();
  }
}
function showAuth() {
  auth.classList.remove('hidden');
  game.classList.add('hidden');
  splash.classList.add('hidden');
  emailInput.value = '';
  passwordInput.value = '';
}
loginBtn.onclick = () => {
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  if(!email || !password) { alert('Please enter email and password.'); return; }
  const userData = JSON.parse(localStorage.getItem(userKey(email)));
  if(userData && userData.password === password) {
    state.user = {email,password};
    localStorage.setItem('memorymatch_current_user', JSON.stringify(state.user));
    loadProgress();
    showGame();
  } else {
    alert('Invalid credentials or user does not exist.');
  }
};
signupBtn.onclick = () => {
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  if(!email || !password) { alert('Please enter email and password.'); return; }
  if(localStorage.getItem(userKey(email))) {
    alert('User already exists. Please login.');
    return;
  }
  localStorage.setItem(userKey(email), JSON.stringify({email,password}));
  state.user = {email,password};
  localStorage.setItem('memorymatch_current_user', JSON.stringify(state.user));
  state.level = 1; state.score = 0;
  saveProgress();
  showGame();
};

// --- Progress ---
function saveProgress() {
  if(state.user) {
    localStorage.setItem(progressKey(state.user.email), JSON.stringify({
      level: state.level, score: state.score
    }));
  }
}
function loadProgress() {
  if(state.user) {
    const p = JSON.parse(localStorage.getItem(progressKey(state.user.email)));
    if(p) {
      state.level = p.level||1;
      state.score = p.score||0;
    } else { state.level=1; state.score=0; }
  }
}

// --- Game ---
function showGame() {
  auth.classList.add('hidden');
  splash.classList.add('hidden');
  game.classList.remove('hidden');
  updateHUD();
  setupControls();
  startLevel(state.level);
}

function getGridSize(level) {
  // Increase grid: 2x2, 2x3, 3x4, 4x4, 4x5, 5x6, ... up to 10x10
  let size = Math.min(2 + Math.floor((level-1)/10), 10);
  let cols = size, rows = size;
  // For first few levels, use rectangular grids for more gradual difficulty
  if(level <= 2) { rows=2; cols=2+level-1; }
  else if(level <= 5) { rows=2+level-2; cols=3+level-2; }
  return {rows,cols};
}

function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseBtn.textContent = '⏸️';
  state.flippedIndices = [];
  state.matchedCount = 0;
  state.busy = false;

  const {rows,cols} = getGridSize(level);
  const totalCards = rows*cols;
  const totalPairs = Math.floor(totalCards/2);

  let emojisForLevel = shuffle(EMOJIS).slice(0,totalPairs);
  let cardsArray = shuffle([...emojisForLevel,...emojisForLevel]);
  if(cardsArray.length<totalCards) cardsArray.push(...shuffle(EMOJIS).slice(0,totalCards-cardsArray.length));
  cardsArray = cardsArray.slice(0,totalCards);

  state.cards = cardsArray.map((emoji,idx)=>({
    emoji, flipped:false, matched:false, idx
  }));

  board.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  board.style.gridTemplateRows = `repeat(${rows},1fr)`;
  board.innerHTML = '';
  state.cards.forEach((card,i)=>{
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.tabIndex = 0;
    cardEl.dataset.index = i;
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    const front = document.createElement('div');
    front.className = 'front';
    front.textContent = '❓';
    const back = document.createElement('div');
    back.className = 'back';
    back.textContent = card.emoji;
    inner.appendChild(front); inner.appendChild(back);
    cardEl.appendChild(inner);
    cardEl.addEventListener('click',()=>onCardClick(i));
    cardEl.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onCardClick(i);}
    });
    board.appendChild(cardEl);
  });

  state.timeLeft = totalPairs*5;
  updateHUD();
  startTimer();
}

function onCardClick(index) {
  if(state.busy||state.paused) return;
  const card = state.cards[index];
  if(card.flipped||card.matched) return;
  flipCard(index); playSound('flip');
  state.flippedIndices.push(index);
  if(state.flippedIndices.length===2) {
    state.busy = true;
    setTimeout(checkMatch, 700);
  }
}

function flipCard(index) {
  const card = state.cards[index];
  card.flipped = true;
  const cardEl = board.children[index];
  cardEl.classList.add('flipped');
}
function unflipCard(index) {
  const card = state.cards[index];
  card.flipped = false;
  const cardEl = board.children[index];
  cardEl.classList.remove('flipped');
}
function checkMatch() {
  const [i1,i2] = state.flippedIndices;
  const card1 = state.cards[i1], card2 = state.cards[i2];
  if(card1.emoji===card2.emoji) {
    card1.matched = card2.matched = true;
    state.matchedCount++;
    playSound('match');
    state.score += 10+state.timeLeft;
    board.children[i1].classList.add('matched');
    board.children[i2].classList.add('matched');
    updateHUD();
    if(state.matchedCount===Math.floor(state.cards.length/2)) setTimeout(winLevel, 600);
  } else {
    playSound('wrong'); vibrate();
    setTimeout(()=>{
      unflipCard(i1); unflipCard(i2);
    }, 700);
  }
  state.flippedIndices = [];
  state.busy = false;
}

function winLevel() {
  clearInterval(state.timerId);
  state.score += state.timeLeft*2;
  saveProgress();
  updateHUD();
  winDesc.textContent = `Level ${state.level} complete!\nScore: ${state.score}\nTime left: ${state.timeLeft}s`;
  winPopup.classList.remove('hidden');
}
restartBtn.onclick = () => {
  winPopup.classList.add('hidden');
  if(state.level<MAX_LEVEL) state.level++;
  else { state.level=1; state.score=0; }
  startLevel(state.level);
};

function updateHUD() {
  levelDisplay.textContent = `Level: ${state.level}/${MAX_LEVEL}`;
  timerDisplay.textContent = `Time: ${formatTime(state.timeLeft)}`;
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
        alert('Time is up! Restarting level.');
        startLevel(state.level);
      }
    }
  },1000);
}
function setupControls() {
  soundBtn.textContent = state.soundOn?'🔊':'🔇';
  vibrationBtn.textContent = state.vibrationOn?'📳':'📴';
  pauseBtn.textContent = state.paused?'▶️':'⏸️';
  soundBtn.onclick = ()=>{ state.soundOn=!state.soundOn; soundBtn.textContent=state.soundOn?'🔊':'🔇'; };
  vibrationBtn.onclick = ()=>{ state.vibrationOn=!state.vibrationOn; vibrationBtn.textContent=state.vibrationOn?'📳':'📴'; };
  pauseBtn.onclick = ()=>{ state.paused=!state.paused; pauseBtn.textContent=state.paused?'▶️':'⏸️'; };
}

// --- Initialization ---
showSplash();
