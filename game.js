const readlineSync = require('readline-sync');
const fs = require('fs');
const logFile = 'log.txt';

let letterValues = {
  'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11,
  'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10,
  'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2
};

// Player class definition
function Player(name) {
  this.name = name;
  this.hand = [];
  this.board = [];
  this.firstTurn = true;
  this.firstAction = false;
}

// Coin toss function (returns "player1" or "player2")
function tossCoin() {
  return Math.random() < 0.5 ? "Joueur 1" : "Joueur 2";
}

// Function to add a word to the player's game board
function appendWord(player) {
  let userInput;
  do {
    userInput = readlineSync.question('Entrez un mot : ');
    userInput = userInput.toUpperCase();
  } while (!isWordValid(userInput, player.hand));
  recordLog(player, "a joué le mot " + userInput);
  player.board.push(userInput);
  removeLetter(player, userInput);
  drawSingleLetter(player);
  displayLetters(player);
}

// Function to display the player's game board
function showBoard(player) {
  console.log("Board du " + player.name + " :");
  for (let i = 0; i < player.board.length; i++) {
    console.log("Ligne " + parseInt(i + 1) + " : " + player.board[i]);
  }
}

// Function to draw 6 random letters and add them to the player's hand
function drawSixRandomLetters(player) {
  for (let i = 0; i < 6; i++) {
    drawSingleLetter(player);
  }
}

// Function to draw a random letter and add it to the player's hand
function drawSingleLetter(player) {
  let availableLetters = Object.keys(letterValues);
  let letter;
  do {
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    letter = availableLetters[randomIndex];
  } while (letterValues[letter] === 0);
  player.hand.push(letter);
  letterValues[letter]--;
}

// Function to display the player's current hand of letters
function displayLetters(player) {
  let letters = player.hand.join(' ');
  console.log("Lettres : " + letters);
}

// Function to check if the word is valid
function isWordValid(word, playerHand) {
  if (word.length < 3) return false;
  for (let i = 0; i < word.length; i++) {
    if (!playerHand.includes(word[i])) {
      return false;
    }
  }
  return true;
}

// Function to append a line to the log file, creates the file if it doesn't exist
function recordLog(player, line) {
  fs.appendFileSync(logFile, player.name + " " + line + '\n', (err) => {
    if (err) {
      console.error("Error writing to the log file:", err);
    }
  });
}

// Function to clear the log file
function resetLogFile(callback) {
  fs.writeFile(logFile, '', (err) => {
    if (err) {
      console.error("Error clearing the log file:", err);
      return;
    }
    callback();
  });
}

// Function to remove letters from the player's hand
function removeLetter(player, word) {
  for (const char of word) {
    const index = player.hand.indexOf(char);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  }
}

// Function to check if the transformation of the word is valid
function isWordTransformValid(oldWord, newWord, playerHand) {
  if (newWord.length < 3) return false;
  const oldWordLetters = oldWord.split('');
  const newWordLetters = newWord.split('');

  if (oldWord.length === newWord.length) return false;
  for (let i = 0; i < newWordLetters.length; i++) {
    if (!(playerHand.includes(newWordLetters[i]) || oldWordLetters.includes(newWordLetters[i]))) {
      return false;
    }
  }
  for (let i = 0; i < oldWordLetters.length; i++) {
    if (!newWordLetters.includes(oldWordLetters[i])) {
      return false;
    }
  }
  return true;
}

// Function to transform a word on the player's game board
function modifyWord(player, isJarnac = false, otherPlayer = null) {
  let index;
  do {
    showBoard(player);
    displayLetters(player);
    index = readlineSync.question('Entrez la ligne du mot a transformer : ');
    index = parseInt(index) - 1;
    oldWord = player.board[index];
  } while (index < 0 || index >= player.board.length || oldWord === undefined);

  console.log('Vous avez choisi de transformer le mot : ' + oldWord);
  if (!isJarnac) {
    recordLog(player, "a choisi de transformer le mot " + oldWord)
  } else {
    recordLog(otherPlayer, "a choisi de transformer le mot " + oldWord + " de " + player.name)
  }

  let newWord;
  do {
    displayLetters(player);
    newWord = readlineSync.question('Entrez le nouveau mot : ');
    newWord = newWord.toUpperCase();
  } while (!isWordTransformValid(oldWord, newWord, player.hand));
  if (!isJarnac) {
    recordLog(player, "a transformé le mot " + oldWord + " en " + newWord)
    player.board[index] = newWord;
  } else {
    recordLog(otherPlayer, "a transformé le mot " + oldWord + " en " + newWord + " de " + player.name)
    otherPlayer.board.push(newWord);
    player.board.splice(index, 1);
  }

  for (const char of newWord) {
    const countInNewWord = newWord.split(char).length - 1;
    const countInOldWord = oldWord.split(char).length - 1;
    if (countInNewWord > countInOldWord) {
      const excessCount = countInNewWord - countInOldWord;
      for (let i = 0; i < excessCount; i++) {
        const index = player.hand.indexOf(char);
        if (index !== -1) {
          player.hand.splice(index, 1);
        }
      }
    }
  }
  if (!isJarnac) {
    drawSingleLetter(player);
    return 1;
  } else {
    return 2;
  }
}

