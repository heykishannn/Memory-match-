// script.js let level = 1; let score = 0; let timer; let timeLeft = 60; let flipped = []; let matched = 0; let isBusy = false; let soundOn = true; let vibrateOn = true; const soundToggle = document.getElementById("sound-toggle"); const vibrateToggle = document.getElementById("vibrate-toggle");

const tapSound = new Audio("assets/tap.mp3"); const winSound = new Audio("assets/win.mp3"); const loseSound = new Audio("assets/lose.mp3");

document.addEventListener("DOMContentLoaded", () => { soundToggle.addEventListener("change", () => (soundOn = soundToggle.checked)); vibrateToggle.addEventListener("change", () => (vibrateOn = vibrateToggle.checked));

document.getElementById("next-btn").onclick = () => { level++; hidePopup("popup"); startLevel(); };

document.getElementById("restart-btn").onclick = () => { level = 1; score = 0; hidePopup("lose-popup"); startLevel(); };

document.getElementById("continue-btn").onclick = () => { showRewardedAd(() => { hidePopup("lose-popup"); startLevel(); }); };

document.getElementById("resume-btn").onclick = () => { showRewardedAd(() => { hidePopup("start-popup"); level = parseInt(localStorage.getItem("level")) || 1; score = parseInt(localStorage.getItem("score")) || 0; startLevel(); }); };

document.getElementById("startover-btn").onclick = () => { hidePopup("start-popup"); level = 1; score = 0; startLevel(); };

if (localStorage.getItem("level")) { showPopup("start-popup"); } else { startLevel(); } });

function startLevel() { document.getElementById("level").textContent = Level ${level}; document.getElementById("score").textContent = Score: ${score}; timeLeft = 60; updateTimer(); if (timer) clearInterval(timer); timer = setInterval(() => { timeLeft--; updateTimer(); if (timeLeft <= 0) loseGame(); }, 1000); matched = 0; flipped = []; generateBoard(); localStorage.setItem("level", level); localStorage.setItem("score", score); }

function updateTimer() { document.getElementById("timer").textContent = Time: ${timeLeft}; }

function generateBoard() { const board = document.getElementById("game-board"); board.innerHTML = ""; let size = Math.min(4 + Math.floor(level / 5), 6); board.style.gridTemplateColumns = repeat(${size}, 1fr); const total = (size * size) % 2 === 0 ? size * size : size * size - 1; const values = []; for (let i = 0; i < total / 2; i++) { const val = String.fromCharCode(65 + (i % 26)); values.push(val, val); } shuffle(values); values.forEach(val => { const card = createCard(val); board.appendChild(card); }); }

function createCard(value) { const card = document.createElement("div"); card.classList.add("card"); card.innerHTML = <div class="card-inner"> <div class="card-front">?</div> <div class="card-back">${value}</div> </div>; card.dataset.value = value; card.onclick = () => { if (isBusy || card.classList.contains("flipped") || flipped.length === 2) return; card.classList.add("flipped"); playTap(); flipped.push(card); if (flipped.length === 2) checkMatch(); }; return card; }

function checkMatch() { isBusy = true; const [a, b] = flipped; if (a.dataset.value === b.dataset.value) { matched++; score += 10; flipped = []; isBusy = false; if (matched * 2 === document.querySelectorAll(".card").length) winGame(); } else { setTimeout(() => { a.classList.remove("flipped"); b.classList.remove("flipped"); flipped = []; isBusy = false; }, 800); } }

function winGame() { clearInterval(timer); playWin(); showPopup("popup"); }

function loseGame() { clearInterval(timer); playLose(); showPopup("lose-popup"); }

function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }

function showPopup(id) { document.getElementById(id).classList.add("show"); }

function hidePopup(id) { document.getElementById(id).classList.remove("show"); }

function playTap() { if (soundOn) tapSound.play(); if (vibrateOn && navigator.vibrate) navigator.vibrate(100); } function playWin() { if (soundOn) winSound.play(); } function playLose() { if (soundOn) loseSound.play(); }

function showRewardedAd(callback) { alert("Simulating Rewarded Ad..."); setTimeout(() => callback(), 2000); // Replace with actual AdMob rewarded ad logic }

  
