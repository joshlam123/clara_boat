"use strict";
var express = require("express");
var path = require("path");
var app = express();
var port = 3000;
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
// Define teams and their leaders
var teams = [
    { name: 'Team Alpha', leader: 'Alice', score: 0, members: [] },
    { name: 'Team Bravo', leader: 'Bob', score: 0, members: [] },
    { name: 'Team Charlie', leader: 'Charlie', score: 0, members: [] }
];
// Define the deck of cards with suits and numbers
var suits = ['\u2666', '\u2665', '\u2663']; // Diamond (♦), Heart (♥), Club (♣)
var numbersWithSuits = ['9', 'Ace']; // Only 9 and Ace can have a suit (Diamonds, Hearts, Clubs)
var numbersNoSuit = ['Bonk', 'Joker', 'Pudgy']; // These cards will have no suit
var numbersRegular = ['2', '3', '4', '5', '6', '7', '8', '10']; // Regular cards with no suits
var deck = [];
// Create the deck: Assign suits to 9 and Ace, others have no suit
numbersWithSuits.forEach(function (number) {
    suits.forEach(function (suit) {
        deck.push(number + " " + suit);
    });
});
// Add regular cards (no suits)
numbersRegular.forEach(function (number) {
    deck.push("".concat(number));
});
// Add Bonk, Joker, and Pudgy (no suits) — these will only appear once
numbersNoSuit.forEach(function (card) {
    deck.push(card);
});
// Function to get a random card and remove it from the deck
var getRandomCard = function () {
    if (deck.length === 0) {
        return null; // No more cards left
    }
    var cardIndex = Math.floor(Math.random() * deck.length);
    var card = deck.splice(cardIndex, 1)[0]; // Remove the card from the deck
    return card;
};
// Handle sign-ups
var users = [];
app.get('/', function (req, res) {
    res.render('index', { teams: teams, users: users }); // Ensure both 'teams' and 'users' are passed here
});
app.post('/signup', function (req, res) {
    var name = req.body.name;
    if (name) {
        // Check if the user has already signed up
        if (users.some(function (user) { return user.name === name; })) {
            return res.redirect('/');
        }
        // Assign the user to the next team in a round-robin fashion
        var teamIndex = users.length % teams.length;
        var card = getRandomCard();
        if (card) {
            // Add the user to the selected team with the card
            users.push({ name: name, card: card });
            // Add the user to the respective team
            teams[teamIndex].members.push({ name: name, card: card });
        }
        console.log(users);
        res.redirect('/');
    }
    else {
        res.status(400).send('Name is required');
    }
});
app.listen(port, function () {
    console.log("Server is running at http://localhost:".concat(port));
});
