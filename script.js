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
        showLoginSignupPage();
    }

    if(loginBtn) loginBtn.addEventListener('click', handleLogin);
    if(signupBtn) signupBtn.addEventListener('click', handleSignup);
    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});
