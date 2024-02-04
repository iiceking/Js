const prompt = require("prompt-sync")({ sigint: true });
const checkword = require("check-if-word")("en");

const letter_dict = {
  A: 14,
  B: 4,
  C: 7,
  D: 5,
  E: 19,
  F: 2,
  G: 4,
  H: 2,
  I: 11,
  J: 1,
  K: 1,
  L: 6,
  M: 5,
  N: 9,
  O: 8,
  P: 4,
  Q: 1,
  R: 10,
  S: 7,
  T: 9,
  U: 8,
  V: 2,
  W: 1,
  X: 1,
  Y: 1,
  Z: 2,
};

let players = [0, 1];
let game_playing = true;
let first_turn_played = false;
let i = 1;

const player_letters = [[], []];
const player_grid = [[], []];

function pick6Letters() {
  const letter_list = [];
  for (let i = 0; i < 6; i++) {
    const rdm = pickLetter();
    letter_list.push(rdm);
  }
  return letter_list;
}

function userInput(player) {
  console.clear();
  console.log(`It's player ${player + 1}'s turn`);
  console.log("\nHere is your grid: ", player_grid[player]);
  console.log("\nYou have ", player_letters[player].length, " letters: ", player_letters[player]);
  console.log("\nWhat do you want to do ? (select a number)\n 1 - write a new word \n 2 - turn a word into a new one \n 3 - pass");
  const choice = prompt();

  if (["1", "2", "3"].includes(choice)) {
    return choice;
  } else {
    console.log("\nInvalid input. Try again.\n");
    return userInput(player);
  }
}

function inputCheck(user_input, player) {
  user_input = user_input.toUpperCase();
  const split_word = user_input.split('');
  let res_string = "";
  const tmp_player = [...player_letters[player]];

  if (split_word.length >= 3) {
    for (const letter of split_word) {
      if (!tmp_player.includes(letter)) {
        console.log("Invalid Entry. Please only use letters you have.\n");
        return false;
      }
      const index = tmp_player.indexOf(letter);
      tmp_player.splice(index, 1);
    }

    if (checkword(user_input.toLowerCase())) {
      return true;
    } else {
      res_string += "Word does not exist...\n";
    }
  } else {
    res_string += "Word not long enough, make sure the word is at least 3 letters long.\n";
  }
  console.log(res_string);
  return false;
}

function pickLetter() {
  const keys_array = Object.keys(letter_dict);
  const rdm_index = Math.floor(Math.random() * keys_array.length);
  const rdm_letter = keys_array[rdm_index];

  if (letter_dict[rdm_letter] === 1) {
    delete letter_dict[rdm_letter];
  } else {
    letter_dict[rdm_letter] -= 1;
  }

  return rdm_letter;
}

function newWord(player) {
  console.clear();
  const user_input = userInput(player);
  if (user_input === "1") {
    console.log("Make a word: ");
    const wordInput = prompt();
    const isValid = inputCheck(wordInput, player);
    if (isValid) {
      const split_word = wordInput.toUpperCase().split('');
      player_grid[player].push(wordInput);
      for (const letter of split_word) {
        const index = player_letters[player].indexOf(letter);
        player_letters[player].splice(index, 1);
      }
      return 1;
    }
  } else if (user_input === "exit()") {
    return -1;
  }
  return newWord(player);
}

function chooseWord(player) {
  let user_input = "";
  const index_array = player_grid[player].map((_, index) => (index + 1).toString());
  while (!index_array.includes(user_input)) {
    console.clear();
    console.log("What word do you want to change ?\n");
    player_grid[player].forEach((word, index) => {
      console.log(`${index + 1}.  ${word}\n`);
    });
    console.log("Please choose a word by entering the corresponding number.\n");
    user_input = prompt();
  }
  return parseInt(user_input) - 1;
}

function changeWord(player) {
  const old_word_index = chooseWord(player);
  const old_word = player_grid[player][old_word_index].toUpperCase().split('');
  console.log(old_word);
  console.log("\nPlease enter the new word to be added:\n");
  const new_word = prompt();
  const new_word_sliced = new_word.split('');
  const player_array = player_letters[player].concat(old_word);
  const word_check = inputCheck(new_word, player_array, player);
  console.log(word_check);
  if (!word_check) {
    return word_check;
  }
  for (const letter of old_word) {
    if (new_word_sliced.includes(letter.toLowerCase())) {
      const index = new_word_sliced.indexOf(letter.toLowerCase());
      new_word_sliced.splice(index, 1);
    }
  }
  for (const letter of new_word_sliced) {
    const index = player_letters[player].indexOf(letter.toUpperCase());
    player_letters[player].splice(index, 1);
  }
  player_grid[player][old_word_index] = new_word;
  return new_word;
}

function passTurn() {
  i = (i + 1) % 2;
}

function firstTurn(player) {
  console.clear();
  console.log(`It's player ${player + 1}'s turn!\n`);
  player_letters[player] = pick6Letters();
  return menu(player);
}

function turn(player) {
  while (true) {
    console.log(`It's player ${player + 1}'s turn!\n`);
    const new_letter = pickLetter();
    player_letters[player].push(new_letter);
    return menu(player);
  }
}

while (game_playing) {
  if (!first_turn_played) {
    firstTurn(i);
    passTurn();
    firstTurn(i);
    passTurn();
    first_turn_played = true;
  } else {
    turn(i);
    passTurn();
  }
}
