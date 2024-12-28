import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// Define teams and their leaders
const teams = [
  { name: 'Team Broccoli', leader: 'Isaac', score: 0, members: [] },
  { name: 'Team Tinychat Bro', leader: 'Giles', score: 0, members: [] },
  { name: 'Team Car Crash Drunkard', leader: 'Yee Ting', score: 0, members: [] }
];

// Define the deck of cards with suits and numbers
const suits = ['\u2666', '\u2665', '\u2663']; // Diamond (♦), Heart (♥), Club (♣)

// Card distribution with specific limits
const cardLimit = {
  '2': 2, '3': 2, '4': 2, '5': 2, '6': 2, '7': 2, '8': 2, '10': 2,
  'Ace': 3, '9': 3,
  'Bonk': 0, 'Joker': 0, 'Pudgy': 0
};

let deck: string[] = [];
let totalCardsDrawn = 0; // Track the number of cards drawn

// Create the deck based on the distribution rules
Object.entries(cardLimit).forEach(([card, limit]) => {
  for (let i = 0; i < limit; i++) {
    if (['Ace', '9'].includes(card)) {
      // 3x Ace and 9 can have any of the suits (Heart, Club, Diamond)
      suits.forEach(suit => deck.push(`${card} ${suit}`));
    } else if (['2', '3', '4', '5', '6', '7', '8', '10'].includes(card)) {
      // 2x for regular numbers: 2, 3, 4, 5, 6, 7, 8, 10 (only Heart or Club)
      ['\u2665', '\u2663'].forEach(suit => deck.push(`${card} ${suit}`));
    } 
    // else {
    //   // 1x special cards: Bonk, Pudgy, Joker (no suits)
    //   deck.push(card);
    // }
  }
});

// Shuffle function for random card selection
const shuffleDeck = (deck: string[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
  }
};

// Shuffle the deck
shuffleDeck(deck);

// Function to get a random card and remove it from the deck
const getRandomCard = () => {
  if (totalCardsDrawn >= 19 || deck.length === 0) {
    return null; // No more cards or limit reached
  }
  const card = deck.pop(); // Get the last card in the deck
  totalCardsDrawn++; // Increment the counter of cards drawn
  return card;
};

// Handle sign-ups
let users: Array<{ name: string, card: string }> = [];
app.get('/', (req, res) => {
  res.render('index', { teams, users, isLimitReached: totalCardsDrawn >= 16 });
});

app.post('/signup', (req, res) => {
  const name = req.body.name.trim().toLowerCase(); // Normalize the name to lowercase

  if (name) {
    // Check if the user has already signed up (case-insensitive)
    if (users.some(user => user.name === name)) {
      return res.redirect('/');
    }

    // If there are fewer than 16 cards drawn, assign a card
    if (totalCardsDrawn < 16) {
      // Assign the user to the next team in a round-robin fashion
      const teamIndex = users.length % teams.length;
      const team = teams[teamIndex];

      let card: string | null = getRandomCard();

      if (card) {
        // Add the user to the selected team with the card
        users.push({ name, card });
        team.members.push({ name, card });
      }
      res.redirect('/');
    } else {
      // If we've already assigned 16 cards, stop processing new sign-ups
      res.status(400).send('Card limit reached. No more sign-ups allowed.');
    }
  } else {
    res.status(400).send('Name is required');
  }
});

app.post('/edit-score', (req, res) => {
    const { teamName, add_score } = req.body;

    // Find the team by name and update its score (this example uses an in-memory object)
    const team = teams.find(t => t.name === teamName);
    if (team) {
        team.score += parseInt(add_score, 10); // Add the score
        res.status(200).send('Score updated');
    } else {
        res.status(404).send('Team not found');
    }
});


app.post('/edit-name', (req, res) => {
    const { oldName, newName } = req.body;
  
    // Update the name in the users array
    const userIndex = users.findIndex(user => user.name === oldName.trim().toLowerCase());
  
    if (userIndex !== -1 && newName) {
      users[userIndex].name = newName.trim().toLowerCase(); // Update the user's name
  
      // Also update the user's name in the team members
      teams.forEach(team => {
        const memberIndex = team.members.findIndex(member => member.name === oldName.trim().toLowerCase());
        if (memberIndex !== -1) {
          team.members[memberIndex].name = newName.trim().toLowerCase(); // Update name in the team board
        }
      });
    }
  
    res.redirect('/');
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
