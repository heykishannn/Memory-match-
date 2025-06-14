document.addEventListener('DOMContentLoaded', () => {
    // Screens and Popups
    const splashScreen = document.getElementById('splash-screen');
    const gameScreen = document.getElementById('game-screen');
    const continuePopup = document.getElementById('continue-popup');
    const winPopup = document.getElementById('win-popup');
    const losePopup = document.getElementById('lose-popup');
    const rewardedAdScreen = document.getElementById('rewarded-ad-screen');

    // Buttons
    const continueYesBtn = document.getElementById('continue-yes');
    const continueNoBtn = document.getElementById('continue-no');
    const nextLevelBtn = document.getElementById('next-level');
    const playAgainLoseBtn = document.getElementById('play-again-lose');
    const watchAdContinueBtn = document.getElementById('watch-ad-continue');
    const adBackBtn = document.getElementById('ad-back-button');

    // Game Elements
    const levelDisplay = document.getElementById('level');
    const timerDisplay = document.getElementById('timer');
    const gameBoard = document.getElementById('game-board');

    // Ad Screen Elements
    const adTimerDisplay = document.getElementById('ad-timer');
    const adRewardGuaranteed = document.getElementById('ad-reward-guaranteed');

    // Game State Variables
    let currentLevel = 1;
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let gameTimerInterval = null;
    let timeLeft = 0;
    let lockBoard = false;
    const MAX_LEVEL = 100;
    let adCountdownInterval = null;


    const cardEmojis = ['🍎', '🍌', '🍒', '🍇', '🍓', '🍉', '🍍', '🥝', '🥭', '🍑', '🥥', '🍋', '🍊', '🍈', '🍐', '🍅', '🍆', '🌽', '🥕', '🌶️', '🍄', '🥦', '🥑', '🥒', '🥬', '🍞', '🥐', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '핫도그', '샌드위치', '타코', '부리토', '샐러드', '팝콘', '버터', '소금', '사탕', '막대사탕', '초콜릿 바', '아이스크림', '도넛', '쿠키', '케이크', '컵케이크', '파이', '푸딩', '아이스크림', '음료수', '주스', '우유', '커피', '차', '샴페인', '와인', '맥주', '위스키'];
    const SAVED_LEVEL_KEY = 'memoryMatch_currentLevel';

    // --- SOUND PLACEHOLDER FUNCTIONS ---
    function playSound(soundName) {
        console.log(`Placeholder: Play sound - ${soundName}`);
    }

    // --- VIBRATION FUNCTIONS ---
    function vibrateShort() {
        if (navigator.vibrate) navigator.vibrate(50);
    }

    function vibrateGameOver() {
        if (navigator.vibrate) navigator.vibrate([200, 50, 200]);
    }

    // --- UTILITY FUNCTIONS ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getNumPairsForLevel(level) {
        return Math.floor((level - 1) / 2) + 1;
    }

    function getCardContentForLevel(level) {
        const numPairs = getNumPairsForLevel(level);
        totalPairs = numPairs;

        if (numPairs > cardEmojis.length) {
            let extendedEmojis = [...cardEmojis];
            while (extendedEmojis.length < numPairs) {
                extendedEmojis = extendedEmojis.concat(cardEmojis);
            }
            const availableEmojis = shuffleArray(extendedEmojis);
            const levelEmojis = availableEmojis.slice(0, numPairs);
            const gameCards = [...levelEmojis, ...levelEmojis];
            return shuffleArray(gameCards);
        } else {
            const availableEmojis = shuffleArray([...cardEmojis]);
            const levelEmojis = availableEmojis.slice(0, numPairs);
            const gameCards = [...levelEmojis, ...levelEmojis];
            return shuffleArray(gameCards);
        }
    }

    // --- TIMER FUNCTIONS ---
    function getDurationForLevel(level) {
        const numPairs = getNumPairsForLevel(level);
        let duration = 10 + numPairs * 5;
        if (numPairs <= 2) duration = Math.max(15, 10 + numPairs * 4);
        if (numPairs > 10) duration = 10 + numPairs * 6;
        return Math.min(duration, 180);
    }

    function startTimer() {
        clearInterval(gameTimerInterval);
        timeLeft = getDurationForLevel(currentLevel);
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        gameTimerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(gameTimerInterval);
                if (!winPopup.classList.contains('active') && !losePopup.classList.contains('active')) {
                    endLevel(false);
                }
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }

    // --- SCREEN MANAGEMENT ---
    function showScreen(screenElement) {
        [splashScreen, gameScreen, rewardedAdScreen].forEach(s => s.classList.remove('active'));
        [continuePopup, winPopup, losePopup].forEach(p => p.classList.remove('active'));
        if (screenElement) screenElement.classList.add('active');
    }

    function showPopup(popupElement) {
        if (popupElement) popupElement.classList.add('active');
    }

    function hidePopup(popupElement) {
        if (popupElement) popupElement.classList.remove('active');
    }

    // --- LOCALSTORAGE ---
    function saveLevel(level) {
        localStorage.setItem(SAVED_LEVEL_KEY, level.toString());
    }

    function getSavedLevel() {
        const savedLevel = localStorage.getItem(SAVED_LEVEL_KEY);
        return savedLevel ? parseInt(savedLevel, 10) : null;
    }

    function clearSavedLevel() {
        localStorage.removeItem(SAVED_LEVEL_KEY);
    }

    // --- GAME BOARD ---
    function createGameBoard() {
        gameBoard.innerHTML = '';
        matchedPairs = 0;
        flippedCards = [];
        lockBoard = false;
        const cardValues = getCardContentForLevel(currentLevel);
        let columns = 2;
        if (cardValues.length > 4) columns = 3;
        if (cardValues.length > 6) columns = 4;
        if (cardValues.length > 12) columns = 4;
        if (cardValues.length > 16) columns = 5;
        if (cardValues.length > 20) columns = 5;
        if (cardValues.length > 25) columns = 6;
        gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        cardValues.forEach(value => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.value = value;
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-face', 'card-front');
            cardFront.textContent = value;
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-face', 'card-back');
            cardElement.appendChild(cardFront);
            cardElement.appendChild(cardBack);
            cardElement.addEventListener('click', () => handleCardClick(cardElement));
            gameBoard.appendChild(cardElement);
        });
        cards = document.querySelectorAll('.card');
    }

    function handleCardClick(clickedCard) {
        if (lockBoard || timeLeft <= 0) return;
        if (clickedCard.classList.contains('is-flipped') || clickedCard.classList.contains('is-matched')) {
            return;
        }
        playSound('tap');
        vibrateShort();
        clickedCard.classList.add('is-flipped');
        flippedCards.push(clickedCard);
        if (flippedCards.length === 2) {
            lockBoard = true;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.value === card2.dataset.value) {
            card1.classList.add('is-matched');
            card2.classList.add('is-matched');
            matchedPairs++;
            flippedCards = [];
            lockBoard = false;
            if (matchedPairs === totalPairs) {
                endLevel(true);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('is-flipped');
                card2.classList.remove('is-flipped');
                flippedCards = [];
                lockBoard = false;
            }, 1000);
        }
    }

    // --- REWARDED AD SCREEN LOGIC ---
    function startAdCountdown() {
        clearInterval(adCountdownInterval); // Clear any existing interval
        let adTimeLeft = 5;

        adTimerDisplay.textContent = adTimeLeft;
        adTimerDisplay.style.display = 'block'; // Or 'inline' or 'inline-block' depending on desired layout
        adBackBtn.style.display = 'none';
        adRewardGuaranteed.style.display = 'none';

        adCountdownInterval = setInterval(() => {
            adTimeLeft--;
            adTimerDisplay.textContent = adTimeLeft;
            if (adTimeLeft <= 0) {
                clearInterval(adCountdownInterval);
                adTimerDisplay.style.display = 'none';
                adBackBtn.style.display = 'block'; // Or 'inline-block' based on CSS
                adRewardGuaranteed.style.display = 'block'; // Or 'inline-block'
            }
        }, 1000);
    }

    watchAdContinueBtn.addEventListener('click', () => {
        hidePopup(losePopup);
        showScreen(rewardedAdScreen);
        startAdCountdown();
    });

    // --- GAME FLOW & LEVEL MANAGEMENT ---
    function startGame(level, resetProgress = false, fromAd = false) {
        if (level > MAX_LEVEL) {
            alert("Congratulations! You've completed all levels!");
            currentLevel = 1;
            clearSavedLevel();
        } else {
            currentLevel = level;
        }

        if (resetProgress) {
            clearSavedLevel();
        }

        levelDisplay.textContent = `Level: ${currentLevel}`;
        createGameBoard(); // This also resets matchedPairs, flippedCards

        // If continuing from an ad, we don't want to penalize the player for the ad time.
        // So, we restart the timer fully.
        startTimer();
        showScreen(gameScreen);
        lockBoard = false; // Ensure board is not locked if returning from ad
    }

    function endLevel(isWin) {
        stopTimer();
        if (isWin) {
            playSound('win');
            playSound('celebration');
            if (currentLevel < MAX_LEVEL) {
                saveLevel(currentLevel + 1);
                showPopup(winPopup);
            } else {
                alert("Congratulations! You've completed all levels!");
                clearSavedLevel();
                showScreen(null);
                splashScreen.classList.add('active');
            }
        } else {
            playSound('lose');
            vibrateGameOver();
            showPopup(losePopup);
        }
    }

    // --- EVENT LISTENERS FOR POPUP BUTTONS ---
    nextLevelBtn.addEventListener('click', () => {
        hidePopup(winPopup);
        if (currentLevel < MAX_LEVEL) {
            startGame(currentLevel + 1);
        } else {
            alert("You've finished all levels!");
            showScreen(null);
            splashScreen.classList.add('active');
        }
    });

    playAgainLoseBtn.addEventListener('click', () => {
        hidePopup(losePopup);
        startGame(currentLevel); // Restart current level
    });

    continueYesBtn.addEventListener('click', () => {
        hidePopup(continuePopup);
        const savedLevel = getSavedLevel();
        if (savedLevel && savedLevel > 0 && savedLevel <= MAX_LEVEL) {
            startGame(savedLevel);
        } else {
            startGame(1);
        }
    });

    continueNoBtn.addEventListener('click', () => {
        hidePopup(continuePopup);
        startGame(1, true);
    });

    // adBackBtn listener will be added in the next step (Integrate Rewarded Ad Flow)

    // --- INITIALIZATION ---
    function init() {
        showScreen(splashScreen);
        setTimeout(() => {
            const savedLevel = getSavedLevel();
            if (savedLevel && savedLevel > 1 && savedLevel <= MAX_LEVEL) {
                showPopup(continuePopup);
            } else {
                startGame(1);
            }
        }, 1500);
    }

    // Test buttons
    const testWinBtn = document.getElementById('test-win');
    const testLoseBtn = document.getElementById('test-lose');
    if(testWinBtn) testWinBtn.addEventListener('click', () => endLevel(true));
    if(testLoseBtn) testLoseBtn.addEventListener('click', () => {
        timeLeft = 0;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        if (!winPopup.classList.contains('active') && !losePopup.classList.contains('active')) {
             endLevel(false);
        }
    });

    init();
});
