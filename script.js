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
      return 0;
    }
    if (maximizingPlayer) {
      let value = -10;
      if (gameHasFinished) {
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
    if (!gameHasFinished) switchPlayer();
    gameHasFinished = gameHasFinished ? false : false;
    isTie = isTie ? false : false;
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
  const messageContainer = document.querySelector(".final-message-container");
  const gameContainer = document.querySelector(".game-container");

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
    });
    setTimeout(updateGameMessage, 100);
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
  };

  const finishGameWithVictory = () => {
    const winner = gameController.getCurrentPlayerName();
    const messageContainer = document.querySelector(".final-message-container");
    const message = document.querySelector(".final-message-container p");
    message.textContent = `The Winner is ${winner}!!`;
    messageContainer.style.display = "flex";
    gameContainer.style.display = "none";
    board.removeEventListener("click", onCLickButtonHandler);
  };

  const finishGameWithTie = () => {
    const message = document.querySelector(".final-message-container p");
    message.textContent = `It's a Tie!!`;
    messageContainer.style.display = "flex";
    gameContainer.style.display = "none";
    board.removeEventListener("click", onCLickButtonHandler);
  };

  const resetGame = () => {
    const multiPlayerForm = document.querySelector(
      ".form-container.multi-player"
    );
    // gameInfo.style.display = "none";
    multiPlayerForm.style.display = "block";
    messageContainer.style.display = "none";
    gameContainer.style.display = "none";
    GameBoard.resetBoard();
    board.removeEventListener("click", onCLickButtonHandler);
  };

  board.addEventListener("click", onCLickButtonHandler);
  document.querySelector("#reset-btn").addEventListener("click", resetGame);
  document.querySelector("#new-btn").addEventListener("click", resetGame);
  updateScreen();
};

(function inputManager() {
  const singlePlayerButton = document.querySelector(".single_player_button");
  const multiPlayerForm = document.querySelector(
    ".form-container.multi-player"
  );
  const gameContainer = document.querySelector(".game-container");
  const setUpEventListeners = () => {
    singlePlayerButton.addEventListener("click", startSinglePlayerGame);
    multiPlayerForm.addEventListener("submit", (event) =>
      startMultiPlayerGame(event)
    );
  };

  const startMultiPlayerGame = (event) => {
    event.preventDefault();
    const firstPlayerName = document.querySelector("#player1_name").value;
    const secondPlayerName = document.querySelector("#player2_name").value;
    const firstPlayer = Player(firstPlayerName, "X");
    const secondPlayer = Player(secondPlayerName, "O");
    const multiPlayerGameController = GameController(firstPlayer, secondPlayer);
    multiPlayerForm.style.display = "none";
    document.querySelector(".board").style.display = "grid";
    gameContainer.style.display = "flex";
    ScreenUpdater(multiPlayerGameController);
  };

  const startSinglePlayerGame = () => {
    const firstPlayer = Player("Your", "X");
    const computerPlayer = Player("The Computer", "O");
    const singlePlayerGameController = GameController(
      firstPlayer,
      computerPlayer
    );
    multiPlayerForm.style.display = "none";
    gameContainer.style.display = "flex";
    ScreenUpdater(singlePlayerGameController, true);
  };
  setUpEventListeners();
})();
