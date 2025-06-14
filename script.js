// ==== Memory Match Game JS ====

// EMOJIS & sound mapping
const EMOJIS = [
  "🍎", "🍌", "🍇", "🍓", "🍉", "🍍", "🥝", "🍒", "🍑", "🍋",
  "🥥", "🥭", "🍐", "🍊", "🍈", "🍏", "🥑", "🍅", "🥕", "🌽",
  "🌷", "🪷", "🌸", "🪻", "🌺", "🌼", "🐼", "🦄", "🍂", "🍄", "🌿",
  "🐥", "🐔", "🦜", "🕊️", "🦢", "🦋", "🍨", "🍧", "🍭",
  "🍬", "☕", "🗿", "🎂", "🧸", "🎹", "💎", "🔮", "🐱",
  "🦚", "🪿"
];
const MATCH_SOUNDS = {
  "🍌": "sound_gwak",
  "🍅": "sound_tamatar",
  "🗿": "sound_sigma",
  "🎂": "sound_birthday",
  "🦚": "sound_mor",
  "🐱": "sound_bell"
};

// DOM
const splash = document.getElementById('splash');
const splashCards = document.querySelector('.splash-cards');
const auth = document.getElementById('auth');
const home = document.getElementById('home');
const game = document.getElementById('game');
const backBtn = document.getElementById('backBtn');
const board = document.getElementById('board');
const signupBtn = document.getElementById('signupBtn');
const startBtn = document.getElementById('startBtn');
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');
const pauseBtn = document.getElementById('pauseBtn');
const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const winPopup = document.getElementById('winPopup');
const losePopup = document.getElementById('losePopup');
const adPopup = document.getElementById('adPopup');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const homeBtn1 = document.getElementById('homeBtn1');
const playAgainBtn = document.getElementById('playAgainBtn');
const loseHomeBtn = document.getElementById('loseHomeBtn');
const watchAdBtn = document.getElementById('watchAdBtn');
const resultLevel = document.getElementById('resultLevel');
const resultScore = document.getElementById('resultScore');
const resultTime = document.getElementById('resultTime');
const resultLevelL = document.getElementById('resultLevelL');
const resultScoreL = document.getElementById('resultScoreL');
const resultTimeL = document.getElementById('resultTimeL');

// Continue Popup
const continuePopup = document.getElementById('continuePopup');
const continueLevel1Btn = document.getElementById('continueLevel1Btn');
const continueHomeBtn = document.getElementById('continueHomeBtn');
const continueWatchAdBtn = document.getElementById('continueWatchAdBtn');
const continueResult = document.getElementById('continueResult');

// Ad Popup
const adTimer = document.getElementById('adTimer');
const adBackBtn = document.getElementById('adBackBtn');
const adReward = document.querySelector('.ad-reward');

// Audio
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const pauseSound = document.getElementById('pauseSound');
const restartSound = document.getElementById('restartSound');
const flipSound = document.getElementById('flipSound');
const sound_gwak = document.getElementById('sound_gwak');
const sound_tamatar = document.getElementById('sound_tamatar');
const sound_sigma = document.getElementById('sound_sigma');
const sound_birthday = document.getElementById('sound_birthday');
const sound_mor = document.getElementById('sound_mor');
const sound_bell = document.getElementById('sound_bell');

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
  isReturning: false,
  lastLevel: 1,
  lastScore: 0,
  lastMatchEmoji: null,
  soundWasPlayingBeforeHidden: false
};

// ==== Sound Management ====
function stopAllSounds() {
  [winSound, loseSound, pauseSound, restartSound, flipSound, sound_gwak, sound_tamatar, sound_sigma, sound_birthday, sound_mor, sound_bell].forEach(a=>{
    if (a) { a.pause(); a.currentTime = 0; }
  });
}

// ==== NAVIGATION FUNCTIONS ====

function showSplash() {
  splash.classList.remove('hidden');
  auth.classList.add('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adPopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
  splashCards.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = 'splash-card';
    splashCards.appendChild(card);
  }
  setTimeout(() => {
    splash.classList.add('hidden');
    showAuth();
  }, 2000);
}

function showAuth() {
  auth.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adPopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
}

function showHome() {
  auth.classList.add('hidden');
  home.classList.remove('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adPopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
}

function showGame() {
  auth.classList.add('hidden');
  home.classList.add('hidden');
  game.classList.remove('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  adPopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
  setupSwitches();
  startLevel(state.level);
}

// ==== BUTTON EVENTS ====

signupBtn.onclick = () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) { alert('Enter email and password'); return; }
  state.user = { email, password };
  state.level = 1;
  state.score = 0;
  saveUserData();
  showHome();
};

