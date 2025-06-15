// ==== Memory Match Game JS ====
// (All your requested features implemented)

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
const loginBtn = document.getElementById('loginBtn');
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
const continuePopup = document.getElementById('continuePopup');
const continueLevel1Btn = document.getElementById('continueLevel1Btn');
const continueHomeBtn = document.getElementById('continueHomeBtn');
const continueWatchAdBtn = document.getElementById('continueWatchAdBtn');
const continueResult = document.getElementById('continueResult');

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
  currentPlayingAudio: null
};

// ==== SOUND MANAGEMENT ====
function stopAllSounds() {
  [winSound, loseSound, pauseSound, restartSound, flipSound, sound_gwak, sound_tamatar, sound_sigma, sound_birthday, sound_mor, sound_bell].forEach(a=>{
    if (a) { a.pause(); a.currentTime = 0; }
  });
  if (state.currentPlayingAudio) {
    state.currentPlayingAudio.pause();
    state.currentPlayingAudio.currentTime = 0;
    state.currentPlayingAudio = null;
  }
}

// ==== PAGE VISIBILITY: Stop all sounds when app is not visible ====
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAllSounds();
  }
});

// ==== NAVIGATION FUNCTIONS ====
function showSplash() {
  splash.classList.remove('hidden');
  auth.classList.add('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
  splashCards.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = 'splash-card';
    splashCards.appendChild(card);
  }
  setTimeout(() => {
    splash.classList.add('hidden');
    let userData = getUserData();
    if (userData && userData.email) {
      showHome();
    } else {
      showAuth();
    }
  }, 2000);
}
function showAuth() {
  stopAllSounds();
  auth.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
}
function showHome() {
  stopAllSounds();
  auth.classList.add('hidden');
  home.classList.remove('hidden');
  game.classList.add('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
}
function showGame() {
  stopAllSounds();
  auth.classList.add('hidden');
  home.classList.add('hidden');
  game.classList.remove('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  continuePopup.classList.add('hidden');
  setupSwitches();
  startLevel(state.level);
}

// ==== BUTTON EVENTS ====
loginBtn.onclick = () => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email) {
    alert('Please enter your email.');
    return;
  }

  let userDataString = localStorage.getItem('memorymatch_user_' + email);
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    state.user = {
      email: userData.email,
      level: userData.level || 1,
      score: userData.score || 0
    };
    state.level = userData.level || 1;
    state.score = userData.score || 0;
    localStorage.setItem('memorymatch_last_user_email', email);
    showHome();
  } else {
    alert('Login failed: User not found. Please sign up if you are a new user.');
  }
};
signupBtn.onclick = () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) { alert('Enter email and password'); return; }
  state.user = { email: email, level: 1, score: 0 };
  state.level = 1;
  state.score = 0;
  localStorage.setItem('memorymatch_user_' + email, JSON.stringify({
    email: email,
    level: state.level,
    score: state.score
  }));
  localStorage.setItem('memorymatch_last_user_email', email);
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
    state.user = null;
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
  localStorage.setItem('adRewardContext', JSON.stringify({ type: 'startup_continue', levelToStart: state.lastLevel, scoreToStart: state.lastScore }));
  localStorage.setItem('returningFromAd', 'true');
  window.location.href = 'ad.html';
};
backBtn.onclick = () => {
  clearInterval(state.timerId);
  showHome();
};
watchAdBtn.onclick = () => {
  localStorage.setItem('adRewardContext', JSON.stringify({ type: 'lose_continue', level: state.level, score: state.score }));
  localStorage.setItem('returningFromAd', 'true');
  window.location.href = 'ad.html';
};
nextLevelBtn.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  state.level++;
  showGame();
};
homeBtn1.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  showHome();
};
playAgainBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  if(state.soundOn && !document.hidden) restartSound.play();
  showGame();
};
loseHomeBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  showHome();
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
      if (state.soundOn && !document.hidden) restartSound.play();
    } else {
      if (state.soundOn && !document.hidden) pauseSound.play();
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
  stopAllSounds();
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

  // Emoji size responsive (बड़ा और fit)
  document.querySelectorAll('.emoji').forEach(el=>{
    el.style.fontSize = (Math.max(32, Math.floor(cardSize*0.8)))+"px";
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
  if(state.soundOn && !document.hidden) {
    flipSound.currentTime = 0;
    flipSound.play();
    state.currentPlayingAudio = flipSound;
  }
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
    vibrate(120); // match पर vibration
    if(state.matchedCount===Math.floor(state.cards.length/2)) isLastMatch = true;
    stopAllSounds();
    if(state.soundOn && !document.hidden && MATCH_SOUNDS[card1.emoji]) {
      let audio = document.getElementById(MATCH_SOUNDS[card1.emoji]);
      if(audio) {
        audio.currentTime = 0;
        audio.play();
        state.currentPlayingAudio = audio;
      }
      if(isLastMatch) {
        state.lastMatchEmoji = card1.emoji;
        setTimeout(winLevel, 400);
        return;
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
  vibrate(1000); // 1s vibration on win
  resultLevel.textContent = "Level: " + state.level;
  resultScore.textContent = "Score: " + state.score;
  resultTime.textContent = "Time Left: " + Math.round(state.timeLeft) + "s";
  winPopup.classList.remove('hidden');
  if(state.soundOn && !document.hidden && (!state.lastMatchEmoji || !MATCH_SOUNDS[state.lastMatchEmoji])) {
    stopAllSounds();
    winSound.currentTime = 0;
    winSound.play();
    state.currentPlayingAudio = winSound;
  }
  saveUserData();
}
function loseLevel() {
  clearInterval(state.timerId);
  resultLevelL.textContent = "Level: " + state.level;
  resultScoreL.textContent = "Score: " + state.score;
  resultTimeL.textContent = "Time Left: 0s";
  losePopup.classList.remove('hidden');
  vibrate(400); // lose पर 0.4s vibration
  stopAllSounds();
  if(state.soundOn && !document.hidden) {
    loseSound.currentTime = 0;
    loseSound.play();
    state.currentPlayingAudio = loseSound;
  }
  saveUserData();
}

// ==== AD REWARD LOGIC ====
function checkAndApplyAdReward() {
  if (localStorage.getItem('returningFromAd') === 'true') {
    localStorage.removeItem('returningFromAd');
    const contextStr = localStorage.getItem('adRewardContext');
    if (contextStr) {
      localStorage.removeItem('adRewardContext');
      const context = JSON.parse(contextStr);
      if (context.type === 'lose_continue') {
        if (losePopup && !losePopup.classList.contains('hidden')) {
          losePopup.classList.add('hidden');
        }
        state.timeLeft = 15;
        state.paused = false;
        if (pauseBtn) pauseBtn.textContent = "||";
        updateHUD();
        startTimer();
      } else if (context.type === 'startup_continue') {
        if (continuePopup && !continuePopup.classList.contains('hidden')) {
          continuePopup.classList.add('hidden');
        }
        state.level = context.levelToStart;
        state.score = context.scoreToStart;
        saveUserData();
        showGame();
      }
    }
  }
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
function saveUserData() {
  if (state.user && state.user.email) {
    let dataToSave = {
      email: state.user.email,
      level: state.level,
      score: state.score
    };
    localStorage.setItem('memorymatch_user_' + state.user.email, JSON.stringify(dataToSave));
  }
}
function getUserData() {
  let lastUserEmail = localStorage.getItem('memorymatch_last_user_email');
  if (lastUserEmail) {
    let dataString = localStorage.getItem('memorymatch_user_' + lastUserEmail);
    if (dataString) {
      const parsedData = JSON.parse(dataString);
      state.user = {
        email: parsedData.email,
        level: parsedData.level || 1,
        score: parsedData.score || 0
      };
      state.level = parsedData.level || 1;
      state.score = parsedData.score || 0;
      return parsedData;
    }
  }
  state.user = null;
  state.level = 1;
  state.score = 0;
  return null;
}

// ==== AUTO START ====
window.onload = function() {
  showSplash();
  checkAndApplyAdReward();
};
// हर बार popup बंद या next level/home पर sound बंद
function stopSoundOnPopupClose() { stopAllSounds(); }
[nextLevelBtn, homeBtn1, playAgainBtn, loseHomeBtn].forEach(btn=>{
  if(btn) btn.addEventListener('click', stopSoundOnPopupClose);
});
                         
