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
    let userData = getUserData(); // getUserData will now set state.user, state.level, and state.score
    if (userData && userData.email) {
      // state.user, state.level, and state.score are already set by getUserData.
      showHome(); // Go to home if user data exists
    } else {
      // If no user data, getUserData sets state.user to null.
      showAuth(); // Else, go to auth
    }
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

loginBtn.onclick = () => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password'); // Added for completeness, though not used for validation yet
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim(); // Added for completeness

  if (!email) { // Password not mandatory for login as per current plan
    alert('Please enter your email.');
    return;
  }

  let userDataString = localStorage.getItem('memorymatch_user_' + email);
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    // We'll consider the user logged in if the email exists.
    // Password is not validated as it's not stored.
    state.user = {
      email: userData.email,
      level: userData.level || 1,
      score: userData.score || 0
    };
    state.level = userData.level || 1;
    state.score = userData.score || 0;

    localStorage.setItem('memorymatch_last_user_email', email); // Save last logged in email

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
  // Save user-specific data under a key that includes their email
  localStorage.setItem('memorymatch_user_' + email, JSON.stringify({
    email: email,
    level: state.level, // or state.user.level
    score: state.score  // or state.user.score
  }));
  localStorage.setItem('memorymatch_last_user_email', email); // Save last signed up/logged in email
  showHome();
};

startBtn.onclick = () => {
  // Try to load data for the last user
  let userData = getUserData();
  if (userData && userData.email) { // Check if userData and email exist
    state.isReturning = true;
    state.level = userData.level || 1;
    state.score = userData.score || 0;
    state.lastLevel = state.level;
    state.lastScore = state.score;
    // state.user is already set by getUserData if a user was found
    showContinuePopup();
  } else {
    state.isReturning = false;
    state.user = null; // Explicitly set user to null if no last user
    state.level = 1;
    state.score = 0;
    // showGame(); // This should probably go to showAuth if no user, or handle appropriately
                       // Current flow: startBtn is on Home, implies user is somewhat authenticated or past auth.
                       // For now, if no user data, it starts a fresh game. This seems okay.
                       // Let's stick to the original logic of showing game if no user data for now.
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
  // continuePopup.classList.add('hidden'); // Keep popup until page redirects
  localStorage.setItem('adRewardContext', JSON.stringify({ type: 'startup_continue', levelToStart: state.lastLevel, scoreToStart: state.lastScore }));
  localStorage.setItem('returningFromAd', 'true');
  window.location.href = 'ad.html';
};

backBtn.onclick = () => {
  clearInterval(state.timerId);
  showHome();
};

watchAdBtn.onclick = () => {
  // losePopup.classList.add('hidden'); // Keep popup until page redirects
  localStorage.setItem('adRewardContext', JSON.stringify({ type: 'lose_continue' }));
  localStorage.setItem('returningFromAd', 'true');
  window.location.href = 'ad.html';
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
  if(state.soundOn && !document.hidden) restartSound.play();
  showGame();
};

loseHomeBtn.onclick = () => {
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
  if(state.soundOn && !document.hidden) flipSound.play();
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
    if(state.soundOn && !document.hidden && MATCH_SOUNDS[card1.emoji]) {
      let audio = document.getElementById(MATCH_SOUNDS[card1.emoji]);
      if(audio) { audio.currentTime = 0; audio.play(); } // Play is conditional on soundOn and !document.hidden
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
  if(state.soundOn && !document.hidden && (!state.lastMatchEmoji || !MATCH_SOUNDS[state.lastMatchEmoji])) {
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
  if(state.soundOn && !document.hidden) loseSound.play();
  saveUserData();
}

// ==== AD REWARD LOGIC ====
function checkAndApplyAdReward() {
  if (localStorage.getItem('returningFromAd') === 'true') {
    localStorage.removeItem('returningFromAd'); // Clear flag immediately
    const contextStr = localStorage.getItem('adRewardContext');
    if (contextStr) {
      localStorage.removeItem('adRewardContext'); // Clear context after use
      const context = JSON.parse(contextStr);

      if (context.type === 'lose_continue') {
        if (losePopup && !losePopup.classList.contains('hidden')) {
          losePopup.classList.add('hidden');
        }
        state.timeLeft = 15; // Grant 15 seconds
        state.paused = false;
        if (pauseBtn) pauseBtn.textContent = "||";
        updateHUD();
        startTimer();
        // If game screen isn't active, this relies on history.back() returning to a usable state.
        // A more robust solution might navigate explicitly to game if needed, e.g., showGame().
        // However, if losePopup was visible, game screen should be the one underneath.
      } else if (context.type === 'startup_continue') {
        if (continuePopup && !continuePopup.classList.contains('hidden')) {
          continuePopup.classList.add('hidden');
        }
        state.level = context.levelToStart;
        state.score = context.scoreToStart;
        saveUserData(); // Save this continued state
        showGame(); // Starts game with restored level/score
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

// ==== USER DATA LOCAL STORAGE ====

function saveUserData() {
  if (state.user && state.user.email) {
    let dataToSave = {
      email: state.user.email,
      level: state.level, // Ensure state.level is the source of truth for current level
      score: state.score  // Ensure state.score is the source of truth for current score
    };
    localStorage.setItem('memorymatch_user_' + state.user.email, JSON.stringify(dataToSave));
    // No need to save memorymatch_last_user_email here as it's done on login/signup
  }
}

function getUserData() {
  let lastUserEmail = localStorage.getItem('memorymatch_last_user_email');
  if (lastUserEmail) {
    let dataString = localStorage.getItem('memorymatch_user_' + lastUserEmail);
    if (dataString) {
      const parsedData = JSON.parse(dataString);
      // Initialize state.user fully, and also state.level and state.score
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
  state.user = null; // Ensure user is null if no data found
  return null;
}

// ==== INIT ====

showSplash();

// ==== Visibility Change Handler ====
function handleVisibilityChange() {
  if (document.hidden) {
    // Window is hidden
    if (state.soundOn) { // Only change state if sound was on
      state.soundWasPlayingBeforeHidden = true;
    }
    stopAllSounds();
    state.soundOn = false; // Temporarily disable sound events
  } else {
    // Window is visible again
    if (state.soundWasPlayingBeforeHidden) {
      state.soundOn = true; // Restore sound preference
      state.soundWasPlayingBeforeHidden = false; // Reset the flag
    }
    if (soundToggle) { // Ensure soundToggle exists
        soundToggle.checked = state.soundOn; // Update UI
    }
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

checkAndApplyAdReward();
