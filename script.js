let level = 1;
let firstCard = null;
let lockBoard = false;

function createBoard(level) {
  const container = document.getElementById("game-container");
  container.innerHTML = "";
  let totalCards = 4 + level * 2;
  let cards = [];
  for (let i = 0; i < totalCards / 2; i++) {
    const value = String.fromCharCode(65 + i);
    cards.push(value, value);
  }
  cards = shuffle(cards);
  cards.forEach((val) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = "";
    card.dataset.value = val;
    card.addEventListener("click", flipCard);
    container.appendChild(card);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;
  this.textContent = this.dataset.value;
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
  } else {
    if (firstCard.dataset.value === this.dataset.value) {
      firstCard = null;
      checkWin();
    } else {
      lockBoard = true;
      setTimeout(() => {
        this.textContent = "";
        this.classList.remove("flipped");
        firstCard.textContent = "";
        firstCard.classList.remove("flipped");
        firstCard = null;
        lockBoard = false;
      }, 1000);
    }
  }
}

function checkWin() {
  const cards = document.querySelectorAll(".card");
  const flipped = document.querySelectorAll(".card.flipped");
  if (cards.length === flipped.length) {
    document.getElementById("win-popup").classList.add("show");
  }
}

function nextLevel() {
  level++;
  document.getElementById("win-popup").classList.remove("show");
  createBoard(level);
}

createBoard(level);
