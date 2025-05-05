const columnIndicator = document.getElementById("columnIndicator");
const pieceHolder = document.getElementById("pieceHolder");
const messageElement = document.getElementById("message");
const resetButton = document.getElementById("resetButton");
const pvpButton = document.getElementById("pvpButton");
const pvbButton = document.getElementById("pvbButton");
const favIcon = document.getElementById("favIcon");

window.onload = function() {
  // Start background music
  document.getElementById('music').play();
}
document.addEventListener('click', function playOnClick() {
  document.getElementById('music').play();
  document.removeEventListener('click', playOnClick);
});

const gameBoard = [];
let selectedPlayerMove = 3;
let gameStarted = false;
let playCD = false;
let playerTurn = true;
let playingBot = true;
let gameOver = false;

const pieceColors = {
  red: { textColor: "rgb(255, 0, 0)", outlineColor: "rgb(193, 0, 0)", backgroundColor: "rgb(125, 0 ,0)", pieceName: 'r' },
  yellow: { textColor: "rgb(255, 255, 0)", outlineColor: "rgb(193, 193, 0)", backgroundColor: "rgb(125, 125 ,0)", pieceName: 'y' },
}

let p1PieceColor = pieceColors.red;
let p2PieceColor = pieceColors.yellow;

function wait(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function setMessage(text, pieceColorData) {
  messageElement.style.opacity = 1;
  messageElement.textContent = text;
  messageElement.style.color = pieceColorData.textColor;
  messageElement.style.outline = `15px solid ${pieceColorData.outlineColor}`;
  messageElement.style.background = pieceColorData.backgroundColor;
}

function showWinLine(winLine) {
  const allPlayPieces = document.getElementsByClassName("gamePlayPiece");
  const allPlayPiecesLength = allPlayPieces.length;
  for (let i = 0; i < allPlayPiecesLength; i++) {
    const selectedPlayPiece = allPlayPieces[i];
    const row = parseInt(selectedPlayPiece.dataset.row);
    const column = parseInt(selectedPlayPiece.dataset.column);
    const winLineLength = winLine.length;
    let inWinLine = false;
    for (let j = 0; j < winLineLength; j++) {
      if (row == winLine[j][0] && column == winLine[j][1]) {
        inWinLine = true;
        break;
      }
    }
    if (!inWinLine) {
      selectedPlayPiece.style.transition = `${0.5}s linear`;
      selectedPlayPiece.style.filter = "brightness(25%)";
    }
  }
}

async function playerPlaceChip(row, column, myColorData, enemyColorData) {
  const newPiece = document.createElement("img")
  const imgPath = `./assets/${myColorData.pieceName}Piece.png`;
  favIcon.href = imgPath;
  newPiece.src = imgPath;
  newPiece.classList.add("gamePlayPiece");
  newPiece.style.left = `${column * 100}px`;
  newPiece.style.top = "0px";
  newPiece.dataset.row = row;
  newPiece.dataset.column = column;
  pieceHolder.appendChild(newPiece);
  newPiece.style.transition = `${0.125 * (row + 1)}s linear`;
  return new Promise(resolve => {
    setTimeout(() => {
      newPiece.style.top = `${(row + 1) * 106.6667}px`;
      columnIndicator.style.opacity = "0";
      const enemyImgPath = `./assets/${enemyColorData.pieceName}Piece.png`;
      favIcon.href = enemyImgPath;
      columnIndicator.src = enemyImgPath;
      setTimeout(() => {
        if (!playingBot) {
          columnIndicator.style.opacity = "1";
        }
        resolve();
      }, 500 + 0.125 * (row + 1));
    }, 100);
  })
}

async function botPlaceChip(row, column, myColorData, enemyColorData) {
  const newPiece = document.createElement("img")
  const imgPath = `./assets/${myColorData.pieceName}Piece.png`;
  favIcon.href = imgPath;
  newPiece.src = imgPath;
  newPiece.classList.add("gamePlayPiece");
  newPiece.style.left = "300px";
  newPiece.style.top = "0px";
  newPiece.dataset.row = row;
  newPiece.dataset.column = column;
  pieceHolder.appendChild(newPiece);
  newPiece.style.transition = `${Math.abs(column - 3) * 0.25}s linear`;
  return new Promise(resolve => {
    setTimeout(() => {
      newPiece.style.left = `${column * 100}px`
      setTimeout(() => {
        newPiece.style.transition = `${0.125 * (row + 1)}s linear`;
        setTimeout(() => {
          newPiece.style.top = `${(row + 1) * 106.6667}px`;
          columnIndicator.style.opacity = "0";
          const enemyImgPath = `./assets/${enemyColorData.pieceName}Piece.png`;
          favIcon.href = enemyImgPath;
          columnIndicator.src = enemyImgPath;
          setTimeout(() => {
            if (!playingBot) {
              columnIndicator.style.opacity = "1";
            }
            resolve();
          }, 500 + 0.125 * (row + 1));
        }, 100);
      }, (column != 3) ? (500 + Math.abs(column - 3) * 25) : 0);
    }, 100);
  })
}

function establishPlayerInput() {
  const columnDiv = document.getElementsByClassName("column");
  for (let i = 0; i < 7; i++) {
    columnDiv[i].addEventListener("mouseover", function () {
      columnIndicator.style.left = `${(i - 3) * 100}px`;
      selectedPlayerMove = i;
    });
    columnDiv[i].addEventListener("click", async function () {
      selectedPlayerMove = i;
      if (playCD) {
        return
      }
      gameStarted = true;
      if ((playingBot && playerTurn) || !playingBot) {
        const row = getRow(i);
        if (row == -1) {
          return;
        }
        playCD = true;
        const playPiece = (!playingBot ? (playerTurn ? 'P' : 'C') : 'P');
        gameBoard[row][i] = playPiece;
        await playerPlaceChip(row, i, (playerTurn ? p1PieceColor : p2PieceColor), (playerTurn ? p2PieceColor : p1PieceColor));
        const playerResults = won(playPiece);
        if (playerResults[0]) {
          columnIndicator.style.opacity = "1";
          showWinLine(playerResults[1]);
          const imgPath = `./assets/${p1PieceColor.pieceName}Piece.png`;
          favIcon.href = imgPath;
          columnIndicator.src = imgPath;
          if (playingBot) {
            setMessage('Player Won!', p1PieceColor);
          } else {
            setMessage(`Player${(playerTurn ? '2' : '1')} Won!`, (playerTurn ? p1PieceColor : p2PieceColor));
          }
          gameOver = true;
          return;
        }
        if (boardFull()) {
          playerTurn = true;
          columnIndicator.style.opacity = "1";
          const imgPath = `./assets/${p1PieceColor.pieceName}Piece.png`;
          favIcon.href = imgPath;
          columnIndicator.src = imgPath;
          gameOver = true;
          return;
        }
        playerTurn = !playerTurn;
        if (playingBot) {
          const results = botMove();
          await wait(1500);
          gameBoard[results[0]][results[1]] = 'C';
          await botPlaceChip(results[0], results[1], p2PieceColor, p1PieceColor);
          playerTurn = true;
          columnIndicator.style.opacity = "1";
          const botResults = won('C');
          if (botResults[0]) {
            showWinLine(botResults[1]);
            const imgPath = `./assets/${p1PieceColor.pieceName}Piece.png`;
            favIcon.href = imgPath;
            columnIndicator.src = imgPath;
            setMessage('Bot Won!', p2PieceColor);
            gameOver = true;
            return;
          }
          if (boardFull()) {
            const imgPath = `./assets/${p1PieceColor.pieceName}Piece.png`;
            favIcon.href = imgPath;
            columnIndicator.src = imgPath;
            gameOver = true;
            return;
          }
        }
        playCD = false;
      }
    });
  }
}

function makeGameBoard() {
  for (let i = 0; i < 6; i++) {
    gameBoard[i] = ['_', '_', '_', '_', '_', '_', '_'];
  }
}

function botMove() {
  function makeGameBoardCopy() {
    const gameBoardClone = [];
    for (let row = 0; row < 6; row++) {
      const tempRow = [];
      for (let column = 0; column < 7; column++) {
        tempRow[column] = gameBoard[row][column];
      }
      gameBoardClone[row] = tempRow;
    }
    return gameBoardClone;
  }
  function getPositionName(row, column) {
    const positionName = row.toString() + String.fromCharCode(column + 65);
    return positionName;
  }
  function getNextMoves(personalGameBoard, thisPieceType) {
    const allMoves = {};
    function assignPointsToPosition(row, column, points) {
      const sidePositionName = getPositionName(row, column);
      if (!(sidePositionName in allMoves)) {
        allMoves[sidePositionName] = 0;
      }
      allMoves[sidePositionName] += points;
    }
    function getPiece(row, column) {
      const piece = personalGameBoard[row][column];
      if (row != 5) {
        const supportingPiece = personalGameBoard[row + 1][column];
        if (supportingPiece == '_') {
          return 'N';
        }
      }
      return piece;
    }
    for (let column = 0; column < 7; column++) {
      if (personalGameBoard[5][column] == '_') {
        assignPointsToPosition(5, column, 1);
      }
    }
    for (let row = 0; row < 6; row++) {
      for (let column = 0; column < 7; column++) {
        const currentPieceType = getPiece(row, column);
        if (currentPieceType != 'N') {
          if (currentPieceType != '_') {
            const leftInGrid = (column - 1 != -1);
            const rightInGrid = (column + 1 != 7);
            if (!leftInGrid || !rightInGrid) {
              const useDif = (leftInGrid ? -1 : 1);
              if (getPiece(row, column + useDif) == '_') {
                assignPointsToPosition(row, column + useDif, 1);
              }
            } else {
              const leftPiece = getPiece(row, column - 1);
              const rightPiece = getPiece(row, column + 1);
              if (leftPiece == rightPiece && leftPiece == currentPieceType) {
                const farLeftInGrid = (column - 2 > -1);
                const farRightInGrid = (column + 2 < 7);
                const farLeftPiece = (farLeftInGrid ? getPiece(row, column - 2) : 'N');
                const farRightPiece = (farRightInGrid ? getPiece(row, column + 2) : 'N');
                if (farRightPiece == farRightPiece && farLeftPiece == '_') {
                  assignPointsToPosition(row, column - 2, 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                  assignPointsToPosition(row, column + 2, 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                } else if (farLeftPiece == '_' || farRightPiece == '_') {
                  const useDif = (farLeftPiece == '_' ? -2 : 2);
                  assignPointsToPosition(row, column + useDif, 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                }
              }
              if (leftPiece == currentPieceType && rightPiece == '_') {
                assignPointsToPosition(row, column + 1, 10);
              }
              if (rightPiece == currentPieceType && leftPiece == '_') {
                assignPointsToPosition(row, column - 1, 10);
              }
              else if (leftPiece == '_' || rightPiece == '_') {
                if (leftPiece == rightPiece) {
                  assignPointsToPosition(row, column - 1, 1);
                  assignPointsToPosition(row, column + 1, 1);
                } else {
                  const useDif = (leftPiece == '_' ? -1 : 1);
                  assignPointsToPosition(row, column + useDif, 1);
                }
              }
            }
          }
          const TLBRLine = {};
          const BLTRLine = {};
          for (let i = -3; i < 4; i++) {
            if (i == 0) {
              const position = [row, column];
              const pieceData = [currentPieceType, position];
              TLBRLine[0] = pieceData;
              BLTRLine[0] = pieceData;
              continue;
            }
            if (row + i > -1 && row + i < 6 && column + i > -1 && column + i < 7) {
              const position = [row + i, column + i];
              const pieceData = [getPiece(row + i, column + i), position];
              TLBRLine[i] = pieceData;
            }
            if (row - i > -1 && row - i < 6 && column + i > -1 && column + i < 7) {
              const position = [row - i, column - i];
              const pieceData = [getPiece(row - i, column - i), position];
              BLTRLine[i] = pieceData;
            }
          }
          const diagonals = [TLBRLine, BLTRLine];
          for (let i = 0; i < 2; i++) {
            const leftDiagonalInGrid = (-1 in diagonals[i] && diagonals[i][-1][0] != 'N');
            const rightDiagonalInGrid = (1 in diagonals[i] && diagonals[i][1][0] != 'N');

            if (!leftDiagonalInGrid && !rightDiagonalInGrid) {
              continue;
            }
            else {
              if (diagonals[i][-1] && diagonals[i][1] && diagonals[i][-1][0] == diagonals[i][1][0] && diagonals[i][-1][0] == currentPieceType) {
                let farLeftDiagonalInGrid = (-2 in diagonals[i] && diagonals[i][-2][0] != 'N');
                let farRightDiagonalInGrid = (2 in diagonals[i] && diagonals[i][2][0] != 'N');

                if (!farLeftDiagonalInGrid && !farRightDiagonalInGrid) {
                  continue;
                }
                if (((!farLeftDiagonalInGrid || (farLeftDiagonalInGrid && diagonals[i][-2][0] != currentPieceType)) && farRightDiagonalInGrid && diagonals[i][2][0] == '_') || (farLeftDiagonalInGrid && diagonals[i][-2][0] == '_' && (!farRightDiagonalInGrid || (farRightDiagonalInGrid && diagonals[i][2][0] != currentPieceType)))) {
                  const useDif = ((!farLeftDiagonalInGrid || (farLeftDiagonalInGrid && (diagonals[i][-2][0] == 'N' || diagonals[i][-2][0] == (currentPieceType == 'P' ? 'C' : 'P')))) ? 2 : -2);
                  const position = diagonals[i][useDif][1];
                  assignPointsToPosition(position[0], position[1], 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                } else if (farLeftDiagonalInGrid && farRightDiagonalInGrid && diagonals[i][-2][0] == diagonals[i][2][0] && diagonals[i][-2][0] == '_') {
                  const farLeftPosition = diagonals[i][-2][1];
                  const farRightPosition = diagonals[i][2][1];
                  assignPointsToPosition(farLeftPosition[0], farLeftPosition[1], 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                  assignPointsToPosition(farRightPosition[0], farRightPosition[1], 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                }
              }
            }
          }
          if (column < 4) {
            const endPiece = getPiece(row, column + 3);
            if (endPiece == currentPieceType) {
              const secondPiece = getPiece(row, column + 1);
              const thirdPiece = getPiece(row, column + 2);
              if (secondPiece == thirdPiece && secondPiece == '_') {
                assignPointsToPosition(row, column + 1, 10);
                assignPointsToPosition(row, column + 2, 10);
              } else if (secondPiece == '_' || thirdPiece == '_') {
                const useDif = (secondPiece == '_' ? 1 : 2);
                assignPointsToPosition(row, column + useDif, 10);
              }
            }
          }
        } else {
          const leftInGrid2 = (column - 1 != -1);
          const rightInGrid2 = (column + 1 != 7);
          if (leftInGrid2 && rightInGrid2) {
            const leftPiece2 = getPiece(row, column - 1);
            const rightPiece2 = getPiece(row, column + 1);
            if (leftPiece2 == rightPiece2 && leftPiece2 != '_' && leftPiece2 != 'N') {
              assignPointsToPosition(row, column, 9);
            }
          }
        }
      }
    }
    for (let column = 0; column < 7; column++) {
      let sameTypeCounter = 0;
      let previousPieceType = 'N';
      for (let row = 5; row >= 0; row--) {
        const currentPieceType = personalGameBoard[row][column];
        if (currentPieceType != '_') {
          if (previousPieceType != currentPieceType) {
            sameTypeCounter = 1;
          } else {
            sameTypeCounter += 1;
          }
          previousPieceType = currentPieceType;
        } else {
          if (sameTypeCounter != 0) {
            assignPointsToPosition(row, column, (10 ** (-1 + sameTypeCounter)) * ((currentPieceType == thisPieceType && sameTypeCounter == 3) ? 10 : 1));
          }
          break;
        }
      }
    }
    return allMoves;
  }
  const allMoves = getNextMoves(gameBoard, 'C');
  const sortedMovesByPoints = {};
  for (let [position, points] of Object.entries(allMoves)) {
    if (points in sortedMovesByPoints) {
      sortedMovesByPoints[points].push(position);
    } else {
      sortedMovesByPoints[points] = [position];
    }
  }
  let foundSafeMove = false;
  let firstBestMove = "";
  const sortedPoints = Object.keys(sortedMovesByPoints).map(Number).sort((a, b) => b - a);
  for (let i = 0; i < sortedPoints.length; i++) {
    if (foundSafeMove) {
      break;
    }
    const point = sortedPoints[i];
    const samePointsMove = sortedMovesByPoints[point];
    while (samePointsMove.length > 0) {
      const randomMoveIndex = Math.floor(Math.random() * samePointsMove.length);
      const selectedMove = samePointsMove[randomMoveIndex];
      if (firstBestMove == "") {
        firstBestMove = selectedMove;
      }
      const row = parseInt(selectedMove[0]);
      const column = selectedMove[1].charCodeAt(0) - 65;
      const gameBoardCopy = makeGameBoardCopy();
      const allNextMoves = getNextMoves(gameBoardCopy, 'P');
      let safeMove = true;
      for (let movePoints of Object.values(allNextMoves)) {
        if (movePoints >= 90) {
          safeMove = false;
          break;
        }
      }
      if (safeMove) {
        foundSafeMove = true;
        return [row, column];
      } else {
        samePointsMove.splice(randomMoveIndex, 1);
      }
    }
  }
  if (!foundSafeMove) {
    const row = parseInt(firstBestMove[0]);
    const column = firstBestMove[1].charCodeAt(0) - 65;
    return [row, column];
  }
}

function boardFull() {
  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 7; column++) {
      if (gameBoard[row][column] == '_') {
        return false;
      }
    }
  }
  return true;
}

function won(currentPieceType) {
  let winLine = [];
  for (let row = 0; row < 6; row++) {
    let matches = 0;
    for (let column = 0; column < 7; column++) {
      const sameType = gameBoard[row][column] == currentPieceType;
      if (sameType) {
        matches++;
        winLine.push([row, column]);
      } else {
        matches = 0;
        winLine = [];
      }
      if (matches == 4) {
        return [true, winLine];
      }
    }
  }
  for (let column = 0; column < 7; column++) {
    let matches = 0;
    for (let row = 5; row >= 0; row--) {
      const sameType = gameBoard[row][column] == currentPieceType;
      if (sameType) {
        matches++;
        winLine.push([row, column]);
      } else {
        matches = 0;
        winLine = [];
      }
      if (matches == 4) {
        return [true, winLine];
      }
    }
  }
  for (let p = 0; p < 6; p++) {
    const rightRow = ((p + 3) > 5 ? 5 : p + 3);
    const rightColumn = ((p - 2) < 0 ? 0 : p - 2);
    const leftRow = ((p - 3) > 0 ? 8 - p : 5);
    const leftColumn = ((p + 3) < 6 ? p + 3 : 6);
    const duration = ((p + 4) < 7 ? p + 4 : 9 - p);
    let rightMatches = 0;
    let leftMatches = 0;
    let rightWinLine = [];
    let leftWinLine = [];
    for (let i = 0; i < duration; i++) {
      if (gameBoard[rightRow - i][rightColumn + i] == currentPieceType) {
        rightWinLine.push([rightRow - i, rightColumn + i]);
        if (rightMatches == 3) {
          return [true, rightWinLine];
        }
        rightMatches += 1;
      } else {
        rightMatches = 0;
        rightWinLine = [];
      }
      if (gameBoard[leftRow - i][leftColumn - i] == currentPieceType) {
        leftWinLine.push([leftRow - i, leftColumn - i]);
        if (leftMatches == 3) {
          return [true, leftWinLine];
        }
        leftMatches += 1;
      } else {
        leftMatches = 0;
        leftWinLine = [];
      }
    }
  }
  return [false, null];
}

function getRow(column) {
  let row = 5;
  do {
    let pieceAtPosition = gameBoard[row][column];
    if (pieceAtPosition == '_') {
      return row;
    }
    row--;
  } while (row > -1);
  return -1;
}

function cat() {
  let catString = "";
  document.addEventListener("keydown", function (event) {
    const key = event.key.toLowerCase();
    if ("cat".includes(key) && !(catString.includes(key))) {
      catString += key;
      const catStringLength = catString.length;
      if (catStringLength >= 1) {
        if (catString[0] == 'c') {
          if (catStringLength >= 2) {
            if (catString[1] == 'a') {
              if (catStringLength == 3) {
                if (catString[2] == 't') {
                  const allPlayPieces = document.getElementsByClassName("gamePlayPiece");
                  const allPlayPiecesLength = allPlayPieces.length;
                  for (let i = 0; i < allPlayPiecesLength; i++) {
                    const selectedPlayPiece = allPlayPieces[i];
                    if (!selectedPlayPiece.src.includes("catPiece")) {
                      selectedPlayPiece.src = "./assets/catPiece.png";
                      break;
                    }
                    catString = "";
                  }
                } else {
                  catString = "";
                }
              }
            } else {
              catString = "";
            }
          }
        } else {
          catString = "";
        }
      }
    } else {
      catString = "";
    }
  });
}

resetButton.addEventListener("click", function () {
  if (!playCD || gameOver) {
    playCD = true;
    messageElement.style.opacity = 0;
    messageElement.textContent = '';
    gameOver = false;
    const allPlayPieces = document.getElementsByClassName("gamePlayPiece");
    const allPlayPiecesLength = allPlayPieces.length;
    for (let i = allPlayPiecesLength - 1; i >= 0; i--) {
      const selectedPlayPiece = allPlayPieces[i];
      pieceHolder.removeChild(selectedPlayPiece);
    }
    columnIndicator.src = `./assets/${p1PieceColor.pieceName}Piece.png`;
    gameBoard.splice(0, gameBoard.length);
    makeGameBoard();
    gameStarted = false;
    playerTurn = true;
    playCD = false;
  }
});

pvpButton.addEventListener("click", function() {
  if (!gameStarted) {
    playingBot = false;
    pvpButton.style.filter = "brightness(50%)";
    pvbButton.style.filter = "brightness(100%)";
  }
});

pvbButton.addEventListener("click", function() {
  if (!gameStarted) {
    playingBot = true;
    pvbButton.style.filter = "brightness(50%)";
    pvpButton.style.filter = "brightness(100%)";
  }
});

cat();
columnIndicator.src = `./assets/${p1PieceColor.pieceName}Piece.png`;
establishPlayerInput();
makeGameBoard();
