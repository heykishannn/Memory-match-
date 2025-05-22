let level = localStorage.getItem("savedLevel") ? parseInt(localStorage.getItem("savedLevel")) : 1;
let score = 0, time = 60, timerInterval;
let flipped = [], matched = 0;
let soundOn = true;

const gameBoard = document.getElementById("game-board");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const levelEl = document.getElementById("level");
const popup = document.getElementById("popup");
const losePopup = document.getElementById("lose-popup");
const tapSound = document.getElementById("tapSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

document.getElementById("soundToggle").addEventListener("change", e => soundOn = e.target.checked);

function playSound(sound) {
  if (soundOn) sound.play();
}

function init() {
  if (localStorage.getItem("hasPlayed")) {
    const continueGame = confirm("Continue from last level?");
    if (!continueGame) level = 1;
  }
  localStorage.setItem("hasPlayed", "true");
  localStorage.setItem("savedLevel", level);
  score = 0;
  updateUI();
  startLevel();
}

function updateUI() {
  levelEl.textContent = `Level ${level}`;
  scoreEl.textContent = `Score: ${score}`;
  timerEl.textContent = `Time: ${time}s`;
}

function startLevel() {
  gameBoard.innerHTML = "";
  let totalCards = Math.min(16 + (level - 1) * 2, 36);
  let pairs = totalCards / 2;
  let emojis = "🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔".split("").slice(0, pairs);
  let cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());

  cards.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="card-inner"><div class="card-front">?</div><div class="card-back">${emoji}</div></div>`;
    card.addEventListener("click", () => handleFlip(card, emoji));
    gameBoard.appendChild(card);
  });

  flipped = [];
  matched = 0;
  time = 60;
  updateUI();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    time--;
    timerEl.textContent = `Time: ${time}s`;
    if (time <= 0) {
      clearInterval(timerInterval);
      playSound(loseSound);
      losePopup.classList.add("show");
    }
  }, 1000);
}

function handleFlip(card, emoji) {
  if (flipped.length >= 2 || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  playSound(tapSound);
  flipped.push({ card, emoji });

  if (flipped.length === 2) {
    if (flipped[0].emoji === flipped[1].emoji) {
      matched++;
      score += 10;
      flipped = [];
      updateUI();
      if (matched === gameBoard.children.length / 2) {
        clearInterval(timerInterval);
        playSound(winSound);
        document.getElementById("final-score").textContent = score;
        document.getElementById("final-time").textContent = time + "s";
        popup.classList.add("show");
      }
    } else {
      setTimeout(() => {
        flipped.forEach(f => f.card.classList.remove("flipped"));
        flipped = [];
      }, 800);
    }
  }
}

function nextLevel() {
  popup.classList.remove("show");
  level++;
  localStorage.setItem("savedLevel", level);
  startLevel();
}

function restartGame() {
  level = 1;
  localStorage.setItem("savedLevel", level);
  losePopup.classList.remove("show");
  startLevel();
}

function watchAdToContinue() {
  losePopup.classList.remove("show");

  if (typeof AdMob !== "undefined") {
    AdMob.rewardedAd.show().then(() => {
      startLevel(); // continue from same level
    });
  } else {
    alert("AdMob not available. Continuing...");
    startLevel();
  }
}

// Load on start
window.onload = () => {
  if (typeof AdMob !== "undefined") {
    AdMob.rewardedAd.load({ adUnitId: "ca-app-pub-6948714269796627/6982752841" });
    AdMob.bannerAd.show({ adUnitId: "ca-app-pub-6948714269796627/7517631973", position: "bottom" });
  }
  init();
};