startBtn.onclick = () => {
  let userData = getUserData();
  if (userData && userData.email) {
    state.isReturning = true;
    state.level = userData.level || 1;
    state.score = userData.score || 0;
    state.lastLevel = state.level;
    state.lastScore = state.score;
    showContinuePopup();
  } else {
    state.isReturning = false;
    state.level = 1;
    state.score = 0;
    showGame();
  }
};

function showContinuePopup() {
  continueResult.innerHTML = `<span>Last Level: ${state.lastLevel}</span><span>Last Score: ${state.lastScore}</span>`;
  continuePopup.classList.remove('hidden');
  home.classList.add('hidden');
}

continueLevel1Btn.onclick = () => {
  continuePopup.classList.add('hidden');
  state.level = 1;
  state.score = 0;
  showGame();
};
continueHomeBtn.onclick = () => {
  continuePopup.classList.add('hidden');
  showHome();
};
continueWatchAdBtn.onclick = () => {
  continuePopup.classList.add('hidden');
  showAdPopup('continue');
};

backBtn.onclick = () => {
  clearInterval(state.timerId);
  showHome();
};

watchAdBtn.onclick = () => {
  losePopup.classList.add('hidden');
  showAdPopup('lose');
};

nextLevelBtn.onclick = () => {
  winPopup.classList.add('hidden');
  state.level++;
  showGame();
};

homeBtn1.onclick = () => {
  winPopup.classList.add('hidden');
  showHome();
};

playAgainBtn.onclick = () => {
  losePopup.classList.add('hidden');
  stopAllSounds();
  if(state.soundOn) restartSound.play();
  showGame();
};

loseHomeBtn.onclick = () => {
  losePopup.classList.add('hidden');
  showHome();
};

adBackBtn.onclick = () => {
  adPopup.classList.add('hidden');
  if (state.adContext === 'continue') {
    state.level = state.lastLevel;
    state.score = state.lastScore;
    showGame();
  } else {
    state.timeLeft += 10;
    updateHUD();
    startTimer();
  }
};

// ==== GAME CONTROLS ====

function setupSwitches() {
  soundToggle.checked = state.soundOn;
  vibrationToggle.checked = state.vibrationOn;
  soundToggle.onchange = ()=>{ state.soundOn=soundToggle.checked; };
  vibrationToggle.onchange = ()=>{ state.vibrationOn=vibrationToggle.checked; };
  pauseBtn.onclick = ()=>{
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "▶" : "||";
    stopAllSounds();
    if (!state.paused) {
      if (state.soundOn) restartSound.play();
    } else {
      if (state.soundOn) pauseSound.play();
    }
  };
}

// ==== GAME LOGIC ====

function getLevelConfig(level) {
  let pairs = 1 + Math.floor((level-1)/2);
  let totalCards = pairs * 2;
  let maxCols = window.innerWidth > 600 ? 6 : 4;
  let cols = Math.min(maxCols, totalCards);
  let rows = Math.ceil(totalCards / cols);
  let boardHeight = 0.6 * window.innerHeight;
  let cardSize = Math.min(80, Math.floor((0.95 * window.innerWidth) / cols), Math.floor(boardHeight / rows));
  let timePerCard = (cardSize < 50) ? 2 : 3;
  let time = totalCards * timePerCard;
  return { pairs, totalCards, cols, rows, cardSize, time };
}

function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseBtn.textContent = "||";
  state.flippedIndices = [];
  state.matchedCount = 0;
  state.busy = false;
  state.lastMatchEmoji = null;

  const {pairs, totalCards, cols, rows, cardSize, time} = getLevelConfig(level);
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.height = `${Math.max(rows * cardSize + (rows-1)*12, 220)}px`;

  let emojisForLevel = shuffle(EMOJIS).slice(0,pairs);
  let cardsArray = shuffle([...emojisForLevel,...emojisForLevel]).slice(0,totalCards);

  state.cards = cardsArray.map((emoji,idx)=>({
    emoji, flipped:false, matched:false, idx
  }));

  board.innerHTML = '';
  state.cards.forEach((card,i)=>{
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.tabIndex = 0;
    cardEl.dataset.index = i;
    cardEl.style.maxWidth = cardEl.style.maxHeight = cardSize+"px";
    cardEl.innerHTML = `
      <div class="front"><span class="emoji">${card.emoji}</span></div>
      <div class="back"></div>
    `;
    cardEl.addEventListener('click',()=>onCardClick(i));
    cardEl.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onCardClick(i);}
    });
    board.appendChild(cardEl);
  });

  // Emoji size responsive
  document.querySelectorAll('.emoji').forEach(el=>{
    el.style.fontSize = (Math.max(32, Math.floor(cardSize*0.7)))+"px";
    el.style.lineHeight = "1";
    el.style.display = "block";
    el.style.width = "100%";
    el.style.textAlign = "center";
  });

  state.timeLeft = time;
  updateHUD();
  startTimer();
}

