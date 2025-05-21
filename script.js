let level = 1;
let score = 0;
let timer;
let timeLeft = 60;
let firstCard, secondCard;
let lockBoard = false;

const emojis = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🥝', '🍍'];

const gameBoard = document.getElementById("gameBoard");
const levelDisplay = document.getElementById("level");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const restartBtn = document.getElementById("restartBtn");
const continueBtn = document.getElementById("continueBtn");

function startLevel() {
  gameBoard.innerHTML = "";
  timeLeft = 60;
  timerDisplay.textContent = timeLeft;
  let numPairs = level + 2;
  let cardsArray = [];

  for (let i = 0; i < numPairs; i++) {
    const emoji = emojis[i % emojis.length];
    cardsArray.push(emoji, emoji);
  }

  cardsArray = shuffle(cardsArray);

  cardsArray.forEach((emoji) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.textContent = "?";
    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  });

  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;

  this.textContent = this.dataset.emoji;
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  checkMatch();
}

function checkMatch() {
  lockBoard = true;
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    score += 10;
    scoreDisplay.textContent = score;
    resetCards();
    checkWin();
  } else {
    setTimeout(() => {
      firstCard.textContent = "?";
      secondCard.textContent = "?";
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetCards();
    }, 1000);
  }
}

function resetCards() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function checkWin() {
  const allCards = document.querySelectorAll(".card");
  const flippedCards = document.querySelectorAll(".flipped");
  if (allCards.length === flippedCards.length) {
    clearInterval(timer);
    popupText.textContent = `Level ${level} Completed!`;
    popup.classList.add("show");
  }
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = timeLeft;
  if (timeLeft === 0) {
    clearInterval(timer);
    popupText.textContent = "Time's up!";
    popup.classList.add("show");
  }
}

restartBtn.addEventListener("click", () => {
  popup.classList.remove("show");
  level = 1;
  score = 0;
  levelDisplay.textContent = level;
  scoreDisplay.textContent = score;
  startLevel();
});

continueBtn.addEventListener("click", () => {
  popup.classList.remove("show");
  AdMob.rewarded.prepare(() => {
    AdMob.rewarded.show(() => {
      level++;
      levelDisplay.textContent = level;
      startLevel();
    });
  });
});

startLevel();
