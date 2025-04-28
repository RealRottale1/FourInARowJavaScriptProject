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

    function getNextMoves(thisPieceType) {
        const allMoves = {};

        function getPositionName(row, column) {
            const positionName = row.charCodeAt(0) + String.fromCharCode(column + 65);
            return positionName;
        }

        function assignPointsToPosition(row, column, points) {
            const sidePositionName = getPositionName(row, column)
            if (sidePositionName in allMoves) {
                allMoves[sidePositionName] = points;
            } else {
                allMoves[sidePositionName] += points;
            }
        }

        for (let column = 0; column < 7; column++) {
            if (gameBoard[5][column] == '_') {
                assignPointsToPosition(5, column, 1);
            }
        }
    }

    const allMoves = getNextMoves('C');
}