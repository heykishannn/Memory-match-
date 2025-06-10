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
const nextLevelBtn = document.getElementById('nextLevelBtn');
const homeBtn1 = document.getElementById('homeBtn1');
const losePopup = document.getElementById('losePopup');
const loseDesc = document.getElementById('loseDesc');
const loseHomeBtn = document.getElementById('loseHomeBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const watchAdBtn = document.getElementById('watchAdBtn');
const adPopup = document.getElementById('adPopup');
const adTimer = document.getElementById('adTimer');
const resumePopup = document.getElementById('resumePopup');
const resumeBtn = document.getElementById('resumeBtn');
const restartFrom1Btn = document.getElementById('restartFrom1Btn');

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const soundSwitch = document.getElementById('soundSwitch');
const vibrationSwitch = document.getElementById('vibrationSwitch');
const pauseSwitch = document.getElementById('pauseSwitch');
const soundIcon = document.getElementById('soundIcon');
const vibrationIcon = document.getElementById('vibrationIcon');
const pauseIcon = document.getElementById('pauseIcon');

// Sounds
const audioMatch = document.getElementById('audio-match');
const audioWin = document.getElementById('audio-win');
const audioLose = document.getElementById('audio-lose');

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
  resumeData: null,
  adTimeout: null
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
  if(type==="match") audioMatch.currentTime=0, audioMatch.play();
  if(type==="win") audioWin.currentTime=0, audioWin.play();
  if(type==="lose") audioLose.currentTime=0, audioLose.play();
}

// --- Splash Screen ---
function showSplash() {
  splash.classList.remove('hidden');
  auth.classList.add('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  resumePopup.classList.add('hidden');
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
    const progress = JSON.parse(localStorage.getItem(progressKey(savedUser.email)));
    if(progress && progress.level && progress.level > 1) {
      state.resumeData = progress;
      showResumePopup();
    } else {
      loadProgress();
      showGame();
    }
  } else {
    showAuth();
  }
}
function showAuth() {
  auth.classList.remove('hidden');
  game.classList.add('hidden');
  splash.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  resumePopup.classList.add('hidden');
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
    const progress = JSON.parse(localStorage.getItem(progressKey(email)));
    if(progress && progress.level && progress.level > 1) {
      state.resumeData = progress;
      showResumePopup();
    } else {
      loadProgress();
      showGame();
    }
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

// --- Resume Popup ---
function showResumePopup() {
  resumePopup.classList.remove('hidden');
}
resumeBtn.onclick = () => {
  resumePopup.classList.add('hidden');
  showAd(()=> {
    state.level = state.resumeData.level;
    state.score = state.resumeData.score;
    saveProgress();
    showGame();
  });
};
restartFrom1Btn.onclick = () => {
  resumePopup.classList.add('hidden');
  state.level = 1;
  state.score = 0;
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
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  resumePopup.classList.add('hidden');
  updateHUD();
  setupSwitches();
  startLevel(state.level);
}

function getGridSize(level) {
  // Level 1: 2x2, Level 2: 2x3, Level 3: 3x3, Level 4: 3x4, Level 5: 4x4, up to 10x10
  let size = Math.min(2 + Math.floor((level-1)/10), 10);
  let cols = size, rows = size;
  if(level === 1) { rows=2; cols=2; }
  else if(level === 2) { rows=2; cols=3; }
  else if(level === 3) { rows=3; cols=3; }
  else if(level === 4) { rows=3; cols=4; }
  else if(level === 5) { rows=4; cols=4; }
  return {rows,cols};
}

function getCardFontSize(cols, rows) {
  if(cols>=8 || rows>=8) return "0.8rem";
  if(cols>=6 || rows>=6) return "1rem";
  return "1.4rem";
}

function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseSwitch.checked = false;
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
  const cardFontSize = getCardFontSize(cols,rows);
  state.cards.forEach((card,i)=>{
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.tabIndex = 0;
    cardEl.dataset.index = i;
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    inner.style.fontSize = cardFontSize;
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

  state.timeLeft = Math.ceil((totalCards/2)*2.5);
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
    setTimeout(checkMatch, 550);
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
    if(state.matchedCount===Math.floor(state.cards.length/2)) setTimeout(winLevel, 500);
  } else {
    playSound('lose'); vibrate();
    setTimeout(()=>{
      unflipCard(i1); unflipCard(i2);
    }, 500);
  }
  state.flippedIndices = [];
  state.busy = false;
}

function winLevel() {
  clearInterval(state.timerId);
  state.score += state.timeLeft*2;
  saveProgress();
  updateHUD();
  playSound('win');
  winDesc.innerHTML = `Level ${state.level} complete!<br>Score: ${state.score}<br>Time left: ${state.timeLeft}s`;
  winPopup.classList.remove('hidden');
}
nextLevelBtn.onclick = () => {
  winPopup.classList.add('hidden');
  if(state.level<MAX_LEVEL) state.level++;
  else { state.level=1; state.score=0; }
  startLevel(state.level);
};
homeBtn1.onclick = () => {
  winPopup.classList.add('hidden');
  state.level = 1; state.score = 0;
  saveProgress();
  showAuth();
};

function loseLevel() {
  clearInterval(state.timerId);
  playSound('lose');
  loseDesc.innerHTML = `Level ${state.level} failed!<br>Score: ${state.score}`;
  losePopup.classList.remove('hidden');
}
loseHomeBtn.onclick = () => {
  losePopup.classList.add('hidden');
  state.level = 1; state.score = 0;
  saveProgress();
  showAuth();
};
playAgainBtn.onclick = () => {
  losePopup.classList.add('hidden');
  startLevel(state.level);
};
watchAdBtn.onclick = () => {
  losePopup.classList.add('hidden');
  showAd(()=>startLevel(state.level));
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
        loseLevel();
      }
    }
  },1000);
}
function setupSwitches() {
  soundSwitch.checked = state.soundOn;
  vibrationSwitch.checked = state.vibrationOn;
  pauseSwitch.checked = state.paused;
  soundIcon.textContent = state.soundOn ? "🔊" : "🔇";
  vibrationIcon.textContent = state.vibrationOn ? "📳" : "📴";
  pauseIcon.textContent = state.paused ? "▶️" : "⏸️";
  soundSwitch.onchange = ()=> {
    state.soundOn = soundSwitch.checked;
    soundIcon.textContent = state.soundOn ? "🔊" : "🔇";
  };
  vibrationSwitch.onchange = ()=> {
    state.vibrationOn = vibrationSwitch.checked;
    vibrationIcon.textContent = state.vibrationOn ? "📳" : "📴";
  };
  pauseSwitch.onchange = ()=> {
    state.paused = pauseSwitch.checked;
    pauseIcon.textContent = state.paused ? "▶️" : "⏸️";
  };
}

// --- Fake Ad ---
function showAd(callback) {
  adPopup.classList.remove('hidden');
  let t = 5;
  adTimer.textContent = t;
  state.adTimeout && clearTimeout(state.adTimeout);
  function tick() {
    t--;
    adTimer.textContent = t;
    if(t<=0) {
      adPopup.classList.add('hidden');
      callback && callback();
    } else {
      state.adTimeout = setTimeout(tick,1000);
    }
  }
  state.adTimeout = setTimeout(tick,1000);
}

// --- Initialization ---
showSplash();
      
