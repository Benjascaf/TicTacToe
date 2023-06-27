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

  const resetBoard = () => gameState.forEach((cell) => cell.changeValue(""));

  //Need this to then project posible board states
  const resetCell = (index) => gameState[index].changeValue("");

  const alreadyOcuppied = (index) => gameState[index].getValue() !== "";

  return {
    playerChose,
    getBoard,
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
  let gameHasFinished = false;
  let isTie = false;

  const switchPlayer = () => {
    currPlayer = currPlayer === player1 ? player2 : player1;
  };

  const getCurrentPlayerName = () => currPlayer.getPlayerName();
  const getGameStatus = () => gameHasFinished;
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
        return (
          emptySpaces.length == 0 &&
          !(checkRows() || checkDiagonals() || checkColumns())
        );
      };
      return { checkColumns, checkRows, checkForTie, checkDiagonals };
    })();
    gameHasFinished =
      Checker.checkRows() ||
      Checker.checkColumns() ||
      Checker.checkDiagonals() ||
      Checker.checkForTie();
    isTie = Checker.checkForTie();
  };

  const playRound = (playerMove) => {
    if (GameBoard.alreadyOcuppied(playerMove)) return;
    GameBoard.playerChose(currPlayer.getPlayerToken(), playerMove);
    checkGameState();
    if (!gameHasFinished) switchPlayer();
  };

  const playAsComputer = () => {
    let validPlays = getValidPlays();
    let bestMove = validPlays[0];
    let currentValue = 10;
    validPlays.forEach((index) => {
      playRound(index);
      let currMoveValue = minimax(getValidPlays(), 0, true);
      if (getCurrentPlayerName() === "The Computer") {
        console.log("el error ocurrio con", index);
      }
      if (currMoveValue < currentValue) {
        currentValue = currMoveValue;
        bestMove = index;
      }
      resetPlay(index);
    });
    playRound(bestMove);
  };

  const minimax = (validPlays, depth, maximizingPlayer) => {
    if (isTie) {
      //if the game finishes, gameController's playRound function
      //won't switch players back, so I have to do it here so that
      //the "simulated states" don't affect the actual game
      //(Check how to fix on a better manner)
      switchPlayer();
      return 0;
    }
    if (maximizingPlayer) {
      let value = -10;
      if (gameHasFinished) {
        switchPlayer();
        return depth + value;
      }
      validPlays.forEach((index) => {
        playRound(index);
        value = Math.max(value, minimax(getValidPlays(), depth + 1, false));
        resetPlay(index);
      });
      return value;
    } else {
      let value = 10;
      if (gameHasFinished) {
        switchPlayer();
        return value - depth;
      }
      validPlays.forEach((index) => {
        playRound(index);
        value = Math.min(value, minimax(getValidPlays(), depth + 1, true));
        resetPlay(index);
      });
      return value;
    }
  };

  //Need this to go back after projecting possible board states
  const resetPlay = (index) => {
    GameBoard.resetCell(index);
    //if the play led to a terminal state, change it back
    gameHasFinished = gameHasFinished ? false : false;
    isTie = isTie ? false : false;
    switchPlayer();
  };

  const getValidPlays = () => {
    let validPlays = [];
    for (let i = 0; i < 9; i++) {
      if (!GameBoard.alreadyOcuppied(i)) {
        validPlays.push(i);
      }
    }
    return validPlays;
  };

  const isValidPlay = (index) => {
    return index in getValidPlays();
  };

  return {
    playRound,
    getCurrentPlayerName,
    getGameStatus,
    getTieStatus,
    resetPlay,
    getValidPlays,
    switchPlayer,
    playAsComputer,
    isValidPlay,
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
    if (
      isSinglePlayerGame &&
      !gameController.getGameStatus() &&
      gameController.getCurrentPlayerName() === "The Computer"
    ) {
      gameController.playAsComputer();
    }
    updateScreen();
  };

  const updateGameMessage = () => {
    if (gameController.getTieStatus()) {
      finishGameWithTie();
      return;
    } else if (gameController.getGameStatus()) {
      finishGameWithVictory();
      return;
    }
    const messageContainer = document.querySelector(".game-messages");
    messageContainer.textContent = `It's ${gameController.getCurrentPlayerName()}'s turn`;
  };

  const finishGameWithVictory = () => {
    const winner = gameController.getCurrentPlayerName();
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

(function inputManager() {
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
})();
