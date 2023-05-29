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

  const alreadyOcuppied = (index) => gameState[index].getValue() !== "";

  return { playerChose, getBoard, printBoard, alreadyOcuppied };
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
        //This function would've been far better with a matriz-like
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

  return { playRound, getCurrentPLayer, getGameStatus, getTieStatus };
};

const ScreenUpdater = function (gameController) {
  const board = document.querySelector(".board");

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

  board.addEventListener("click", onCLickButtonHandler);
  updateScreen();
};

const inputManager = function () {
  const setUpEventListeners = () => {
    const singlePlayerButton = document.querySelector(".single_player_button");
    const multiPlayerButton = document.querySelector(".multi_player_button");
    // const singlePlayerForm = document.querySelector(
    //   ".single-player-form-container form"
    // );
    const multiPlayerForm = document.querySelector(
      ".form-container.multi-player"
    );

    singlePlayerButton.addEventListener("click", displaySinglePlayerForm);
    multiPlayerButton.addEventListener("click", displayMultiplayerForm);
    // singlePlayerForm.addEventListener("submit", startSinglePlayerGame);
    multiPlayerForm.addEventListener("submit", (event) =>
      startMultiPlayerGame(event)
    );
  };
  const displayMultiplayerForm = () => {
    const multiPlayerFormContainer = document.querySelector(
      ".form-container.multi-player"
    );
    const singlePlayerFormContainer = document.querySelector(
      ".form-container.single-player"
    );
    multiPlayerFormContainer.style.display = "block";
    singlePlayerFormContainer.style.display = "none";
  };
  const displaySinglePlayerForm = () => {
    const multiPlayerFormContainer = document.querySelector(
      ".form-container.multi-player"
    );
    const singlePlayerFormContainer = document.querySelector(
      ".form-container.single-player"
    );
    multiPlayerFormContainer.style.display = "none";
    singlePlayerFormContainer.style.display = "block";
  };

  const startMultiPlayerGame = (event) => {
    event.preventDefault();
    const firstPlayerName = document.querySelector("#player1_name").value;
    const secondPlayerName = document.querySelector("#player2_name").value;
    const firstPlayer = Player(firstPlayerName, "X");
    const secondPlayer = Player(secondPlayerName, "O");
    const multiPlayerGameController = GameController(firstPlayer, secondPlayer);
    ScreenUpdater(multiPlayerGameController);
  };
  setUpEventListeners();
};
inputManager();
