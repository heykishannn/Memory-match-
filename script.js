const EMOJIS = [
  "🍎","🍌","🍇","🍓","🍉","🍍","🥝","🍒","🍑","🍋",
  "🥥","🥭","🍐","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
  "🌷","🌸","🌺","🌼","🐼","🦄","🍂","🍄","🌿",
  "🐥","🐤","🦜","🕊️","🦢","🦋","🍨","🍧","🍭",
  "🍬","☕","🗿","🎂","🧸","🎹","💎","🔮","🔔",
  "🦚","🪕" // Added Peacock and Banjo emojis for sound effects as per list
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

// Changed IDs for input elements for toggle switches
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');
const pauseBtn = document.getElementById('pauseBtn');

const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const audioTap = document.getElementById('audio-tap');
const audioWin = document.getElementById('audio-win');
const audioLose = document.getElementById('audio-lose');
const audioPause = document.getElementById('audio-pause');
const audioRestart = document.getElementById('audio-restart');
// New Match Sounds DOM references
const audioGwak = document.getElementById('audio-gwak');
const audioTamatar = document.getElementById('audio-tamatar');
const audioMor = document.getElementById('audio-mor');
const audioSigma = document.getElementById('audio-sigma');
const audioBirthday = document.getElementById('audio-birthday');
const audioSitar = document.getElementById('audio-sitar');
const audioBell = document.getElementById('audio-bell');
// New sound for Continue window
const audioKoni = document.getElementById('audio-koni');


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
  playingSound: null,
  // isMaxCardsReached: false, // No longer needed with fixed card/container size
  // levelCardsCapped: 0, // No longer needed
  isGameActive: true // Added for visibility change sound control
};

