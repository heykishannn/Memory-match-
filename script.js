let level = 1;
let score = 0;
let flippedCards = [];
let lockBoard = false;
let timeLimit = 60;
let timerInterval;

const gameBoard = document.getElementById("game-board");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const popup = document.getElementById("popup");
const losePopup = document.getElementById("lose-popup");
const soundToggle = document.getElementById("soundToggle");
const vibrateToggle = document.getElementById("vibrateToggle");

const tapSound = new Audio("https://www.soundjay.com/buttons/button-16.mp3");
const winSound = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
const loseSound = new Audio("https://www.soundjay.com/button/beep-07.wav");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateCards(level) {
  let pairs = Math.min(6 + Math.floor(level / 2), 16);
  let totalCards = pairs * 2;
  let cardValues = [];

  for (let i = 0; i < pairs; i++) {
    let symbol = String.fromCodePoint(0x1F600 + i); // emojis
    cardValues.push(symbol, symbol);
  }

  return shuffle(cardValues).slice(0, totalCards);
}

function createCard(value) {
  const card = document.createElement("div");
  card.className = "card";
  const inner = document.createElement("div");
  inner.className = "card-inner";
  const front = document.createElement("div");
  front.className = "card-front";
  front.textContent = "?";
  const back = document.createElement("div");
  back.className = "card-back";
  back.textContent = value;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener("click", () => handleCardClick(card, value));
  return card;
}

function handleCardClick(card, value) {
  if (lockBoard || card.classList.contains("flipped")) return;

  if (soundToggle.checked) tapSound.play();
  if (vibrateToggle.checked) navigator.vibrate(50);

  card.classList.add("flipped");
  flippedCards.push({ card, value });

  if (flippedCards.length === 2) {
    lockBoard = true;
    const [first, second] = flippedCards;
    if (first.value === second.value) {
      score++;
      updateStatus();
      flippedCards = [];
      lockBoard = false;

      if (document.querySelectorAll(".card:not(.flipped)").length === 0) {
        clearInterval(timerInterval);
        showPopup(popup);
        if (soundToggle.checked) winSound.play();
      }
    } else {
      setTimeout(() => {
        first.card.classList.remove("flipped");
        second.card.classList.remove("flipped");
        flippedCards = [];
        lockBoard = false;
      }, 800);
    }
  }
}

function renderBoard() {
  gameBoard.innerHTML = "";
  const cards = generateCards(level);
  gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr)`;
  cards.forEach(value => {
    gameBoard.appendChild(createCard(value));
  });
}

function updateStatus() {
  levelDisplay.textContent = `Level: ${level}`;
  scoreDisplay.textContent = `Score: ${score}`;
}

function startTimer() {
  let time = timeLimit;
  timerDisplay.textContent = `Time: ${time}`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    time--;
    timerDisplay.textContent = `Time: ${time}`;
    if (time <= 0) {
      clearInterval(timerInterval);
      showPopup(losePopup);
      if (soundToggle.checked) loseSound.play();
      if (vibrateToggle.checked) navigator.vibrate([100, 100, 100]);
    }
  }, 1000);
}

function showPopup(popupEl) {
  popupEl.classList.add("show");
}

function hidePopups() {
  popup.classList.remove("show");
  losePopup.classList.remove("show");
}

document.getElementById("next-level").addEventListener("click", () => {
  level++;
  timeLimit = Math.max(30, 60 - level * 2); // shorter time as level increases
  hidePopups();
  renderBoard();
  updateStatus();
  startTimer();
});

document.getElementById("restart").addEventListener("click", () => {
  level = 1;
  score = 0;
  timeLimit = 60;
  hidePopups();
  renderBoard();
  updateStatus();
  startTimer();
});

window.addEventListener("load", () => {
  renderBoard();
  updateStatus();
  startTimer();
});
