"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use(express_1.default.urlencoded({ extended: true }));
// Define teams and their leaders
const teams = [
    { name: 'Team Alpha', leader: 'Alice', members: [] },
    { name: 'Team Bravo', leader: 'Bob', members: [] },
    { name: 'Team Charlie', leader: 'Charlie', members: [] }
];
// Define the deck of cards with suits and numbers
const suits = ['\u2666', '\u2665', '\u2663']; // Diamond (♦), Heart (♥), Club (♣)
const numbersWithSuits = ['9', 'Ace']; // Only 9 and Ace can have a suit (Diamonds, Hearts, Clubs)
const numbersNoSuit = ['Bonk', 'Joker', 'Pudgy']; // These cards will have no suit
const numbersRegular = ['2', '3', '4', '5', '6', '7', '8', '10']; // Regular cards with no suits
let deck = [];
// Create the deck: Assign suits to 9 and Ace, others have no suit
numbersWithSuits.forEach(number => {
    suits.forEach(suit => {
        deck.push(`${number} ${suit}`);
    });
});
// Add regular cards (no suits)
numbersRegular.forEach(number => {
    deck.push(`${number}`);
});
// Add Bonk, Joker, and Pudgy (no suits) — these will only appear once
numbersNoSuit.forEach(card => {
    deck.push(card);
});
// Function to get a random card and remove it from the deck
const getRandomCard = () => {
    if (deck.length === 0) {
        return null; // No more cards left
    }
    const cardIndex = Math.floor(Math.random() * deck.length);
    const card = deck.splice(cardIndex, 1)[0]; // Remove the card from the deck
    return card;
};
// Handle sign-ups
let users = [];
app.get('/', (req, res) => {
    res.render('index', { teams, users }); // Ensure both 'teams' and 'users' are passed here
});
app.post('/signup', (req, res) => {
    const name = req.body.name.trim().toLowerCase(); // Normalize the name to lowercase
    if (name) {
        // Check if the user has already signed up (case-insensitive)
        if (users.some(user => user.name === name)) {
            return res.redirect('/');
        }
        // Assign the user to the next team in a round-robin fashion
        const teamIndex = users.length % teams.length;
        const card = getRandomCard();
        if (card) {
            // Add the user to the selected team with the card
            // Store the name in original case but use lowercase for comparison
            users.push({ name: req.body.name.trim(), card: card });
            // Add the user to the respective team
            teams[teamIndex].members.push({ name, card });
        }
        res.redirect('/');
    }
    else {
        res.status(400).send('Name is required');
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