// Splash: 3 blank gradient cards, flip animation
function showSplash() {
  splash.classList.remove('hidden');
  home.classList.add('hidden');
  game.classList.add('hidden');
  auth.classList.add('hidden');
  splashCards.innerHTML = '';
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
    popupSound('koni'); // Play sound when continue window appears
  } else {
    state.level = 1;
    state.score = 0;
    saveProgress();
    showGame();
  }
};
// Home button clicks from any popup/screen should save data and show resume window
resumeHomeBtn.onclick = () => {
  stopAllSounds();
  resumePopup.classList.add('hidden');
  saveProgress(); // Ensure current progress is saved
  showHome();
};
watchAdResumeBtn.onclick = () => {
  window.open('https://www.profitableratecpm.com/cbqpeyncv?key=41a7ead40af57cd33ff5f4604f778cb9', '_blank');
  resumePopup.classList.add('hidden'); // Hide the resume popup
  startInGameAdTimer(() => { // Define original callback for resuming
    const progress = JSON.parse(localStorage.getItem('memorymatch_progress'));
    state.level = progress.level;
    state.score = progress.score;
    showGame(); // This was the original action
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
    let pairs;
    if (level === 1) {
        pairs = 1; // Level 1 has 1 pair (2 cards)
    } else {
        pairs = 1 + Math.floor((level - 1) / 2); // Add 1 pair every 2 levels from level 2 onwards
    }
    // Card dimensions and gaps from CSS
    const cardWidth = 120;
    const cardHeight = 120;
    const columnGap = 5; // From #board rule
    const rowGap = 12;   // From #board rule

    // Max columns based on 1080px container and card width + gap
    const maxColsPossible = Math.floor(1080 / (cardWidth + columnGap));

    // Available height for the board calculation
    const headerHeight = document.querySelector('.game-header')?.offsetHeight || 70; // Approx fallback
    const statsHeight = document.querySelector('.stats')?.offsetHeight || 30; // Approx fallback
    const bannerAdHeight = document.getElementById('bannerAdContainer')?.offsetHeight || 0; // Ad container
    // #game is min-height 100vh. Margins for #board are 24px auto auto auto.
    // Consider space taken by header, stats, ad, and some padding for the board itself within #game.
    const availableHeightForBoard = window.innerHeight - headerHeight - statsHeight - bannerAdHeight - 24 - 20; // 24px top margin of board, 20px other vertical spacing

    const estimatedCardHeightWithGap = cardHeight + rowGap;
    let maxRowsPossible = Math.floor(availableHeightForBoard / estimatedCardHeightWithGap);
    if (maxRowsPossible < 2) maxRowsPossible = 2; // Minimum 2 rows, even if they overflow vertically.

    const maxPhysicalCards = maxColsPossible * maxRowsPossible;

    // Determine total cards based on level (progression logic)
    let pairsForLevel;
    if (level === 1) {
        pairsForLevel = 1;
    } else {
        pairsForLevel = 1 + Math.floor((level - 1) / 2); // Existing progression
    }
    let totalCardsForLevel = pairsForLevel * 2;

    // Determine actual cards to display: minimum of level requirement and physical capacity
    let actualCardsToDisplay = Math.min(totalCardsForLevel, maxPhysicalCards);

    // Ensure actualCardsToDisplay is an even number
    if (actualCardsToDisplay % 2 !== 0) {
        actualCardsToDisplay--;
    }
    // Ensure at least 1 pair
    if (actualCardsToDisplay < 2) {
        actualCardsToDisplay = 2;
    }

    // Calculate columns and rows for the actual cards to display
    let cols = Math.ceil(Math.sqrt(actualCardsToDisplay));
    if (cols > maxColsPossible) {
        cols = maxColsPossible;
    }
    let rows = Math.ceil(actualCardsToDisplay / cols);
    if (rows > maxRowsPossible) {
        rows = maxRowsPossible;
    }

    // Final adjustment to actualCardsToDisplay based on calculated grid, ensuring it doesn't exceed level requirement
    actualCardsToDisplay = Math.min(totalCardsForLevel, cols * rows);
    if (actualCardsToDisplay % 2 !== 0) {
        actualCardsToDisplay--;
    }
    if (actualCardsToDisplay < 2) {
        actualCardsToDisplay = 2;
    }
    
    // Recalculate rows and cols if actualCardsToDisplay changed again (e.g. due to making it even)
    // This ensures cols is optimal for the final actualCardsToDisplay
    cols = Math.ceil(Math.sqrt(actualCardsToDisplay));
    if (cols > maxColsPossible) {
        cols = maxColsPossible;
    }
    rows = Math.ceil(actualCardsToDisplay / cols);
    // No need to check rows > maxRowsPossible again if actualCardsToDisplay was derived from a capped rows/cols product.

    return {
        rows: rows,
        cols: cols,
        actualCardsToDisplay: actualCardsToDisplay, // totalCards used by startLevel
        totalCardsForLevel: totalCardsForLevel,
        maxPhysicalCards: maxPhysicalCards
    };
}

function startLevel(level) {
  clearInterval(state.timerId);
  state.paused = false;
  pauseBtn.textContent = "||"; // Set to pause symbol
  state.flippedIndices = [];
  state.matchedCount = 0;
  state.busy = false;

  const { rows, cols, actualCardsToDisplay, totalCardsForLevel, maxPhysicalCards } = getGridSize(level);
  
  if (state.maxPhysicalCards === undefined) { // Store it once
      state.maxPhysicalCards = maxPhysicalCards;
  }

  // Set CSS variable for grid columns to make it responsive
  board.style.setProperty('--cols', cols);

  // Use actualCardsToDisplay for board setup
  const totalPairs = Math.floor(actualCardsToDisplay/2);
  let emojisForLevel = shuffle(EMOJIS).slice(0,totalPairs);
  let cardsArray = shuffle([...emojisForLevel,...emojisForLevel]);
  
  // Ensure enough emojis for larger boards if actualCardsToDisplay > EMOJIS.length
  if(cardsArray.length < actualCardsToDisplay) {
      const needed = actualCardsToDisplay - cardsArray.length;
      const additionalEmojis = shuffle(EMOJIS).slice(0, Math.ceil(needed / 2));
      cardsArray.push(...additionalEmojis, ...additionalEmojis);
      cardsArray = shuffle(cardsArray);
  }
  cardsArray = cardsArray.slice(0,actualCardsToDisplay); // Trim to exact actualCardsToDisplay

  state.cards = cardsArray.map((emoji,idx)=>({
    emoji, flipped:false, matched:false, idx
  }));
  
  board.innerHTML = '';
  state.cards.forEach((card,i)=>{
    const cardEl = document.createElement('div');
    cardEl.className = 'card'; // Removed 'cover' class
    cardEl.tabIndex = 0;
    cardEl.dataset.index = i;
    // Direct front/back children for full card flip
    cardEl.innerHTML = `
      <div class="front">${card.emoji}</div>
      <div class="back"></div>
    `;
    cardEl.addEventListener('click',()=>onCardClick(i));
    cardEl.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onCardClick(i);}
    });
    board.appendChild(cardEl);
  });
  
  // Timer calculation
  let baseTime;
  // Check if the number of cards determined by level progression exceeds what physically fits
  if (totalCardsForLevel > state.maxPhysicalCards) {
      // Screen is full, start reducing time as per new difficulty logic
      // Calculate how many "effective" levels we are past the point where cards maxed out.
      // Assuming each increment of 2 in totalCardsForLevel represents one difficulty step.
      const levelsPastMax = Math.floor((totalCardsForLevel - state.maxPhysicalCards) / 2);

      // Base time for a full screen of cards (using actualCardsToDisplay as it's capped by maxPhysicalCards here)
      const timeForMaxCards = actualCardsToDisplay * 2.5;

      baseTime = Math.max(10, timeForMaxCards - (levelsPastMax * 2)); // Reduce by 2s per level past max, min 10s
  } else {
      // Screen is not yet full, calculate time as before
      baseTime = actualCardsToDisplay * 2.5;
  }
  state.timeLeft = baseTime;
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
  cardEl.classList.add('flipped'); // Add flipped class directly to the card
}
function unflipCard(index) {
  const card = state.cards[index];
  card.flipped = false;
  const cardEl = board.children[index];
  cardEl.classList.remove('flipped'); // Remove flipped class directly from the card
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
    
    // Play specific sound for matched emoji
    playMatchSound(card1.emoji);

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
  losePopup.classList.add('hidden'); // Ensure losePopup is hidden
  winPopup.classList.remove('hidden');
}
nextLevelBtn.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  if(state.level<MAX_LEVEL) state.level++;
  else { state.level=1; state.score=0; } // Restart if MAX_LEVEL is reached
  saveProgress();
  startLevel(state.level);
};
homeBtn1.onclick = () => {
  stopAllSounds();
  winPopup.classList.add('hidden');
  // Data should not reset when clicking home button
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
  // Data should not reset when clicking home button
  saveProgress();
  showHome();
};
watchAdBtn.onclick = () => {
  window.open('https://www.profitableratecpm.com/cbqpeyncv?key=41a7ead40af57cd33ff5f4604f778cb9', '_blank');
  losePopup.classList.add('hidden'); // Hide the lose popup
  startInGameAdTimer(() => { // Define original callback for continuing after loss
    startTimer();
  });
};
function updateHUD() {
  levelDisplay.textContent = `Level: ${state.level}`;
  // Ensure time is formatted with leading zero if less than 10
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
        winPopup.classList.add('hidden'); // Ensure winPopup is hidden
        loseLevel();
      }
    }
  },1000);
}
function setupSwitches() {
  soundToggle.checked = state.soundOn;
  vibrationToggle.checked = state.vibrationOn;

  soundToggle.onchange = ()=>{ state.soundOn=soundToggle.checked; };
  vibrationToggle.onchange = ()=>{ state.vibrationOn=vibrationToggle.checked; };

  pauseBtn.onclick = ()=>{
    state.paused = !state.paused;
    // Changed text to symbols for pause/resume
    pauseBtn.textContent = state.paused ? "▶" : "||";
    popupSound(state.paused ? 'pause' : 'restart');
  };
}
function playSound(type) {
  if(!state.soundOn || !state.isGameActive) return;
  stopAllSounds();
  if(type==="tap") { audioTap.currentTime=0; audioTap.play(); state.playingSound=audioTap; }
}
function popupSound(type) {
  if(!state.soundOn || !state.isGameActive) return;
  stopAllSounds();
  if(type==="win") { audioWin.currentTime=0; audioWin.loop=false; audioWin.play(); state.playingSound=audioWin; }
  if(type==="lose") { audioLose.currentTime=0; audioLose.loop=false; audioLose.play(); state.playingSound=audioLose; }
  if(type==="pause") { audioPause.currentTime=0; audioPause.loop=false; audioPause.play(); state.playingSound=audioPause; }
  if(type==="restart") { audioRestart.currentTime=0; audioRestart.loop=false; audioRestart.play(); state.playingSound=audioRestart; }
  if(type==="koni") { audioKoni.currentTime=0; audioKoni.loop=false; audioKoni.play(); state.playingSound=audioKoni; }
}

