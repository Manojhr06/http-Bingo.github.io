const board1 = document.getElementById("board1");
const board2 = document.getElementById("board2");
const resetButton = document.getElementById("reset-game");
const turnInfo = document.getElementById("turn-info");
const winnerInfo = document.getElementById("winner-info");

let currentPlayer = 1;
let player1Board = [];
let player2Board = [];
let player1StruckLines = [];
let player2StruckLines = [];
let allNumbers = Array.from({ length: 25 }, (_, i) => i + 1); // Numbers between 1 and 25
let gameOver = false; // Track whether the game is over

// Function to generate a Bingo board with numbers between 1 and 25
function generateBoard() {
  let numbers = [];
  while (numbers.length < 25) {
    let num = Math.floor(Math.random() * 25) + 1; // Numbers between 1 and 25
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers;
}

// Function to create the 5x5 grid for Bingo
function createBoard(boardElement, boardArray, player) {
  boardElement.innerHTML = "";
  for (let i = 0; i < 25; i++) {
    let cell = document.createElement("div");
    cell.textContent = boardArray[i];
    cell.addEventListener("click", () => strikeNumber(cell, boardArray[i], player));
    boardElement.appendChild(cell);
  }
}

// Function to strike a number on the board
function strikeNumber(cell, number, player) {
  if (gameOver) return; // Stop if the game is over

  if (!cell.classList.contains("strike")) {
    cell.classList.add("strike"); // Turns the struck number red
    if (player === 1) {
      player1Board.splice(player1Board.indexOf(number), 1);
    } else {
      player2Board.splice(player2Board.indexOf(number), 1);
    }

    // Check for Bingo after striking a number
    checkForBingo(player);
  }
}

// Function to check for Bingo (5 full rows, columns, or diagonals)
function checkForBingo(player) {
  const board = player === 1 ? board1 : board2;
  const cells = board.querySelectorAll('div');

  const winningLines = [
    // Rows
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    // Columns
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    // Diagonals
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];

  let struckLines = [];

  // Check all lines to see if they're fully struck
  for (let i = 0; i < winningLines.length; i++) {
    const line = winningLines[i];
    if (line.every(index => cells[index].classList.contains("strike"))) {
      struckLines.push(i);
      line.forEach(index => cells[index].style.backgroundColor = '#66ff66'); // Highlight winning line in green
    }
  }

  // Now check if the player has struck at least 5 full lines
  if (struckLines.length >= 5) {
    gameOver = true; // Stop the game after 5 lines
    winnerInfo.textContent = `Player ${player} wins with ${struckLines.length} lines!`;

    if (player === 1) {
      player1StruckLines = struckLines;
    } else {
      player2StruckLines = struckLines;
    }

    // Save game data using API call
    fetch('/save-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player1Board,
        player2Board,
        winner: `Player ${player}`,
      }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }
}

// Function to start the game
function startGame() {
  player1Board = generateBoard();
  player2Board = generateBoard();
  createBoard(board1, player1Board, 1);
  createBoard(board2, player2Board, 2);
  player1StruckLines = [];
  player2StruckLines = [];
  winnerInfo.textContent = ""; // Clear any winner message
  turnInfo.textContent = "Player 1's turn";
  gameOver = false; // Reset the game status
}

// Function to reset the game
function resetGame() {
  startGame(); // Calls startGame to reset everything
}

// Start the game when the page loads
startGame();

// Event listener
resetButton.addEventListener("click", resetGame);
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Join Game</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: center;
      padding-top: 100px;
      background: linear-gradient(135deg, #1f1c2c, #928dab);
      color: #ffffff;
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    h1 {
      font-size: 48px;
      margin-bottom: 30px;
    }

    .join-group {
      background-color: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      display: inline-block;
    }

    input, select, button {
      font-size: 18px;
      padding: 12px 20px;
      margin: 10px;
      border: none;
      border-radius: 8px;
      outline: none;
    }

    input, select {
      background-color: #2a2a40;
      color: white;
    }

    button {
      background: linear-gradient(to right, #6a11cb, #2575fc);
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  </style>
</head>
<body>

  <h1>Join the Game</h1>
  <div class="join-group">
    <input type="text" id="playerName" placeholder="Enter your name" />
    <select id="language">
      <option value="English">English</option>
      <option value="Spanish">Spanish</option>
      <option value="French">French</option>
    </select>
    <button onclick="joinGame()">Join Game</button>
  </div>

  <script>
    function joinGame() {
      const name = document.getElementById('playerName').value;
      const lang = document.getElementById('language').value;
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = window.location.pathname.split('/').pop();

      if (!name) {
        alert("Please enter your name.");
        return;
      }

      alert(Joining game: ${sessionId} as ${name} (${lang}));
      // Send info to the backend or connect via WebSocket here
    }
  </script>
</body>
</html>
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-align: center;
    padding-top: 100px;
    background: linear-gradient(135deg, #1f1c2c, #928dab);
    color: #ffffff;
    margin: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  h1 {
    font-size: 56px;
    margin-bottom: 40px;
    background: linear-gradient(90deg, #00dbde, #fc00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .input-group {
    background-color: rgba(255, 255, 255, 0.05);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    margin-bottom: 30px;
    display: inline-block;
  }

  input, select, button {
    font-size: 18px;
    padding: 12px 20px;
    margin: 10px;
    border: none;
    border-radius: 8px;
    outline: none;
  }

  input, select {
    background-color: #2a2a40;
    color: white;
  }

  button {
    background: linear-gradient(to right, #6a11cb, #2575fc);
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
</style>
*function playGame() {
  const name = document.getElementById('playerName').value;
  const lang = document.getElementById('language').value;
  alert(Playing as ${name} in ${lang});
  // Add game start logic here
}
