const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const soundToggle = document.getElementById('sound-toggle');
const vibrationToggle = document.getElementById('vibration-toggle');

const popup = document.getElementById('popup');
const losePopup = document.getElementById('lose-popup');
const nextLevelBtn = document.getElementById('next-level-btn');
const restartBtn = document.getElementById('restart-btn');
const tryAgainBtn = document.getElementById('try-again-btn');
const restartBtnLose = document.getElementById('restart-btn-lose');

let level = 1;
let score = 0;
let timer = 60;
let timerInterval;
let flippedCards = [];
let matchedCount = 0;
let soundOn = true;
let vibrationOn = true;

const cardSymbols = ['🍎', '🍌', '🍇', '🍉', '🍓', '🥝', '🍒', '🍍'];

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createCards(level) {
  let numPairs = Math.min(level + 1, cardSymbols.length);
  let cards = [];

  // Pick pairs for current level
  let selectedSymbols = cardSymbols.slice(0, numPairs);

  // Duplicate and shuffle
  cards = shuffleArray([...selectedSymbols, ...selectedSymbols]);

  return cards;
}

function setupBoard() {
  gameBoard.innerHTML = '';

  let cards = createCards(level);
  matchedCount = 0;

  // Set grid columns based on number of cards
  let cols = Math.min(4, cards.length / 2);
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  cards.forEach((symbol, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.textContent = symbol;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = '?';

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', () => flipCard(card));

    gameBoard.appendChild(card);
  });
}

function flipCard(card) {
  if (
    flippedCards.length === 2 ||
    card.classList.contains('flipped') ||
    popup.classList.contains('show') ||
    losePopup.classList.contains('show')
  ) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (soundOn) playSound('flip');

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.symbol === card2.dataset.symbol) {
    matchedCount += 2;
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
    flippedCards = [];

    if (soundOn) playSound('match');
    if (vibrationOn) navigator.vibrate(100);

    if (matchedCount === gameBoard.children.length) {
      clearInterval(timerInterval);
      showPopup();
    }
  } else {
    if (soundOn) playSound('mismatch');
    if (vibrationOn) navigator.vibrate([100, 50, 100]);

    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 60;
  timerDisplay.textContent = `Time: ${timer}`;

  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.textContent = `Time: ${timer}`;

    if (timer <= 0) {
      clearInterval(timerInterval);
      showLosePopup();
    }
  }, 1000);
}

function showPopup() {
  popup.classList.add('show');
}

function hidePopup() {
  popup.classList.remove('show');
}

function showLosePopup() {
  losePopup.classList.add('show');
}

function hideLosePopup() {
  losePopup.classList.remove('show');
}

function playSound(type) {
  // Simple beep sounds or you can load audio files
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  let oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';

  switch (type) {
    case 'flip':
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      break;
    case 'match':
      oscillator.frequency.setValueAtTime(900, audioCtx.currentTime);
      break;
    case 'mismatch':
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      break;
  }

  oscillator.connect(audioCtx.destination);
  oscillator.start();
