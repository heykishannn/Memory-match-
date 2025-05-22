const cardsArray = [
    { name: '🍎', id: 1 },
    { name: '🍎', id: 2 },
    { name: '🍌', id: 3 },
    { name: '🍌', id: 4 },
    { name: '🍇', id: 5 },
    { name: '🍇', id: 6 },
    { name: '🍓', id: 7 },
    { name: '🍓', id: 8 },
    { name: '🍉', id: 9 },
    { name: '🍉', id: 10 },
    { name: '🍍', id: 11 },
    { name: '🍍', id: 12 },
    { name: '🥝', id: 13 },
    { name: '🥝', id: 14 },
    { name: '🍒', id: 15 },
    { name: '🍒', id: 16 },
];

const gameContainer = document.getElementById('game');
const restartBtn = document.getElementById('restartBtn');

let flippedCards = [];
let matchedCards = [];

function shuffle(array) {
    for(let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createBoard() {
    gameContainer.innerHTML = '';
    shuffle(cardsArray);
    cardsArray.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.name = card.name;
        cardElement.dataset.id = card.id;

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${card.name}</div>
            </div>
        `;

        cardElement.addEventListener('click', flipCard);
        gameContainer.appendChild(cardElement);
    });
}

function flipCard() {
    if (flippedCards.length === 2) return; // prevent flipping more than 2 cards
    if (this.classList.contains('flipped') || matchedCards.includes(this)) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    const [cardOne, cardTwo] = flippedCards;
    if (cardOne.dataset.name === cardTwo.dataset.name) {
        matchedCards.push(cardOne, cardTwo);
        flippedCards = [];
        if (matchedCards.length === cardsArray.length) {
            setTimeout(() => alert('Congratulations! You matched all cards!'), 300);
        }
    } else {
        setTimeout(() => {
            cardOne.classList.remove('flipped');
            cardTwo.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

restartBtn.addEventListener('click', () => {
    flippedCards = [];
    matchedCards = [];
    createBoard();
});

createBoard();