// New function to play specific sound for matched emoji
function playMatchSound(emoji) {
  if(!state.soundOn || !state.isGameActive) return;
  stopAllSounds(); // Stop any currently playing sound

  let soundToPlay = null;
  switch(emoji) {
    case "🍌": soundToPlay = audioGwak; break;
    case "🍅": soundToPlay = audioTamatar; break;
    case "🦚": soundToPlay = audioMor; break;
    case "🗿": soundToPlay = audioSigma; break;
    case "🎂": soundToPlay = audioBirthday; break;
    case "🪕": soundToPlay = audioSitar; break;
    case "🔔": soundToPlay = audioBell; break;
    default: break; // No specific sound for other emojis
  }

  if (soundToPlay) {
    soundToPlay.currentTime = 0;
    soundToPlay.play();
    state.playingSound = soundToPlay;
  }
}

function stopAllSounds() {
  [audioTap, audioWin, audioLose, audioPause, audioRestart,
   audioGwak, audioTamatar, audioMor, audioSigma, audioBirthday, audioSitar, audioBell, audioKoni
  ].forEach(a=>{ a.pause(); a.currentTime=0; });
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

function startInGameAdTimer(callback) {
  adPopup.classList.remove('hidden');
  popupSound('pause'); // Optional: play a sound when timer starts
  let secondsLeft = 5;
  adTimer.textContent = secondsLeft;
  state.adTimeout && clearTimeout(state.adTimeout); // Clear any existing ad timeout

  function tick() {
    secondsLeft--;
    adTimer.textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearTimeout(state.adTimeout); // Use clearTimeout as we're using setTimeout for recursion
      adPopup.classList.add('hidden');
      stopAllSounds(); // Stop pause sound

      state.timeLeft += 10; // Add 10 seconds to game timer
      updateHUD(); // Update timer display

      if (callback) {
        callback(); // Execute the original game continuation logic
      }
    } else {
      state.adTimeout = setTimeout(tick, 1000);
    }
  }
  state.adTimeout = setTimeout(tick, 1000); // Start the timer
}

