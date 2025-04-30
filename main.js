const gameBoard = [];
let selectedPlayerMove = 3;
let playerTurn = true;

function establishPlayerInput() {
  const columnIndicator = document.getElementById("columnIndicator");
  const columnDiv = document.getElementsByClassName("column");
  for (let i = 0; i < 7; i++) {
    columnDiv[i].addEventListener("mouseover", function() {
      columnIndicator.style.left = `${(i-3) * 100}px`;
      selectedPlayerMove = i;
    });
    columnDiv[i].addEventListener("click", function() {
      if (playerTurn) {
        const row = getRow(i);
        if (row == -1) {
          return;
        }
        playerTurn = false
        gameBoard[row][i] = 'P';
        const results = botMove();
        gameBoard[results[0]][results[1]] = 'C';
        playerTurn = true;
        console.log(gameBoard)
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
  for (let row = 0; row < 6; row++) {
    let matches = 0;
    for (let column = 0; column < 7; column++) {
      matches = (gameBoard[row][column] == currentPieceType ? matches + 1 : 0);
      if (matches == 4) {
        return true;
      }
    }
  }
  for (let column = 0; column < 6; column++) {
    let matches = 0;
    for (let row = 5; row >= 0; row--) {
      matches = (gameBoard[row][column] == currentPieceType ? matches + 1 : 0);
      if (matches == 4) {
        return true;
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
    for (let i = 0; i < duration; i++) {
      if (gameBoard[rightRow - i][rightColumn + i] == currentPieceType) {
        if (rightMatches == 3) {
          return true;
        }
        rightMatches += 1;
      } else {
        rightMatches = 0;
      }
      if (gameBoard[leftRow - i][leftColumn - i] == currentPieceType) {
        if (leftMatches == 3) {
          return true;
        }
        leftMatches += 1;
      } else {
        leftMatches = 0;
      }
    }
  }
  return false;
}

function getRow(column) {
  let row = 5;
  do {
    let pieceAtPosition = gameBoard[row][column];
    console.log(pieceAtPosition)
    if (pieceAtPosition == '_') {
      return row;
    }
    row--;
  } while (row > -1);
  return -1;
}

establishPlayerInput();
makeGameBoard();
