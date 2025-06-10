const EMOJIS = [
  "🍎","🍌","🍇","🍓","🍉","🍍","🥝","🍒","🍑","🍋",
  "🥥","🥭","🍐","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
  "🌷","🌸","🌺","🌼","🐼","🦄","🍂","🍄","🌿",
  "🐥","🐤","🦜","🕊️","🦢","🦋","🍨","🍧","🍭",
  "🍬","☕","🗿","🎂","🧸","🎹","💎","🔮","🔔"
];
const MAX_LEVEL = 100;

// DOM
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
const soundSwitch = document.getElementById('soundSwitch');
const vibrationSwitch = document.getElementById('vibrationSwitch');
const pauseBtn = document.getElementById('pauseBtn');
const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const audioTap = document.getElementById('audio-tap');
const audioWin = document.getElementById('audio-win');
const audioLose = document.getElementById('audio-lose');
const audioPause = document.getElementById('audio-pause');
const audioRestart = document.getElementById('audio-restart');
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
  playingSound: null
};

// Splash: 3 blank gradient cards, flip animation
function showSplash() {
  splash.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  auth.classList.add('hidden');
  splashCards.innerHTML = '';
  document.querySelector('#splash h1').style.display = 'block';
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
  localStorage.setItem('memorymatch_progress', JSON.stringify({level:1, score:0}));
  showHome();
};

// Home
function showHome() {
  auth.classList.add('hidden');
  home.classList.remove('hidden');
  game.classList.add('hidden');
}
startBtn.onclick = () => {
  const progress = JSON.parse(localStorage.getItem('memorymatch_progress'));
  if(progress && progress.level && progress.level > 1) {
    resumePopup.classList.remove('hidden');
    popupSound('restart');
  } else {
    state.level = 1;
    state.score = 0;
    saveProgress();
    showGame();
  }
};
resumeHomeBtn.onclick = () => {
  stopAllSounds();
  resumePopup.classList.add('hidden');
  showHome();
};
watchAdResumeBtn.onclick = () => {
  resumePopup.classList.add('hidden');
  showAd(() => {
    const progress = JSON.parse(localStorage.getItem('memorymatch_progress'));
    state.level = progress.level;
    state.score = progress.score;
    showGame();
  });
};
restartFrom1Btn.onclick = () => {
  stopAllSounds();
  resumePopup.classList.add('hidden');
  state.level = 1;
  state.score = 0;
  saveProgress();
  showGame();
};

