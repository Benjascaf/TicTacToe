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

  const resetBoard = () => gameState.forEach((cell) => cell.changeValue(""));

  //Need this to then project posible board states
  const resetCell = (index) => gameState[index].changeValue("");

  const alreadyOcuppied = (index) => gameState[index].getValue() !== "";

  return {
    playerChose,
    getBoard,
    printBoard,
    alreadyOcuppied,
    resetBoard,
    resetCell,
  };
})();

const Player = function (playerName, token) {
  const getPlayerToken = () => token;
  const getPlayerName = () => playerName;
  return { getPlayerToken, getPlayerName };
};

const GameController = function (player1, player2) {
  let currPlayer = player1;
  let gameContinues = false;
  let isTie = false;

  const switchPlayer = () => {
    currPlayer = currPlayer === player1 ? player2 : player1;
  };

  const getCurrentPLayer = () => currPlayer;
  const getGameStatus = () => gameContinues;
  const getTieStatus = () => isTie;

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
      const checkDiagonals = () => {
        //This function would've been far better with a matrix-like
        //implementation of the board state
        let fstCell = currState[0].getValue();
        let sndCell = currState[4].getValue();
        let thrdCell = currState[8].getValue();
        let frthCell = currState[2].getValue();
        let lastCell = currState[6].getValue();

        return (
          (fstCell != "" && fstCell === sndCell && fstCell === thrdCell) ||
          (frthCell != "" && frthCell === sndCell && frthCell === lastCell)
        );
      };

      const checkForTie = () => {
        const emptySpaces = currState.filter((cell) => cell.getValue() === "");
        return emptySpaces.length == 0;
      };
      return { checkColumns, checkRows, checkForTie, checkDiagonals };
    })();
    gameContinues =
      Checker.checkRows() || Checker.checkColumns() || Checker.checkDiagonals();
    isTie = Checker.checkForTie();
  };

  const playRound = (playerMove) => {
    if (GameBoard.alreadyOcuppied(playerMove)) return;
    GameBoard.playerChose(currPlayer.getPlayerToken(), playerMove);
    checkGameState();
    if (!gameContinues) switchPlayer();
  };

  //Need this to go back after projecting possible board states
  const resetPlay = (index) => {
    GameBoard.resetCell(index);
    //if the play led to a terminal state, change it back
    gameContinues = gameContinues ? false : true;
    isTie = isTie ? false : true;
  };

  const getValidPlays = () => {
    let validPlays = [];
    for (let i = 0; i < 9; i++) {
      if (GameBoard.alreadyOcuppied(i)) {
        validPlays.push(i);
      }
    }
    return validPlays;
  };

  return {
    playRound,
    getCurrentPLayer,
    getGameStatus,
    getTieStatus,
    resetPlay,
    getValidPlays,
  };
};

const ScreenUpdater = function (gameController, isSinglePlayerGame = false) {
  const board = document.querySelector(".board");
  const gameInfo = document.querySelector(".game-info");
  gameInfo.style.display = "grid";

  const updateScreen = () => {
    const currBoard = GameBoard.getBoard();
    //reset board
    board.textContent = "";
    currBoard.forEach((cell, index) => {
      const cellButton = document.createElement("button");
      cellButton.classList.add("cell");
      cellButton.dataset.index = index;
      cellButton.textContent = cell.getValue();
      board.appendChild(cellButton);
      updateGameMessage();
    });
  };

  const onCLickButtonHandler = (event) => {
    const selectedCellIndex = event.target.dataset.index;
    if (!selectedCellIndex) return;
    gameController.playRound(selectedCellIndex);
    updateScreen();
    if (isSinglePlayerGame) {
      while (
        gameController.getCurrentPLayer().getPlayerName() === "The Computer" &&
        !gameController.getGameStatus() //If the game finishes with the computer winning the currentplayer will be The Computer after the round
      ) {
        gameController.playRound(Math.floor(Math.random() * 9));
      }
      updateScreen();
    }
  };

  const updateGameMessage = () => {
    if (gameController.getGameStatus()) {
      finishGameWithVictory();
      return;
    } else if (gameController.getTieStatus()) {
      finishGameWithTie();
      return;
    }
    const messageContainer = document.querySelector(".game-messages");
    messageContainer.textContent = `It's ${gameController
      .getCurrentPLayer()
      .getPlayerName()}'s turn`;
  };

  const finishGameWithVictory = () => {
    const winner = gameController.getCurrentPLayer().getPlayerName();
    const messageContainer = document.querySelector(".game-messages");
    messageContainer.textContent = `The Winner is ${winner}!!`;
    board.removeEventListener("click", onCLickButtonHandler);
  };

  const finishGameWithTie = () => {
    const messageContainer = document.querySelector(".game-messages");
    messageContainer.textContent = `It's a Tie!!`;
    board.removeEventListener("click", onCLickButtonHandler);
  };

  const resetGame = () => {
    const multiPlayerForm = document.querySelector(
      ".form-container.multi-player"
    );
    gameInfo.style.display = "none";
    multiPlayerForm.style.display = "block";
    GameBoard.resetBoard();
    updateScreen();
    board.removeEventListener("click", onCLickButtonHandler);
  };

  board.addEventListener("click", onCLickButtonHandler);
  document
    .querySelector(".game-info button")
    .addEventListener("click", resetGame);
  updateScreen();
};

const inputManager = function () {
  const singlePlayerButton = document.querySelector(".single_player_button");
  const multiPlayerButton = document.querySelector(".multi_player_button");
  const singlePlayerForm = document.querySelector(
    ".form-container.single-player"
  );
  const multiPlayerForm = document.querySelector(
    ".form-container.multi-player"
  );
  const setUpEventListeners = () => {
    singlePlayerButton.addEventListener("click", displaySinglePlayerForm);
    multiPlayerButton.addEventListener("click", displayMultiplayerForm);
    singlePlayerForm.addEventListener("submit", startSinglePlayerGame);
    multiPlayerForm.addEventListener("submit", (event) =>
      startMultiPlayerGame(event)
    );
  };
  const displayMultiplayerForm = () => {
    multiPlayerForm.style.display = "block";
    singlePlayerForm.style.display = "none";
  };
  const displaySinglePlayerForm = () => {
    multiPlayerForm.style.display = "none";
    singlePlayerForm.style.display = "block";
  };

  const startMultiPlayerGame = (event) => {
    event.preventDefault();
    const firstPlayerName = document.querySelector("#player1_name").value;
    const secondPlayerName = document.querySelector("#player2_name").value;
    const firstPlayer = Player(firstPlayerName, "X");
    const secondPlayer = Player(secondPlayerName, "O");
    const multiPlayerGameController = GameController(firstPlayer, secondPlayer);
    multiPlayerForm.style.display = "none";
    ScreenUpdater(multiPlayerGameController);
  };

  const startSinglePlayerGame = (event) => {
    event.preventDefault();
    const playerName = document.querySelector("#player_name").value;
    const firstPlayer = Player(playerName, "X");
    const computerPlayer = Player("The Computer", "O");
    const singlePlayerGameController = GameController(
      firstPlayer,
      computerPlayer
    );
    singlePlayerForm.style.display = "none";
    ScreenUpdater(singlePlayerGameController, true);
  };
  setUpEventListeners();
};
inputManager();