function onCardClick(index) {
  if(state.busy||state.paused) return;
  const card = state.cards[index];
  if(card.flipped||card.matched) return;
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
  cardEl.classList.add('flipped');
  stopAllSounds();
  if(state.soundOn) flipSound.play();
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
  let isLastMatch = false;
  if(card1.emoji===card2.emoji) {
    card1.matched = card2.matched = true;
    board.children[i1].classList.add('matched');
    board.children[i2].classList.add('matched');
    state.matchedCount++;
    state.score += 10+state.timeLeft;
    updateHUD();
    vibrate(80);
    if(state.matchedCount===Math.floor(state.cards.length/2)) isLastMatch = true;
    stopAllSounds();
    if(state.soundOn && MATCH_SOUNDS[card1.emoji]) {
      let audio = document.getElementById(MATCH_SOUNDS[card1.emoji]);
      if(audio) { audio.currentTime = 0; audio.play(); }
      if(isLastMatch) {
        state.lastMatchEmoji = card1.emoji;
        return setTimeout(winLevel, 400);
      }
    } else if(isLastMatch) {
      state.lastMatchEmoji = null;
      setTimeout(winLevel, 400);
      return;
    }
    if(isLastMatch) setTimeout(winLevel, 400);
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
  state.score += state.timeLeft*2;
  updateHUD();
  vibrate(1000);
  resultLevel.textContent = "Level: " + state.level;
  resultScore.textContent = "Score: " + state.score;
  resultTime.textContent = "Time Left: " + Math.round(state.timeLeft) + "s";
  winPopup.classList.remove('hidden');
  // अगर last match emoji का sound play हुआ है, तो win sound नहीं बजेगा
  if(state.soundOn && (!state.lastMatchEmoji || !MATCH_SOUNDS[state.lastMatchEmoji])) {
    stopAllSounds();
    winSound.play();
  }
  saveUserData();
}
function loseLevel() {
  clearInterval(state.timerId);
  resultLevelL.textContent = "Level: " + state.level;
  resultScoreL.textContent = "Score: " + state.score;
  resultTimeL.textContent = "Time Left: 0s";
  losePopup.classList.remove('hidden');
  stopAllSounds();
  if(state.soundOn) loseSound.play();
  saveUserData();
}

// ==== AD POPUP LOGIC ====

let adCountdown = 5;
let adInterval = null;

function showAdPopup(context) {
  state.adContext = context; // 'continue' or 'lose'
  adPopup.classList.remove('hidden');
  adPopup.style.display = "flex";
  let count = adCountdown;
  adTimer.textContent = count + "s";
  adTimer.style.display = "inline";
  adBackBtn.classList.add('hidden');
  adBackBtn.disabled = true;
  adReward.style.visibility = "hidden";
  adInterval = setInterval(()=>{
    count--;
    if(count > 0) {
      adTimer.textContent = count + "s";
    } else {
      clearInterval(adInterval);
      adTimer.textContent = "";
      adBackBtn.classList.remove('hidden');
      adBackBtn.disabled = false;
      adReward.style.visibility = "visible";
    }
  },1000);
}

function updateHUD() {
  levelDisplay.textContent = `Level: ${state.level}`;
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
        loseLevel();
      }
    }
  },1000);
}

function shuffle(arr) {
  let a = arr.slice();
  for(let i=a.length-1;i>0;i--) {
    let j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function vibrate(ms) {
  if (state.vibrationOn && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

// ==== USER DATA LOCAL STORAGE ====

function saveUserData() {
  if(state.user && state.user.email) {
    let data = {
      email: state.user.email,
      level: state.level,
      score: state.score
    };
    localStorage.setItem('memorymatch_user_' + state.user.email, JSON.stringify(data));
  }
}
function getUserData() {
  let email = null;
  try {
    let lastUser = localStorage.getItem('memorymatch_user');
    if(lastUser) {
      let obj = JSON.parse(lastUser);
      email = obj.email;
    }
  } catch(e) {}
  if(email) {
    let data = localStorage.getItem('memorymatch_user_' + email);
    if(data) return JSON.parse(data);
  }
  return null;
}

// ==== INIT ====

showSplash();

// ==== Visibility Change Handler ====
function handleVisibilityChange() {
  if (document.hidden) {
    if (state.soundOn) {
      state.soundWasPlayingBeforeHidden = true;
      stopAllSounds();
    }
  } else {
    if (state.soundWasPlayingBeforeHidden) {
      state.soundWasPlayingBeforeHidden = false;
      // Sounds are event-driven, so no need to auto-resume a specific sound.
      // state.soundOn will ensure they play if toggled on.
    }
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);