// Game
function showGame() {
  home.classList.add('hidden');
  game.classList.remove('hidden');
  winPopup.classList.add('hidden');
  losePopup.classList.add('hidden');
  resumePopup.classList.add('hidden');
  updateHUD();
  setupSwitches();
  startLevel(state.level);
}
function getGridSize(level) {
  // हर 3 level पर 2 cards add (1 pair)
  let pairs = 2 + Math.floor((level-1)/3);
  let totalCards = pairs * 2;
  let cols = Math.ceil(Math.sqrt(totalCards));
  let rows = Math.ceil(totalCards / cols);
  return {rows, cols, totalCards};
}
function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseBtn.textContent = "Pause";
  state.flippedIndices = [];
  state.matchedCount = 0;
  state.busy = false;
  const {rows,cols,totalCards} = getGridSize(level);
  const totalPairs = Math.floor(totalCards/2);
  let emojisForLevel = shuffle(EMOJIS).slice(0,totalPairs);
  let cardsArray = shuffle([...emojisForLevel,...emojisForLevel]);
  if(cardsArray.length<totalCards) cardsArray.push(...shuffle(EMOJIS).slice(0,totalCards-cardsArray.length));
  cardsArray = cardsArray.slice(0,totalCards);
  state.cards = cardsArray.map((emoji,idx)=>({
    emoji, flipped:false, matched:false, idx
  }));
  board.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  board.innerHTML = '';
  state.cards.forEach((card,i)=>{
    const cardEl = document.createElement('div');
    cardEl.className = 'card cover';
    cardEl.tabIndex = 0;
    cardEl.dataset.index = i;
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="front"></div>
        <div class="back">${card.emoji}</div>
      </div>
    `;
    cardEl.addEventListener('click',()=>onCardClick(i));
    cardEl.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onCardClick(i);}
    });
    board.appendChild(cardEl);
  });
  // Timer: 4 cards = 10s, हर 2 cards पर 5s
  state.timeLeft = Math.max(10, totalCards/2*2.5);
  updateHUD();
  startTimer();
}
function onCardClick(index) {
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
  cardEl.classList.remove('cover');
  cardEl.classList.add('flipped');
}
function unflipCard(index) {
  const card = state.cards[index];
  card.flipped = false;
  const cardEl = board.children[index];
  cardEl.classList.remove('flipped');
  cardEl.classList.add('cover');
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
  popupSound('win');
  vibrate();
  state.score += state.timeLeft*2;
  saveProgress();
  updateHUD();
  resultLevel.textContent = "Level: " + state.level;
  resultScore.textContent = "Score: " + state.score;
  resultTime.textContent = "Time Left: " + Math.round(state.timeLeft) + "s";
  winPopup.classList.remove('hidden');
}
nextLevelBtn.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  if(state.level<MAX_LEVEL) state.level++;
  else { state.level=1; state.score=0; }
  saveProgress();
  startLevel(state.level);
};
homeBtn1.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  state.level = 1; state.score = 0;
  saveProgress();
  showHome();
};
function loseLevel() {
  clearInterval(state.timerId);
  popupSound('lose');
  resultLevelL.textContent = "Level: " + state.level;
  resultScoreL.textContent = "Score: " + state.score;
  resultTimeL.textContent = "Time Left: 0s";
  losePopup.classList.remove('hidden');
}
playAgainBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  startLevel(state.level);
};
loseHomeBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  state.level = 1; state.score = 0;
  saveProgress();
  showHome();
};
watchAdBtn.onclick = () => {
  stopAllSounds();
  losePopup.classList.add('hidden');
  showAd(()=>{
    // +10s reward
    state.timeLeft += 10;
    updateHUD();
    startTimer();
  });
};
function updateHUD() {
  levelDisplay.textContent = `Level: ${state.level}`;
  timerDisplay.textContent = `Time: ${state.timeLeft<10?'0'+Math.round(state.timeLeft):Math.round(state.timeLeft)}`;
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
  soundSwitch.onchange = ()=>{ state.soundOn=soundSwitch.checked; };
  vibrationSwitch.onchange = ()=>{ state.vibrationOn=vibrationSwitch.checked; };
  pauseBtn.onclick = ()=>{
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "Resume" : "Pause";
    popupSound(state.paused ? 'pause' : 'restart');
  };
}
function playSound(type) {
  if(!state.soundOn) return;
  stopAllSounds();
  if(type==="tap") { audioTap.currentTime=0; audioTap.play(); state.playingSound=audioTap; }
}
function popupSound(type) {
  stopAllSounds();
  if(!state.soundOn) return;
  if(type==="win") { audioWin.currentTime=0; audioWin.loop=false; audioWin.play(); state.playingSound=audioWin; }
  if(type==="lose") { audioLose.currentTime=0; audioLose.loop=false; audioLose.play(); state.playingSound=audioLose; }
  if(type==="pause") { audioPause.currentTime=0; audioPause.loop=false; audioPause.play(); state.playingSound=audioPause; }
  if(type==="restart") { audioRestart.currentTime=0; audioRestart.loop=false; audioRestart.play(); state.playingSound=audioRestart; }
}
function stopAllSounds() {
  [audioTap,audioWin,audioLose,audioPause,audioRestart].forEach(a=>{ a.pause(); a.currentTime=0; });
  state.playingSound = null;
}
function vibrate() {
  if(state.vibrationOn && window.navigator && window.navigator.vibrate) window.navigator.vibrate(220);
}
function saveProgress() {
  localStorage.setItem('memorymatch_progress', JSON.stringify({
    level: state.level, score: state.score
  }));
}
function shuffle(arr) {
  let a = arr.slice();
  for(let i=a.length-1;i>0;i--) {
    let j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function showAd(callback) {
  adPopup.classList.remove('hidden');
  popupSound('pause');
  let t = 5;
  adTimer.textContent = t;
  state.adTimeout && clearTimeout(state.adTimeout);
  function tick() {
    t--;
    adTimer.textContent = t;
    if(t<=0) {
      adPopup.classList.add('hidden');
      stopAllSounds();
      callback && callback();
    } else {
      state.adTimeout = setTimeout(tick,1000);
    }
  }
  state.adTimeout = setTimeout(tick,1000);
}

// Lose/Win/Popup sound only while popup is open
[winPopup, losePopup, adPopup, resumePopup].forEach(popup => {
  if(popup) popup.addEventListener('transitionend', ()=>{ if(popup.classList.contains('hidden')) stopAllSounds(); });
});

// Init
showSplash();
                      