// function showAd(callback) {
//   // adPopup.classList.remove('hidden'); // No longer show internal popup
//   // popupSound('pause'); // No longer play internal sound
//   // let t = 5;
//   // adTimer.textContent = t;
//   // state.adTimeout && clearTimeout(state.adTimeout);
//   // function tick() {
//   //   t--;
//   //   adTimer.textContent = t;
//   //   if(t<=0) {
//   //     adPopup.classList.add('hidden');
//   //     stopAllSounds();
//   //     callback && callback(); // Execute callback
//   //   } else {
//   //     state.adTimeout = setTimeout(tick,1000);
//   //   }
//   // }
//   // state.adTimeout = setTimeout(tick,1000);
//
//   // Immediately execute the callback if provided, as ad is external.
//   // if (callback) {
//   //   callback();
//   // }
// }

// Lose/Win/Popup sound only while popup is open
[winPopup, losePopup, adPopup, resumePopup].forEach(popup => {
  if(popup) popup.addEventListener('transitionend', ()=>{ if(popup.classList.contains('hidden')) stopAllSounds(); });
});

// Init
showSplash();

// Event listener for page visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    state.isGameActive = false;
    stopAllSounds();
    // Optionally, also pause the game timer if desired
    // if (state.timerId && !state.paused) {
    //   state.paused = true; // Visually pause the game
    //   pauseBtn.textContent = "▶";
    // }
  } else {
    state.isGameActive = true;
    // Optionally, resume game timer if it was paused due to visibility
    // if (state.timerId && state.paused && pauseBtn.textContent === "▶") {
    //   // Check if it was paused by visibility, not manually by user
    //   // This part needs careful handling if you have manual pause too
    //   state.paused = false;
    //   pauseBtn.textContent = "||";
    // }
  }
});
