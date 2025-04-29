const gameBoard = [];

function makeGameBoard() {
    for (let i = 0; i < 6; i++) {
        const column = ['_', '_', '_', '_', '_', '_', '_'];
        gameBoard[i] = column;
    }
};

function botMove() {
    function cloneGameBoard() {
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
        const positionName = row.charCodeAt(0) + String.fromCharCode(column + 65);
        return positionName;
    }

    function getNextMoves(thisPieceType) {
        const allMoves = {};

        function assignPointsToPosition(row, column, points) {
            const sidePositionName = getPositionName(row, column)
            if (sidePositionName in allMoves) {
                allMoves[sidePositionName] = points;
            } else {
                allMoves[sidePositionName] += points;
            }
        }

        function getPiece(row, column) {
            const piece = gameBoard[row][column];
            if (row != 5) {
                const supportingPiece = gameBoard[row+1][column];
                if (supportingPiece == '_') {
                    return 'N';
                }
            }
            return piece;
        }

        for (let column = 0; column < 7; column++) {
            if (gameBoard[5][column] == '_') {
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
                            } else if ((leftPiece == currentPieceType && rightPiece == '_') || (rightPiece == currentPieceType && leftPiece == '_')) { 
                                assignPointsToPosition(row, column + (leftPiece == currentPieceType ? 1 : -1), 10);
                            } else if (leftPiece == '_' || rightPiece == '_') {
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
                        let leftDiagonalInGrid = (-1 in diagonals[i] && diagonals[i][-1][0] != 'N');
                        let rightDiagonalInGrid = (1 in diagonals[i] && diagonals[i][1][0] != 'N');
                        if (!leftDiagonalInGrid && !rightDiagonalInGrid) {
                            continue;
                        } else if (!leftDiagonalInGrid || !rightDiagonalInGrid) {
                            const useDif = (!leftDiagonalInGrid ? 1 : -1);
                            const position = diagonals[i][useDif][1];
                            if (getPiece(position[0], position[1]) == '_') {
                                assignPointsToPosition(position[0], position[1], 1);
                            }
                        } else {
                            if (diagonals[i][-1][0] == diagonals[i][1][0] && diagonals[i][-1][0] == currentPieceType) {
                                let farLeftDiagonalInGrid = (-2 in diagonals[i] && diagonals[i][-2][0] != 'N');
                                let farRightDiagonalInGrid = (2 in diagonals[i] && diagonals[i][2][0] != 'N');

                                if (!farLeftDiagonalInGrid && !farRightDiagonalInGrid) {
                                    continue;
                                }
                                if (((!farLeftDiagonalInGrid || farLeftDiagonalInGrid && diagonals[i][-2][0] != currentPieceType) && farRightDiagonalInGrid && diagonals[i][2][0] == '_') || (farLeftDiagonalInGrid && diagonals[i][-2][0] == '_' && (!farRightDiagonalInGrid || farRightDiagonalInGrid && diagonals[i][2][0] != currentPieceType))) {
                                    const useDif = ((!farLeftDiagonalInGrid || farLeftDiagonalInGrid && (diagonals[i][-2][0] == 'N' || diagonals[i][-2][0] == (currentPieceType == 'P' ? 'C' : 'P'))) ? 2 : -2);
                                    const position =  diagonals[i][useDif][1];
                                    assignPointsToPosition(position[0], position[1], 100 * (currentPieceType == thisPieceType ? 10 : 1)  - 10);
                                } else if (farLeftDiagonalInGrid && farRightDiagonalInGrid && diagonals[i][-2][0] == diagonals[i][2][0] && diagonals[i][-2][0] == '_') {
                                    const farLeftPosition = diagonals[i][-2][0];
                                    const farRightPosition = diagonals[i][2][0];
                                    assignPointsToPosition(farLeftPosition[0], farLeftPosition[1], 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                                    assignPointsToPosition(farRightPosition[0], farRightPosition[1], 100 * (currentPieceType == thisPieceType ? 10 : 1)  - 10);
                                }
                            } else if (diagonals[i][-1][0] == currentPieceType || diagonals[i][1][0] == currentPieceType) {
                                const useDif = (diagonals[i][-1][0] == currentPieceType ? 2 : -2);
                                if (diagonals[i][useDif/2][0] == '_') {
                                    const farDiagonalInGrid = (useDif in diagonals[i] && diagonals[i][useDif][0] != 'N');
                                    const position = diagonals[i][useDif/2][1];
                                    if (farDiagonalInGrid && (diagonals[i][useDif][0] == '_' || diagonals[i][useDif][0] == currentPieceType)) {
                                        assignPointsToPosition(position[0], position[1], 100 * (currentPieceType == thisPieceType ? 10 : 1) - 10);
                                    } else {
                                        assignPointsToPosition(position[0], position[1], 1);
                                    }
                                }
                            } else if (diagonals[i][-1][0] == '_' || diagonals[i][1][0] == '_') {
                                if (diagonals[i][-1][0] == diagonals[i][1][0]) {
                                    const leftPosition = diagonals[i][-1][1];
                                    const rightPosition = diagonals[i][1][1];
                                    assignPointsToPosition(leftPosition[0], leftPosition[1], 1);
                                    assignPointsToPosition(rightPosition[0], rightPosition[1], 1);
                                } else {
                                    const useDif = (diagonals[i][-1][0] == '_' ? -1 : 1);
                                    const position = diagonals[i][useDif][1];
                                    assignPointsToPosition(position[0], position[1], 1);
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
                    const leftInGrid = (column - 1 != -1);
                    const rightInGrid = (column + 1 != 7);
                    if (leftInGrid && rightInGrid) {
                        const leftPiece = getPiece(row, column - 1);
                        const rightPiece = getPiece(row, column + 1);
                        if (leftPiece == rightPiece && leftPiece != '_' && leftPiece != 'N') {
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
                const currentPieceType = gameBoard[row][column];
                if (currentPieceType != '_') {
                    if (previousPieceType != currentPieceType) {
                        sameTypeCounter = 1;
                    } else {
                        sameTypeCounter += 1;
                    }
                } else {
                    if (sameTypeCounter != 0) {
                        assignPointsToPosition(row, column, (10 ** (-1+sameTypeCounter)) * ((currentPieceType == thisPieceType && sameTypeCounter == 3)  ? 10 : 1));
                    }
                    break;
                }
            }
        }

        return allMoves;
    }

    const allMoves = getNextMoves('C');

    const sortedMovesByPoints = {};
    for (let pair of allMoves) {
        if (pair[1] in sortedMovesByPoints) {
            sortedMovesByPoints[pair[1]].push(pair[0]);
        } else {
            sortedMovesByPoints[pair[1]] = [pair[1], [pair[0]]];
        }
    }

    let foundSafeMove = false;
    let firstBestMove = "";
    const sortedMovesByPointsLength = sortedMovesByPoints.length;
    for (let i = 0; i < sortedMovesByPoints; i++) {
        if (foundSafeMove) {
            break;
        }
        const it = sortedMovesByPoints[sortedMovesByPointsLength];
        const samePointsMove = sortedMovesByPoints[it[0]];
        while (samePointsMove.length > 0) {
            
        }
    }
}