(() => {
  'use strict';

  const MAX_LEVEL = 50;
  const MIN_TIME = 20;
  const MAX_TIME = 60;

  const gameBoard = document.getElementById('game-board');
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const levelEl = document.getElementById('level');
  const popup = document.getElementById('popup');
  const popupScore = document.getElementById('popup-score');
  const popupTime = document.getElementById('popup-time');
  const nextLevelBtn = document.getElementById('next-level-btn');
  const losePopup = document.getElementById('lose-popup');
  const restartBtn = document.getElementById('restart-btn');
  const continueBtn = document.getElementById('continue-btn');

  const soundToggleInput = document.getElementById('sound-toggle');
  const vibrationToggleInput = document.getElementById('vibration-toggle');

  const soundTap = document.getElementById('sound-tap');
  const soundWin = document.getElementById('sound-win');
  const soundLose = document.getElementById('sound-lose');
  const soundCelebration = document.getElementById('sound-celebration');

  let level = 1;
  let score = 0;
  let timeLeft = MAX_TIME;
  let timerInterval = null;
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let totalPairs = 0;
  let startTime = 0;

  let soundOn = true;
  let vibrationOn = true;

  const cardSymbols = [
    "🍎","🍌","🍇","🍉","🍒","🍓","🍍","🥝","🥥","🍑",
    "🥭","🍐","🍋","🍊","🍈","🍏","🥑","🍅","🥕","🌽",
    "🍔","🍕","🌭","🍿","🍩","🍪","🎂","🍰","🍫","🍬",
    "🍭","☕","🍵","🥤","🍺","🍷","🥂","🍾","🍸","🍹",
    "🎲","🃏","🎯","🎳","🎮","🚗","✈️","🚀","🚲","🏀"
  ];

  function shuffleArray(array) {
    for(let i = array.length -1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function getCardsCount(level) {
    let pairs = Math.min(2 + Math.floor(level / 5), 10);
    return pairs * 2;
  }

  function getTimeForLevel(level) {
    let time = MAX_TIME - (level - 1) * 0.8;
    return Math.max(time, MIN_TIME);
  }

  function saveGame() {
    localStorage.setItem('memoryMatchLevel', level);
    localStorage.setItem('memoryMatchScore', score);
    localStorage.setItem('memoryMatchSound', soundOn ? '1' : '0');
    localStorage.setItem('memoryMatchVibration', vibrationOn ? '1' : '0');
  }
  function loadGame() {
    const savedLevel = parseInt(localStorage.getItem('memoryMatchLevel'));
    const savedScore = parseInt(localStorage.getItem('memoryMatchScore'));
    const savedSound = localStorage.getItem('memoryMatchSound');
    const savedVibration = localStorage.getItem('memoryMatchVibration');
    if(!isNaN(savedLevel) && !isNaN(savedScore)) {
      level = savedLevel;
      score = savedScore;
      soundOn = savedSound === '1';
      vibrationOn = savedVibration === '1';
      soundToggleInput.checked = soundOn;
      vibrationToggleInput.checked = vibrationOn;
      return true;
    }
    return false;
  }
  function clearGameSave() {
    localStorage.removeItem('memoryMatchLevel');
    localStorage.removeItem('memoryMatchScore');
    localStorage.removeItem('memoryMatchSound');
    localStorage.removeItem('memoryMatchVibration');
  }

  function vibrate(pattern = 200) {
    if(vibrationOn && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  function playSound(audioElement) {
    if(soundOn) {
      audioElement.currentTime = 0;
      audioElement.play();
    }
  }

  soundToggleInput.addEventListener('change', () => {
    soundOn = soundToggleInput.checked;
    saveGame();
  });
  vibrationToggleInput.addEventListener('change', () => {
    vibrationOn = vibrationToggleInput.checked;
    saveGame();
  });

  function renderCards() {
    gameBoard.innerHTML = '';

    const cardsCount = getCardsCount(level);
    totalPairs = cardsCount / 2;

    const selectedSymbols = shuffleArray(cardSymbols.slice()).slice(0, totalPairs);
    const cardValues = shuffleArray([...selectedSymbols, ...selectedSymbols]);

    let cols = Math.floor(Math.sqrt(cardsCount));
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    cardValues.forEach(symbol => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.setAttribute('data-symbol', symbol);
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Card');
      card.setAttribute('role', 'button');

      const cardInner = document.createElement('div');
      cardInner.classList.add('card-inner');

      const cardFront = document.createElement('div');
      cardFront.classList.add('card-front');
      cardFront.textContent = '?';

      const cardBack = document.createElement('div');
      cardBack.classList.add('card-back');
      cardBack.textContent = symbol;

      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      card.appendChild(cardInner);

      card.addEventListener('click', () => onCardClick(card));
      card.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(card);
        }
      });

      gameBoard.appendChild(card);
    });
  }

  function onCardClick(card) {
    if(lockBoard) return;
    if(card.classList.contains('flipped')) return;
    playSound(soundTap);

    card.classList.add('flipped');

    if(!firstCard) {
      firstCard = card;
      if(!timerInterval) startTimer();
      return;
    }

    secondCard = card;
    lockBoard = true;

    checkForMatch();
  }

  function checkForMatch() {
    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
    if(isMatch) {
      matchedPairs++;
      score += 10;
      updateScore();

      firstCard.removeEventListener('click', onCardClick);
      secondCard.removeEventListener('click', onCardClick);

      vibrate([100, 50, 100]);
      playSound(soundWin);

      resetTurn();

      if(matchedPairs === totalPairs) {
        winLevel();
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetTurn();
      }, 1000);
    }
  }

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
    saveGame();
  }

  function updateLevel() {
    levelEl.textContent = `Level ${level}`;
  }

  function startTimer() {
    timeLeft = Math.floor(getTimeForLevel(level));
    timerEl.textContent = `Time: ${timeLeft}s`;
    startTime = Date.now();

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `Time: ${timeLeft}s`;
      if(timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        loseLevel();
      }
    }, 1000);
  }
  function stopTimer() {
    if(timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function winLevel() {
    stopTimer();
    playSound(soundCelebration);
    vibrate([200, 100, 200]);
    matchedPairs = 0;

    popupScore.textContent = score;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    popupTime.textContent = timeTaken;

    popup.setAttribute('aria-hidden', 'false');
    popup.classList.add('show');
  }

  function loseLevel() {
    playSound(soundLose);
    matchedPairs = 0;
    lockBoard = true;

    losePopup.style.display = 'block';
    losePopup.setAttribute('aria-hidden', 'false');
    losePopup.classList.add('show');
  }

  nextLevelBtn.addEventListener('click', () => {
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden', 'true');
    level++;
    if(level > MAX_LEVEL) {
      alert("आपने सभी लेवल पूरे कर लिए हैं! गेम रीसेट होगा।");
      level = 1;
      score = 0;
      clearGameSave();
    }
    updateLevel();
    updateScore();
    resetGame();
  });

  restartBtn.addEventListener('click', () => {
    losePopup.classList.remove('show');
    losePopup.setAttribute('aria-hidden', 'true');
    losePopup.style.display = 'none';
    level = 1;
    score = 0;
    updateLevel();
    updateScore();
    resetGame();
  });

  continueBtn.addEventListener('click', () => {
    losePopup.classList.remove('show');
    losePopup.setAttribute('aria-hidden', 'true');
    losePopup.style.display = 'none';

    showRewardedAd().then(() => {
      timeLeft = 15;
      timerEl.textContent = `Time: ${timeLeft}s`;
      lockBoard = false;
      startTimer();
    }).catch(() => {
      level = 1;
      score = 0;
      updateLevel();
      updateScore();
      resetGame();
    });
  });

  function resetGame() {
    stopTimer();
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    renderCards();
  }

  function showRewardedAd() {
    return new Promise((resolve, reject) => {
      // AdMob rewarded ad placeholder ID: ca-app-pub-6948714269796627/6982752841
      // Replace this confirm with actual ad integration
      const watched = confirm("Watch rewarded ad to continue?");
      if(watched) resolve();
      else reject();
    });
  }

  window.addEventListener('load', () => {
    const hasSave = loadGame();
    updateLevel();
    updateScore();
    if(hasSave) {
      if(confirm("आपका पिछला गेम मिला। जारी रखना चाहते हैं? (Continue के लिए Ad देखें)")) {
        showRewardedAd().then(() => {
          resetGame();
        }).catch(() => {
          level = 1;
          score = 0;
          updateLevel();
          updateScore();
          resetGame();
        });
      } else {
        level = 1;
        score = 0;
        updateLevel();
        updateScore();
        resetGame();
      }
    } else {
      resetGame();
    }
  });
})();
        
