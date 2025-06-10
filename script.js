document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const loginSignupPage = document.getElementById('login-signup-page');
    const mainGameScreen = document.getElementById('main-game-screen');

    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userDisplay = document.getElementById('user-display');

    // Game Elements
    const gameGrid = document.getElementById('game-grid');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const restartButton = document.getElementById('restart-btn');

    // Emojis - 50 unique emojis, each will be duplicated
    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
        '😋', '😎', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔',
        '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯',
        '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓',
        '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟'
    ];

    // Game State Variables
    let flippedCards = [];
    let matchedPairs = 0;
    let timerInterval = null;
    let seconds = 0;
    let canFlip = true;
    const totalPairs = emojis.length; // Each emoji appears twice, so totalPairs is emojis.length

    // Sound Effects
    function playSound(soundFile) {
        // Ensure sounds directory is correct if you have one, e.g., 'sounds/tap.mp3'
        // For now, assuming files are in the root or accessible path
        try {
            const audio = new Audio(soundFile);
            audio.play();
        } catch (e) {
            console.error("Error playing sound:", soundFile, e);
        }
    }

    // Game Initialization Function
    function startGame() {
        if (!gameGrid || !timerDisplay || !scoreDisplay) {
            console.error("Required game elements not found in the DOM.");
            return;
        }

        // Reset game state
        flippedCards = [];
        matchedPairs = 0;
        seconds = 0;
        canFlip = true;

        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timerDisplay.textContent = "Time: 0s";
        scoreDisplay.textContent = "0";

        // Create game board
        gameGrid.innerHTML = ''; // Clear previous cards
        let gameEmojis = [...emojis, ...emojis]; // Duplicate emojis for pairs

        // Shuffle emojis (Fisher-Yates Shuffle)
        for (let i = gameEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameEmojis[i], gameEmojis[j]] = [gameEmojis[j], gameEmojis[i]];
        }

        gameEmojis.forEach(emoji => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji; // Store emoji in data attribute for checking match

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-face', 'card-front');
            // cardFront.textContent = '?'; // Optional: show something on the card front

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-face', 'card-back');
            cardBack.textContent = emoji;

            card.appendChild(cardFront);
            card.appendChild(cardBack);

            card.addEventListener('click', handleCardClick);
            gameGrid.appendChild(card);
        });

        // Start timer
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = `Time: ${seconds}s`;
        }, 1000);

        // Play restart/start sound if applicable
        // playSound('restart.mp3'); // Consider if a 'start-game.mp3' is better
    }

    // Card Click Handling Function
    function handleCardClick() {
        if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) {
            return;
        }

        this.classList.add('flipped');
        playSound('tap.mp3'); // Sound for flipping a card
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            canFlip = false; // Prevent more flips until these two are processed
            const [card1, card2] = flippedCards;
            const emoji1 = card1.dataset.emoji;
            const emoji2 = card2.dataset.emoji;

            if (emoji1 === emoji2) {
                // Matched
                matchedPairs++;
                scoreDisplay.textContent = String(parseInt(scoreDisplay.textContent) + 10); // Add 10 points
                playSound('restart.mp3'); // Placeholder for match sound, as per instructions

                card1.classList.add('matched');
                card2.classList.add('matched');
                // Optional: remove event listeners from matched cards
                // card1.removeEventListener('click', handleCardClick);
                // card2.removeEventListener('click', handleCardClick);

                flippedCards = [];
                canFlip = true;

                if (matchedPairs === totalPairs) {
                    // All pairs matched - Game Won
                    playSound('win.mp3');
                    clearInterval(timerInterval);
                    setTimeout(() => { // Delay alert to allow win sound to play and final card to show
                        alert(`Congratulations! You won in ${seconds} seconds with a score of ${scoreDisplay.textContent}!`);
                    }, 500);
                }
            } else {
                // Not matched
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    playSound('lose.mp3'); // Sound for no match / flip back
                    flippedCards = [];
                    canFlip = true;
                }, 1000); // 1-second delay before flipping back
            }
        }
    }

    // Check for existing session
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const userData = JSON.parse(loggedInUser);
        showMainGameScreen(userData.username);
        // Skip splash and login if user is already logged in
        if(splashScreen) splashScreen.style.display = 'none';
        if(loginSignupPage) loginSignupPage.style.display = 'none';
        return;
    } else {
        // If no user data, show splash screen first
        if(splashScreen) splashScreen.style.display = 'flex'; // Show splash
        setTimeout(() => {
            if(splashScreen) splashScreen.style.display = 'none';
            showLoginSignupPage();
        }, 3000); // Splash screen duration
    }

    function showLoginSignupPage() {
        if(loginSignupPage) loginSignupPage.style.display = 'flex';
        if(mainGameScreen) mainGameScreen.style.display = 'none';
    }

    function showMainGameScreen(username) {
        if(mainGameScreen) mainGameScreen.style.display = 'flex';
        if(loginSignupPage) loginSignupPage.style.display = 'none';
        if(splashScreen) splashScreen.style.display = 'none'; // Ensure splash is hidden
        if(userDisplay) userDisplay.textContent = username;
        startGame(); // Initialize game when screen is shown
    }

    function handleLogin() {
        const email = emailInput.value;
        const username = usernameInput.value;
        if (email && username) {
            const userData = { email, username };
            localStorage.setItem('loggedInUser', JSON.stringify(userData));
            showMainGameScreen(username);
        } else {
            alert('Please enter both email and username.');
        }
    }

    function handleSignup() {
        // For this example, signup and login perform the same action.
        // In a real app, signup would typically involve creating a new user account.
        handleLogin();
    }

    function handleLogout() {
        localStorage.removeItem('loggedInUser');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        showLoginSignupPage();
    }

    if(loginBtn) loginBtn.addEventListener('click', handleLogin);
    if(signupBtn) signupBtn.addEventListener('click', handleSignup);
    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if(restartButton) restartButton.addEventListener('click', () => {
        playSound('restart.mp3'); // Sound for restarting the game
        startGame();
    });
});
