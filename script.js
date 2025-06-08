document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: Script started.");

    // --- DOM Elements for Auth System ---
    const mainAppContainer = document.getElementById('main-app-container');
    const authPage = document.getElementById('auth-page');
    const gamePage = document.getElementById('game-page'); // The main container for all game HTML

    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginMessage = document.getElementById('login-message');

    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const signupMessage = document.getElementById('signup-message');

    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    // --- DOM Elements for Game System ---
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const gameScreen = document.getElementById('game-screen'); // The actual game play area
    const startScreen = document.getElementById('start-screen'); // The initial start screen for game
    const gameContainer = document.getElementById('game'); // The grid for cards
    const levelDisplay = document.getElementById('levelDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const soundToggle = document.getElementById('soundToggle');

    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    const popupLevel = document.getElementById('popupLevel');
    const popupScore = document.getElementById('popupScore');
    const popupTime = document.getElementById('popupTime');
    const homeBtn = document.getElementById('homeBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');

    const resumePopup = document.getElementById('resumePopup');
    const newGameBtn = document.getElementById('newGameBtn');
    const continueBtn = document.getElementById('continueBtn');

    const timeoutPopup = document.getElementById('timeoutPopup');
    const timeoutContinueBtn = document.getElementById('timeoutContinueBtn');
    const timeoutPlayAgainBtn = document.getElementById('timeoutPlayAgainBtn');

    const flipSound = document.getElementById('flipSound');
    const matchSound = document.getElementById('matchSound');
    const loseSound = document.getElementById('loseSound');
    const pauseSound = document.getElementById('pauseSound');
    const restartSound = document.getElementById('restartSound');

    // --- Game State Variables ---
    let level = 1;
    let score = 0;
    let timer = 0;
    let timerInterval = null;

    let flippedCards = [];
    let matchedCards = [];

    let cardsArray = [];

    const maxLevels = 100;

    let isPaused = false;

    // Emoji pool
    const emojiPool = [
      '🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🍑','🍋',
      '🥥','🥭','🍐','🍊','🍈','🍏','🥑','🍅','🥕','🌽'
    ];

    // --- Auth Helper Functions for Local Storage ---
    // Stores users as an object: { email: { password: '...', etc. } }
    function getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : {};
    }

    function setUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Stores the email of the currently logged-in user
    function setLoggedInUser(email) {
        localStorage.setItem('loggedInUserEmail', email);
    }

    function getLoggedInUser() {
        return localStorage.getItem('loggedInUserEmail');
    }

    function clearLoggedInUser() {
        localStorage.removeItem('loggedInUserEmail');
    }

    // --- UI State Management for Auth/Game Pages ---
    function showPage(pageId) {
        console.log(`showPage: Attempting to show ${pageId}`);
        if (pageId === 'auth-page') {
            authPage.classList.remove('hidden');
            gamePage.classList.add('hidden');
            // Reset forms and messages when showing auth page
            loginForm.reset();
            signupForm.reset();
            loginMessage.textContent = '';
            signupMessage.textContent = '';
            // Default to login form view
            showLoginForm();
            // Ensure all game-related popups/screens are hidden when returning to auth
            gameScreen.classList.add('hidden');
            startScreen.classList.add('hidden'); // Ensure game start screen is hidden
            popup.classList.add('hidden');
            resumePopup.classList.add('hidden');
            timeoutPopup.classList.add('hidden');
            console.log("showPage: Auth page visible, game page hidden.");
        } else if (pageId === 'game-page') {
            authPage.classList.add('hidden');
            gamePage.classList.remove('hidden');
            console.log("showPage: Game page visible, auth page hidden. Initializing game UI...");
            initializeGameUI(); // Initialize game UI after showing game page
        }
    }

    function updateLoggedInUserDisplay() {
        const userEmail = getLoggedInUser();
        if (userEmail) {
            welcomeMessage.textContent = `Welcome, ${userEmail}!`;
            console.log(`updateLoggedInUserDisplay: Welcome message set for ${userEmail}.`);
        } else {
            welcomeMessage.textContent = `Welcome, Guest!`;
            console.log("updateLoggedInUserDisplay: No logged-in user.");
        }
    }

    function showLoginForm() {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        showLoginBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
        loginMessage.textContent = ''; // Clear previous messages
        console.log("Auth forms: Showing login form.");
    }

    function showSignupForm() {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        showSignupBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        signupMessage.textContent = ''; // Clear previous messages
        console.log("Auth forms: Showing signup form.");
    }

    // --- Auth Logic ---

    // Handle Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Signup form submitted.");

        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        signupMessage.textContent = ''; // Clear previous message

        if (!email || !password || !confirmPassword) {
            signupMessage.textContent = 'Please fill in all fields.';
            console.log("Signup failed: Missing fields.");
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.textContent = 'Passwords do not match.';
            console.log("Signup failed: Passwords mismatch.");
            return;
        }

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            signupMessage.textContent = 'Please enter a valid email address.';
            console.log("Signup failed: Invalid email format.");
            return;
        }

        let users = getUsers();
        if (users[email]) {
            signupMessage.textContent = 'This email is already registered. Please login.';
            console.log(`Signup failed: Email ${email} already registered.`);
            return;
        }

        // Store user (for simplicity, password stored in plain text.
        // In a real app, always hash passwords on the server side!)
        users[email] = { password: password };
        setUsers(users);

        setLoggedInUser(email); // Automatically log in after signup
        updateLoggedInUserDisplay();
        showPage('game-page'); // Transition to game page
        alert('Signup successful! Welcome to the game.');
        signupForm.reset(); // Clear form fields
        console.log(`Signup successful for ${email}.`);
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Login form submitted.");

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        loginMessage.textContent = ''; // Clear previous message

        if (!email || !password) {
            loginMessage.textContent = 'Please fill in all fields.';
            console.log("Login failed: Missing fields.");
            return;
        }

        const users = getUsers();
        const user = users[email];

        if (!user || user.password !== password) {
            loginMessage.textContent = 'Invalid email or password.';
            console.log("Login failed: Invalid credentials.");
            return;
        }

        setLoggedInUser(email);
        updateLoggedInUserDisplay();
        showPage('game-page'); // Transition to game page
        alert('Login successful! Welcome back.');
        loginForm.reset(); // Clear form fields
        console.log(`Login successful for ${email}.`);
    });

    // Handle Logout
    logoutBtn.addEventListener('click', () => {
        console.log("Logout button clicked.");
        if (confirm('Are you sure you want to logout?')) {
            clearLoggedInUser();
            resetGame(); // Reset game state and UI to start screen for the next user
            showPage('auth-page'); // Transition back to auth page
            alert('You have been logged out.');
            console.log("User logged out and game reset.");
        }
    });

    // --- Event Listeners for Auth UI Toggles ---
    if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginForm);
    if (showSignupBtn) showSignupBtn.addEventListener('click', showSignupForm);

    // --- Game Logic Starts Here ---

    // Stop all sounds helper
    function stopAllSounds() {
      [flipSound, matchSound, loseSound, pauseSound, restartSound].forEach(audio => {
        if (audio) { // Check if audio element exists
          audio.pause();
          audio.currentTime = 0;
        }
      });
      console.log("stopAllSounds: All sounds stopped.");
    }

    // Vibrate helper with APK compatibility
    function vibratePattern(duration = 200) {
      if (vibrationToggle && vibrationToggle.checked && navigator.vibrate) {
        try {
          navigator.vibrate([duration]);
          console.log(`Vibrating for ${duration}ms.`);
        } catch(e) {
          console.warn("Vibration failed:", e);
        }
      }
    }

    // Shuffle helper
    function shuffle(array) {
      for(let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Generate cards for current level
    function generateCards(level) {
      let pairs = Math.min(2 + Math.floor(level / 5), 10);
      let selectedEmojis = shuffle(emojiPool).slice(0, pairs);

      let cards = [];
      selectedEmojis.forEach((emoji, index) => {
        cards.push({name: emoji, id: index * 2});
        cards.push({name: emoji, id: index * 2 + 1});
      });
      console.log(`Generated ${cards.length} cards for level ${level}. Pairs: ${pairs}`);
      return shuffle(cards);
    }

    // Calculate timer based on number of cards (2.5 seconds per card)
    function calculateTimer(level) {
      const tempCards = generateCards(level);
      const calculatedTime = tempCards.length * 2.5; // seconds
      console.log(`Calculated timer for level ${level}: ${calculatedTime}s`);
      return calculatedTime;
    }

    // Create board
    function createBoard() {
      gameContainer.innerHTML = '';
      cardsArray.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.name = card.name;
        cardElement.dataset.id = card.id;

        cardElement.innerHTML = `
          <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back">${card.name}</div>
          </div>
        `;

        cardElement.addEventListener('click', flipCard);
        gameContainer.appendChild(cardElement);
      });

      let cols = Math.min(5, Math.ceil(Math.sqrt(cardsArray.length)));
      gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      gameContainer.setAttribute('data-cols', cols);
      console.log(`Board created with ${cardsArray.length} cards in ${cols} columns.`);
    }

    // Flip card handler
    function flipCard() {
      if (isPaused) {
        console.log("Flip blocked: Game is paused.");
        return;
      }
      if (flippedCards.length === 2) {
        console.log("Flip blocked: Two cards already flipped, waiting for match check.");
        return;
      }
      if (this.classList.contains('flipped') || matchedCards.includes(this)) {
        console.log("Flip blocked: Card already flipped or matched.");
        return;
      }

      this.classList.add('flipped');
      flippedCards.push(this);
      console.log(`Card flipped: ${this.dataset.name}, Flipped cards count: ${flippedCards.length}`);

      if (soundToggle.checked) {
        stopAllSounds();
        if (flipSound) {
            flipSound.currentTime = 0;
            flipSound.play();
            console.log("Flip sound played.");
        }
      }

      if (flippedCards.length === 2) {
        checkForMatch();
      }
    }

    // Check match
    function checkForMatch() {
      console.log("Checking for match...");
      const [cardOne, cardTwo] = flippedCards;
      if (cardOne.dataset.name === cardTwo.dataset.name) {
        console.log(`Match found for ${cardOne.dataset.name}!`);
        matchedCards.push(cardOne, cardTwo);
        score += 10;
        scoreDisplay.textContent = score;

        vibratePattern(150);

        flippedCards = [];

        if (matchedCards.length === cardsArray.length) {
          console.log("All cards matched! Level complete.");
          clearInterval(timerInterval);
          setTimeout(() => {
            showPopup(true, `Level ${level} Complete!`);
          }, 500);
        }
      } else {
        console.log("No match, flipping back.");
        setTimeout(() => {
          cardOne.classList.remove('flipped');
          cardTwo.classList.remove('flipped');
          flippedCards = [];
        }, 1000);
      }
    }

    // Timer countdown
    function startTimer() {
      console.log("Starting timer...");
      clearInterval(timerInterval);
      timerDisplay.textContent = Math.floor(timer);
      timerInterval = setInterval(() => {
        if (isPaused) return;
        timer -= 1;
        timerDisplay.textContent = Math.max(0, Math.floor(timer));
        if (timer <= 0) {
          console.log("Timer ran out!");
          clearInterval(timerInterval);
          showTimeoutPopup();
        }
      }, 1000);
    }

    // Show timeout popup
    function showTimeoutPopup() {
      console.log("Showing timeout popup.");
      timeoutPopup.classList.remove('hidden');
      gameScreen.style.pointerEvents = 'none'; // Disable interaction with game behind popup
      // Hide other popups if somehow visible
      popup.classList.add('hidden');
      resumePopup.classList.add('hidden');

      if (soundToggle.checked) {
        stopAllSounds();
        if (loseSound) {
            loseSound.currentTime = 0;
            loseSound.play();
        }
      }
      vibratePattern(300);
    }

    // Hide timeout popup
    function hideTimeoutPopup(callback) {
      console.log("Hiding timeout popup.");
      timeoutPopup.classList.add('hidden');
      gameScreen.style.pointerEvents = 'auto'; // Re-enable interaction
      if (callback) callback();
    }

    // Show popup (win or lose)
    function showPopup(win, message) {
      console.log(`Showing popup: Win: ${win}, Message: ${message}`);
      popupTitle.textContent = win ? 'You Won!' : 'Time Out!';
      popupMessage.textContent = message;
      popupLevel.textContent = level;
      popupScore.textContent = score;
      popupTime.textContent = Math.max(0, Math.floor(timer));
      popup.classList.remove('hidden');
      popup.style.animation = 'zoomIn 0.3s ease forwards';

      gameContainer.style.pointerEvents = 'none'; // Disable interaction with game behind popup

      if (vibrationToggle.checked) {
        vibratePattern(300);
      }
      if (soundToggle.checked) {
        stopAllSounds();
        if (win) {
          if (matchSound) {
              matchSound.currentTime = 0;
              matchSound.play();
          }
        } else { // This case is actually handled by showTimeoutPopup, but good to have fallback
          if (loseSound) {
              loseSound.currentTime = 0;
              loseSound.play();
          }
        }
      }

      if (win) {
        saveProgress();
      } else {
        clearProgress(); // If it's a direct lose, clear progress
      }
    }

    // Hide popup
    function hidePopup(callback) {
      console.log("Hiding popup.");
      popup.style.animation = 'zoomOut 0.3s ease forwards';
      setTimeout(() => {
        popup.classList.add('hidden');
        gameContainer.style.pointerEvents = 'auto'; // Re-enable interaction
        if (callback) callback();
      }, 300);
    }

    // Save/load progress for the current logged-in user
    function saveProgress() {
        const userEmail = getLoggedInUser();
        if (!userEmail) {
            console.warn("SaveProgress: No logged in user to save progress for.");
            return;
        }
        const userData = {
            level: level,
            score: score
        };
        localStorage.setItem(`gameProgress_${userEmail}`, JSON.stringify(userData));
        console.log(`SaveProgress: Progress saved for ${userEmail}: Level ${level}, Score ${score}`);
    }

    function loadProgress() {
        const userEmail = getLoggedInUser();
        if (!userEmail) {
            console.log("LoadProgress: No logged in user, cannot load progress.");
            return null; // Not an error, just no user logged in or no progress for guest
        }
        const savedData = localStorage.getItem(`gameProgress_${userEmail}`);
        if (savedData) {
            console.log(`LoadProgress: Progress loaded for ${userEmail}.`);
            return JSON.parse(savedData);
        }
        console.log(`LoadProgress: No saved progress found for ${userEmail}.`);
        return null;
    }

    function clearProgress() {
        const userEmail = getLoggedInUser();
        if (userEmail) {
            localStorage.removeItem(`gameProgress_${userEmail}`);
            console.log(`ClearProgress: Progress cleared for ${userEmail}.`);
        } else {
            console.log("ClearProgress: No logged in user to clear progress for.");
        }
    }

    // Start level
    function startLevel() {
      console.log(`Starting level: ${level} with current score: ${score}`);
      flippedCards = [];
      matchedCards = [];
      scoreDisplay.textContent = score;
      levelDisplay.textContent = level;

      cardsArray = generateCards(level);
      createBoard();

      t
