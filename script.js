const GameBoard = (function () {
  const Cell = function () {
    let value = "";

    const getValue = () => value;

    const changeValue = (token) => (value = token);

    return { getValue, changeValue };
  };

  const gameState = [];
  for (let i = 0; i < 9; i++) {
    gameState.push(Cell());
  }
  const playerChose = (playerToken, index) => {
    if (gameState[index].getValue() === "") {
      gameState[index].changeValue(playerToken);
    }
  };

  const getBoard = () => gameState;

  const printBoard = () => {
    let toBePrinted = gameState.map((cell) => cell.getValue());
    console.log(toBePrinted);
  };

  return { playerChose, getBoard, printBoard };
})();

const Player = function (token, playerName) {
  return { token, playerName };
};

const GameController = (function (player1, player2) {
  let currPlayer = player1;
  let gameContinues = false;

  const switchPlayer = () => {
    currPlayer = currPlayer === player1 ? player2 : player1;
  };

  const printNewRound = () => {
    console.log(`it's ${currPlayer.playerName}'s Turn`);
    GameBoard.printBoard();
  };

  const checkGameState = () => {
    let currState = GameBoard.getBoard();

    const Checker = (function () {
      const checkRows = () => {
        for (let i = 0; i <= 6; i += 3) {
          let firstCell = currState[i].getValue();
          let secondCell = currState[i + 1].getValue();
          let thirdCell = currState[i + 2].getValue();
          if (
            firstCell != "" &&
            firstCell == secondCell &&
            firstCell == thirdCell
          ) {
            return true;
          }
        }
        return false;
      };
      const checkColumns = () => {
        for (let i = 0; i <= 2; i++) {
          let firstCell = currState[i].getValue();
          let secondCell = currState[i + 3].getValue();
          let thirdCell = currState[i + 6].getValue();
          if (
            firstCell != "" &&
            firstCell == secondCell &&
            firstCell == thirdCell
          ) {
            return true;
          }
        }
        return false;
      };
      return { checkColumns, checkRows };
    })();
    gameContinues = Checker.checkRows() || Checker.checkColumns();
  };

  const playRound = () => {
    printNewRound();
    let playerMove = prompt("Where do you play?");
    GameBoard.playerChose(currPlayer.token, playerMove - 1);
    console.log(gameContinues);
    checkGameState();
    if (!gameContinues) switchPlayer();
  };

  const startGame = () => {
    while (!gameContinues) {
      playRound();
    }
    console.log("The game has finished");
    console.log(`The winner is ${currPlayer.playerName}`);
  };

  return { startGame };
})(Player("x", "Benja"), Player("0", "Z"));

GameController.startGame();

const ScreenUpdater = function () {
  const gameController = GameController();
  const board = document.querySelector(".board");

  const updateScreen = () => {
    const currBoard = GameBoard.getBoard();
    //reset board
    board.textContent = "";
    board.forEach((cell, index) => {
      const cellButton = document.createElement("button");
      cellButton.classList.add("cell");
      cellButton.dataset.index = index;
      cellButton.textContent = cell.getValue();
      board.appendChild(cellButton);
      cellButton.addEventListener("click");
    });
  };
};