// Function to calculate the score of a word
function calculateScore(word) {
  return word.length ** 2;
}

// Function to determine if a player's turn has ended
function hasTurnEnded() {
  let answer;
  do {
    answer = readlineSync.question('Avez-vous terminé votre tour ?');
  } while (answer !== "oui" && answer !== "non");
  return answer === "oui";
}

// Function to choose an action for the player
function selectAction(player, elapsedT = 0) {
  let answer;
  let startTime = Date.now();
  let otherPlayer = players.filter(p => p !== player)[0];
  do {
    answer = readlineSync.question('1 : Placer un mot   2 : Modifier un mot   3 : Passer\n');
    elapsedTime = (Date.now() + elapsedT) - startTime;
  } while ((answer !== "1" || player.hand.length < 3) && (answer !== "2" || player.board.length < 1) && answer !== "3" && answer.toLowerCase() !== "jarnac");
  if (answer === "1") {
    return 1;
  }
  if (answer === "2") {
    return 2;
  }
  if (answer === "3") {
    return 3;
  }
  if ((answer.toLowerCase() === "jarnac") && !player.firstTurn && (elapsedTime) <= 3000 && otherPlayer.board.length > 0 && otherPlayer.hand.length > 0) {
    return 4;
  } else if ((answer.toLowerCase() === "jarnac") && !player.firstTurn && (elapsedTime) > 3000) {
    console.log("Trop tard pour Jarnac !");
    return selectAction(player, elapsedTime);
  } else if ((answer.toLowerCase() === "jarnac") && player.firstTurn) {
    console.log("Impossible de faire un coup de Jarnac au premier tour");
    return selectAction(player);
  }
}

// Function to perform a Jarnac move
function executeJarnac(player) {
  otherPlayer = players.filter(p => p !== player)[0];
  modifyWord(otherPlayer, true, player);
}

// Function to execute an action based on player's choice
function performAction(choice, player) {
  if (choice === 1) {
    showBoard(player);
    displayLetters(player);
    appendWord(player);
    showBoard(player);
    return 1
  }
  if (choice === 2) {
    modifyWord(player);
    showBoard(player);
    return 2
  }
  if (choice === 3) {
    console.log(player.name, "passe son tour");
    recordLog(player, "passe son tour")
    return 3
  }
  if (choice === 4) {
    recordLog(player, "a fait un coup de Jarnac !");
    executeJarnac(player);
    return 4
  }
}

let player1 = new Player("Joueur 1");
let player2 = new Player("Joueur 2");
let players = [player1, player2];

let i = 0;
let end_player_turn = false;
drawSixRandomLetters(player1);
drawSixRandomLetters(player2);
let choice;

// Main game function
function startGame() {
  while (i !== 1) {
    console.log("Bienvenue au Jarnac");
    for (const player of players) {
      do {
        let actionVal;
        if (player.firstTurn && !player.firstAction) {
          console.log("Au tour du " + player.name + " :");
          displayLetters(player);
          appendWord(player);
          choice = selectAction(player);
          actionVal = performAction(choice, player);
          player.firstAction = true;
        } else {
          console.log("Au tour du " + player.name + " :");
          if (!player.firstTurn) {
            console.log("Vous avez 3 secondes pour faire un coup de Jarnac")
          }
          showBoard(player);
          displayLetters(player);
          choice = selectAction(player);
          actionVal = performAction(choice, player);
        }
        if (actionVal === 3) {
          player.firstTurn = false;
          end_player_turn = true;
        }
      } while (!end_player_turn);
      end_player_turn = false;
    }
  }
}

resetLogFile(startGame);
