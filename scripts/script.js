const black = 'Black', white = 'White';
const pawn = 'Pawn', rook = 'Rook', knight = 'Knight', bishop = 'Bishop', queen = 'Queen', king = 'King';

const images = {
    white: {
        pawn: "url('../assets/whitepawn.png')",
        rook: "url('../assets/whiterook.png')",
        knight: "url('../assets/whiteknight.png')",
        bishop: "url('../assets/whitebishop.png')",
        queen: "url('../assets/whitequeen.png')",
        king: "url('../assets/whiteking.png')",
    },
    black: {
        pawn: "url('../assets/blackpawn.png')",
        rook: "url('../assets/blackrook.png')",
        knight: "url('../assets/blackknight.png')",
        bishop: "url('../assets/blackbishop.png')",
        queen: "url('../assets/blackqueen.png')",
        king: "url('../assets/blackking.png')",
    }
}
function oppositeOfSide(side) {
    return (side === black) ? white : black;
}
function startGame() {
    class Board {
        constructor() {
            this.selectedCell;
            this.history = [];
            this.moveCount;
            this.cells = [];
            this.promotionChoiceCells = [];
            this.promotionChoicesDiv;
            this.selectGameModeDiv;
            this.currentTurn;
            this.status;
            this.gameMode;
            this.computerSide = black;
            this.isCompleted;
            for (let i = 0; i < 10; i++) this.cells.push(new Array(9));
            for (let i = 8; i >= 1; i--) {
                for (let j = 1; j <= 8; j++) {
                    this.cells[i][j] = new Cell(i, j);
                }
            }
        }

        setGUI() {
            let main = document.createElement('div');

            let boardDiv = document.createElement('div');

            let menu = document.createElement('div');
            let undoBtn = document.createElement('button');
            let redoBtn = document.createElement('button');
            let resetBtn = document.createElement('button');

            let statusDiv = document.createElement('div');
            this.status = document.createElement('span');

            this.selectGameModeDiv = document.createElement('div');
            this.promotionChoicesDiv = document.createElement('div');

            main.classList.add('main');

            boardDiv.classList.add('board');

            menu.classList.add('menu');
            undoBtn.classList.add('menuBtn');
            redoBtn.classList.add('menuBtn');
            resetBtn.classList.add('menuBtn');

            statusDiv.classList.add('statusDiv');
            this.status.classList.add('status');

            this.selectGameModeDiv.classList.add('selectGameModeDiv');
            this.promotionChoicesDiv.classList.add('promotionChoicesDiv');

            let gameModeBtn = [];
            for (let i = 0; i < 5; i++) {
                gameModeBtn.push(document.createElement('button'));
                gameModeBtn[i].classList.add('selectGameModeBtn');
                gameModeBtn[i].addEventListener('click', () => {
                    this.gameMode = i;
                    this.selectGameModeDiv.style.display = 'none';
                    this.performOnAllCells((cell) => cell.disableStatus(false));
                    if (this.gameMode === 4 || (this.gameMode < 3 && this.computerSide === white)) this.autoMove(white);

                });
                this.selectGameModeDiv.appendChild(gameModeBtn[i]);
            }

            this.status.innerHTML = 'Testing';
            undoBtn.innerHTML = "UNDO";
            redoBtn.innerHTML = "REDO";
            resetBtn.innerHTML = "RESET";
            gameModeBtn[0].innerHTML = 'Player vs Computer(Stupid)';
            gameModeBtn[1].innerHTML = 'Player vs Computer(Easy)';
            gameModeBtn[2].innerHTML = 'Player vs Computer(Medium)';
            gameModeBtn[3].innerHTML = 'Player vs Player';
            gameModeBtn[4].innerHTML = 'Computer vs Computer';

            undoBtn.addEventListener('click', () => {
                if (this.isCompleted)
                    this.undo();
                else {
                    if (this.gameMode != 4)
                        this.undo();
                    if (this.gameMode < 3 && this.currentTurn === black) {
                        this.undo();
                    }
                }
            });
            redoBtn.addEventListener('click', () => {
                if (this.isCompleted)
                    this.redo();
                else {
                    if (this.gameMode != 4)
                        this.redo();
                    if (this.gameMode < 3 && this.currentTurn === black) {
                        this.redo();
                    }
                }
            });
            resetBtn.addEventListener('click', () => {
                this.resetBoard();
            });

            menu.appendChild(undoBtn);
            menu.appendChild(redoBtn);
            menu.appendChild(resetBtn);

            statusDiv.appendChild(this.status);

            for (let i = 0; i < 10; i++) this.cells.push(new Array(9));

            for (let i = 8; i >= 1; i--) {
                let rowDiv = document.createElement('div');
                rowDiv.classList.add('rowDiv');
                for (let j = 1; j <= 8; j++) {
                    let cellDiv = document.createElement('div');
                    this.cells[i][j].elt = document.createElement('button');
                    if ((i + j) % 2 === 1) cellDiv.classList.add('whiteCell');
                    if ((i + j) % 2 === 0) cellDiv.classList.add('blackCell');
                    this.cells[i][j].elt.classList.add('piece');

                    cellDiv.appendChild(this.cells[i][j].elt);
                    rowDiv.appendChild(cellDiv);
                    this.cells[i][j].addOnClickFunction();
                }
                boardDiv.appendChild(rowDiv);
            }

            for (let i = 0; i < 4; i++) {
                let cellDiv = document.createElement('div');
                this.promotionChoiceCells[i] = document.createElement('button');
                if (i % 2 === 0) cellDiv.classList.add('whiteCell');
                if (i % 2 === 1) cellDiv.classList.add('blackCell');
                this.promotionChoiceCells[i].classList.add('piece');
                cellDiv.appendChild(this.promotionChoiceCells[i]);
                this.promotionChoicesDiv.appendChild(cellDiv);
            }
            this.selectGameModeDiv.style.display = 'none';
            this.promotionChoicesDiv.style.display = 'none';
            boardDiv.appendChild(this.selectGameModeDiv);
            boardDiv.appendChild(this.promotionChoicesDiv);

            main.appendChild(menu);
            main.appendChild(boardDiv);
            main.appendChild(statusDiv);
            document.body.appendChild(main);
        }

        resetBoard() {
            this.isCompleted = false;
            this.history = [];
            this.moveCount = 0;
            this.currentTurn = white;
            this.performOnAllCells((cell) => {
                cell.disableStatus(true);
                cell.unoccupy();
            });
            for (let i = 1; i <= 8; i++) {
                this.cells[2][i].occupyPiece(new Piece(white, pawn, this.cells[2][i]));
                this.cells[7][i].occupyPiece(new Piece(black, pawn, this.cells[7][i]));
            }
            this.cells[8][1].occupyPiece(new Piece(black, rook, this.cells[8][1]));
            this.cells[8][8].occupyPiece(new Piece(black, rook, this.cells[8][8]));
            this.cells[1][1].occupyPiece(new Piece(white, rook, this.cells[1][1]));
            this.cells[1][8].occupyPiece(new Piece(white, rook, this.cells[1][8]));

            this.cells[8][2].occupyPiece(new Piece(black, knight, this.cells[8][2]));
            this.cells[8][7].occupyPiece(new Piece(black, knight, this.cells[8][7]));
            this.cells[1][2].occupyPiece(new Piece(white, knight, this.cells[1][2]));
            this.cells[1][7].occupyPiece(new Piece(white, knight, this.cells[1][7]));

            this.cells[8][3].occupyPiece(new Piece(black, bishop, this.cells[8][3]));
            this.cells[8][6].occupyPiece(new Piece(black, bishop, this.cells[8][6]));
            this.cells[1][3].occupyPiece(new Piece(white, bishop, this.cells[1][3]));
            this.cells[1][6].occupyPiece(new Piece(white, bishop, this.cells[1][6]));

            this.cells[8][4].occupyPiece(new Piece(black, queen, this.cells[8][4]));
            this.cells[1][4].occupyPiece(new Piece(white, queen, this.cells[1][4]));

            this.cells[8][5].occupyPiece(new Piece(black, king, this.cells[8][5]));
            this.cells[1][5].occupyPiece(new Piece(white, king, this.cells[1][5]));

            this.performOnAllCells((cell) => cell.update());
            this.performOnOccupiedCells((cell) => {
                cell.storedPiece.isNeverMoved = true;
            });
            this.clearSelection();
            this.status.innerHTML = `${this.currentTurn} Turn`;
            this.selectGameModeDiv.style.display = 'grid';
        }
        clearSelection() {
            this.selectedCell = 0;
            this.performOnAllCells((cell) => {
                cell.isSelected = false;
                cell.isPermittedForNextMove = false;
                cell.returnNormal();
            });
        }

        performOnAllCells(fun) {
            for (let i = 1; i <= 8; i++) {
                for (let j = 1; j <= 8; j++) {
                    let shouldReturn = fun(this.cells[i][j]);
                    if (shouldReturn)
                        return 0;
                }
            }
        }

        performOnOccupiedCells(fun) {
            for (let i = 1; i <= 8; i++) {
                for (let j = 1; j <= 8; j++) {
                    if (this.cells[i][j].isOccupied) {
                        let shouldReturn = fun(this.cells[i][j]);
                        if (shouldReturn)
                            return 0;
                    }
                }
            }
        }

        searchForPiece(side, type) {
            let foundInCell = [];
            this.performOnOccupiedCells((cell) => {
                if (cell.storedPiece.type === type && cell.storedPiece.side === side) {
                    foundInCell.push(cell);
                }
            });
            return foundInCell;
        }

        checkForCheck(side) {
            let cellOfKing = this.searchForPiece(side, king)[0];
            let isReachable = cellOfKing.canBeReachedBySide(oppositeOfSide(side));
            if (isReachable) {
                this.status.innerHTML = `${side} Check`;
                cellOfKing.highlight();
                return 1;
            }
            else return 0;
        }

        checkForCheckmate(side) {
            let canEscape = false, canInterrupt = false, canCapture = false;
            let cellOfKing = this.searchForPiece(side, king)[0];
            let cellOfEnemy = cellOfKing.canBeReachedBySide(oppositeOfSide(side), true);

            let checkForEscape = () => {
                let status = false;
                let permittedCells = cellOfKing.storedPiece.canMoveToCells();
                for (let k in permittedCells) {
                    let tempMove = new Move(cellOfKing, permittedCells[k]);
                    if (permittedCells[k].canBeReachedBySide(oppositeOfSide(side))) status = false;
                    else status = true;
                    tempMove.undo();
                    if (status) break;
                }
                return status;
            }

            let checkForCapture = (currentCell) => {
                let status = false;
                let permittedCells = currentCell.storedPiece.canMoveToCells();
                for (let k in permittedCells) {
                    if (permittedCells[k] === cellOfEnemy) {
                        let tempMove = new Move(currentCell, cellOfEnemy);
                        if (cellOfKing.canBeReachedBySide(oppositeOfSide(side))) status = false;
                        else status = true;
                        tempMove.undo();
                        if (status) break;
                    }
                }
                return status;
            }

            let checkForInterruption = (currentCell) => {
                let status = false;
                let permittedCells = currentCell.storedPiece.canMoveToCells();
                let checkConditionAfterMovingTo = (cellOfInterruption) => {
                    let tempMove = new Move(currentCell, cellOfInterruption);
                    if (cellOfKing.canBeReachedBySide(oppositeOfSide(side))) status = false;
                    else status = true;
                    tempMove.undo();
                }

                if (cellOfKing.address.row === cellOfEnemy.address.row) {
                    let min = Math.min(cellOfKing.address.column, cellOfEnemy.address.column);
                    let max = Math.max(cellOfKing.address.column, cellOfEnemy.address.column);
                    for (let k in permittedCells) {
                        if (permittedCells[k].address.column > min && permittedCells[k].address.column < max) {
                            checkConditionAfterMovingTo(permittedCells[k]);
                            if (status) break;
                        }
                    }
                }

                if (cellOfKing.address.column === cellOfEnemy.address.column) {
                    let min = Math.min(cellOfKing.address.row, cellOfEnemy.address.row);
                    let max = Math.max(cellOfKing.address.row, cellOfEnemy.address.row);
                    for (let k in permittedCells) {
                        if (permittedCells[k].address.row > min && permittedCells[k].address.row < max) {
                            checkConditionAfterMovingTo(permittedCells[k]);
                            if (status) break;
                        }
                    }
                }

                else {
                    let rowOfLowerPiece, columnOfLowerPiece, rowOfUpperPiece, direction;
                    if (cellOfKing.address.row < cellOfEnemy.address.row) {
                        rowOfLowerPiece = cellOfKing.address.row;
                        rowOfUpperPiece = cellOfEnemy.address.row;
                        columnOfLowerPiece = cellOfKing.address.column;
                        if (cellOfKing.address.column < cellOfEnemy.address.column)
                            direction = 1;
                        else direction = -1;
                    }
                    else {
                        rowOfLowerPiece = cellOfEnemy.address.row;
                        rowOfUpperPiece = cellOfKing.address.row;
                        columnOfLowerPiece = cellOfEnemy.address.column;
                        if (cellOfEnemy.address.column < cellOfKing.address.column)
                            direction = 1;
                        else direction = -1;
                    }
                    for (let x = 1; x < rowOfUpperPiece - rowOfLowerPiece; x++) {
                        for (let k in permittedCells) {
                            if (permittedCells[k] === this.cells[rowOfLowerPiece + x][columnOfLowerPiece + x * direction]) {
                                checkConditionAfterMovingTo(permittedCells[k]);
                                if (status) break;
                            }
                        }
                        if (status) break;
                    }
                }
                return status;
            }

            canEscape = checkForEscape();
            if (canEscape) return false;
            this.performOnOccupiedCells((cell) => {
                if (cell.storedPiece.side === side) {
                    if (cell.storedPiece.type != king)
                        canCapture = checkForCapture(cell);
                    if (canCapture) return true;
                    if (cellOfEnemy.storedPiece.type != knight && cellOfEnemy.storedPiece != pawn && cell.storedPiece.type != king) {
                        if (cellOfEnemy.address.row - cellOfKing.address.row != 1 && cellOfEnemy.address.column - cellOfKing.address.column != 1) {
                            if (cellOfEnemy.address.row === cellOfKing.address.row || cellOfEnemy.address.column === cellOfKing.address.column) {
                                canInterrupt = checkForInterruption(cell);
                            }
                            if (Math.abs(cellOfEnemy.address.row - cellOfKing.address.row) === Math.abs(cellOfEnemy.address.column - cellOfKing.address.column)) {
                                canInterrupt = checkForInterruption(cell);
                            }
                            if (canInterrupt) return true;
                        }
                    }
                }
            });
            if (!canEscape && !canCapture && !canInterrupt) return true;
            else return false;
        }

        checkForStalemate(side) {
            let status = true;
            let isAnyLegalMove = false;
            this.performOnOccupiedCells((cell) => {
                if (cell.storedPiece.side === side && cell.storedPiece.type != king) {
                    let permittedCells = cell.storedPiece.canMoveToCells();
                    if (permittedCells.length != 0) {
                        isAnyLegalMove = true;
                        return true;
                    }
                }
            });
            if (!isAnyLegalMove) {
                let cellOfKing = this.searchForPiece(side, king)[0];
                let permittedCells = cellOfKing.storedPiece.canMoveToCells();
                for (let k in permittedCells) {
                    let tempMove = new Move(cellOfKing, permittedCells[k]);
                    if (!permittedCells[k].canBeReachedBySide(oppositeOfSide(side))) status = false;
                    tempMove.undo();
                }
                return status;
            }
            else return false;
        }

        undo() {
            if (this.moveCount > 0) {
                let lastMove = this.history[this.moveCount - 1];
                lastMove.undo();
                lastMove.updateCells();
                this.clearSelection();
                this.currentTurn = oppositeOfSide(this.currentTurn);
                this.status.innerHTML = `${this.currentTurn} Turn`;
                this.moveCount--;
                this.checkForCheck(this.currentTurn);
            }
        }

        redo() {
            if (this.history.length > this.moveCount) {
                let lastMove = this.history[this.moveCount];
                let move = new Move(lastMove.from, lastMove.to);
                move.isPromotionAvailable = lastMove.isPromotionAvailable;
                if (move.isPromotionAvailable) {
                    move.promotionChoice = lastMove.promotionChoice;
                    move.promote();
                }
                move.updateCells();
                this.clearSelection();
                this.saveCurrentState(move);
                this.currentTurn = oppositeOfSide(this.currentTurn);
                this.status.innerHTML = ` ${this.currentTurn} Turn`;
                let checkStatus = this.checkForCheck(this.currentTurn);
                if (checkStatus === 1) {
                    let isCheckmated = this.checkForCheckmate(this.currentTurn);
                    if (isCheckmated) {
                        this.performOnAllCells(cell => cell.disableStatus(true));
                        this.status.innerHTML = ` ${this.currentTurn} Checkmate`;
                        return;
                    }
                }
                else {
                    let isStalemate = this.checkForStalemate(this.currentTurn);
                    if (isStalemate) {
                        this.performOnAllCells(cell => cell.disableStatus(true));
                        this.status.innerHTML = 'Stalemate';
                        return;
                    }
                }
            }
        }

        saveCurrentState(move) {
            this.history[this.moveCount] = move;
            this.moveCount++;
        }

        async choosePromotionChoise(side) {
            let isFinished = false;
            let selectedType;
            this.performOnAllCells(cell => cell.disableStatus(true));
            document.querySelector('.menu').style.pointerEvents = 'none';
            document.querySelector('.promotionChoicesDiv').style.display = 'grid';
            let storePromotedPiece = (type) => {
                document.querySelector('.promotionChoicesDiv').style.display = 'none';
                this.performOnAllCells(cell => cell.disableStatus(false));
                document.querySelector('.menu').style.pointerEvents = 'auto';
                selectedType = type;
                isFinished = true;
            }
            for (let i = 0; i < 4; i++) {
                let type = (i === 0) ? rook : (i === 1) ? knight : (i === 2) ? bishop : queen;
                this.promotionChoiceCells[i].style.backgroundImage = images[side.toLowerCase()][type.toLowerCase()];
                this.promotionChoiceCells[i].onclick = () => storePromotedPiece(type);
            }

            while (!isFinished) await new Promise((res) => setTimeout(res, 100));
            return selectedType;
        }
        autoMove(side) {
            autoBot(side, (this.gameMode === 4) ? 1 : this.gameMode);
        }
    }

    class Cell {
        constructor(row, column) {
            this.elt;
            this.isOccupied = false;
            this.storedPiece = 0;
            this.isPermittedForNextMove = false;
            this.isSelected = false;
            this.backgroundImageUrl = 'none';
            this.address = {
                row: row,
                column: column
            };
        }

        canBeReachedBySide(side, returnCell = false) {
            let temp = 0, culpritCell;
            let isReachable = false;

            board.performOnOccupiedCells((cell) => {
                if (cell.storedPiece.side === side && cell != this) {
                    let enemyCanMoveToCells = cell.storedPiece.canMoveToCells();
                    for (let m in enemyCanMoveToCells) {
                        if (enemyCanMoveToCells[m] === this) {
                            culpritCell = cell;
                            isReachable = true;
                            return true;
                        }
                    }
                }
            });
            if (returnCell)
                return culpritCell;
            else
                return isReachable;
        }

        disableStatus(bool) {
            this.elt.disabled = bool;
        }
        selectCell() {
            if (this.isOccupied) {
                this.isSelected = true;
                let permittedCells = this.storedPiece.canMoveToCells();
                for (let i in permittedCells) {
                    permittedCells[i].highlight();
                    permittedCells[i].isPermittedForNextMove = true;
                }
            }
        }
        highlight() {
            this.elt.style.backgroundColor = 'rgb(200 0 0 /50%)';
        }
        returnNormal() {
            this.elt.style.backgroundColor = 'transparent';
        }
        occupyPiece(piece) {
            this.storedPiece = piece;
            this.isOccupied = true;
            piece.currentCell = this;
            this.storedPiece.isNeverMoved = false;
            this.backgroundImageUrl = images[piece.side.toLowerCase()][piece.type.toLowerCase()];
        }
        unoccupy() {
            this.storedPiece = 0;
            this.isOccupied = false;
            this.backgroundImageUrl = "none";
        }

        update() {
            this.elt.style.backgroundImage = this.backgroundImageUrl;

        }
        canBeOccupiedBy(side) {
            if (this.isOccupied) {
                if (this.storedPiece.side === side) return false;
            }
            return true;
        }
        addOnClickFunction() {
            this.elt.addEventListener('click', async () => {
                if (this.isOccupied && board.currentTurn === this.storedPiece.side) {
                    if (this.isSelected) {
                        board.clearSelection();
                    }
                    else {
                        board.clearSelection();
                        board.selectedCell = this;
                        this.selectCell();
                    }
                }
                if (this.isPermittedForNextMove) {
                    let move = new Move(board.selectedCell, this);
                    if ((board.currentTurn === white && board.gameMode < 3) || board.gameMode === 3) {
                        if (move.isPromotionAvailable) {
                            move.promotionChoice = await board.choosePromotionChoise(board.currentTurn);
                            move.promote();
                        }
                    }
                    move.updateCells();
                    board.clearSelection();
                    board.saveCurrentState(move);

                    let checkStatus = board.checkForCheck(board.currentTurn);
                    if (checkStatus === 1) {
                        return new Promise((resolve) => {
                            resolve = () => {
                                board.undo();
                                board.currentTurn = oppositeOfSide(board.currentTurn);
                                board.status.innerHTML = `${board.currentTurn} Turn`;
                                if (board.gameMode != 3) {
                                    if (board.gameMode === 4 || board.currentTurn === board.computerSide)
                                        setTimeout(() => board.autoMove(board.currentTurn), 100);
                                }
                            }
                            setTimeout(resolve, 300);
                        });
                    }
                    else {
                        board.currentTurn = oppositeOfSide(board.currentTurn);
                        board.status.innerHTML = `${board.currentTurn} Turn`;
                        checkStatus = board.checkForCheck(board.currentTurn);
                        if (checkStatus === 1) {
                            let isCheckmated = board.checkForCheckmate(board.currentTurn);
                            if (isCheckmated) {
                                board.isCompleted = true;
                                board.performOnAllCells(cell => cell.disableStatus(true));
                                board.status.innerHTML = ` ${board.currentTurn} Checkmate`;
                                return;
                            }
                        }
                        else {
                            let isStalemate = board.checkForStalemate(board.currentTurn);
                            if (isStalemate) {
                                board.isCompleted = true;
                                board.performOnAllCells(cell => cell.disableStatus(true));
                                board.status.innerHTML = 'Stalemate';
                                return;
                            }
                        }
                        if (board.gameMode != 3) {
                            if (board.gameMode === 4 || board.currentTurn === board.computerSide)
                                setTimeout(() => board.autoMove(board.currentTurn), 100);
                        }
                    }
                }
            });
        }
    }

    class Piece {
        constructor(side, type, cell) {
            this.currentCell = cell;
            this.isNeverMoved = true;
            this.side = side;
            this.type = type;
            this.points = (type === king) ? 8 : (type === queen) ? 10 : (type === rook) ? 5 : (type === knight || type === bishop) ? 3 : 1;
        }

        canMoveToCells() {
            let permittedCells = [];
            let row = this.currentCell.address.row;
            let column = this.currentCell.address.column;
            let side = this.side;
            if (this.type === pawn && side === black && row > 1) {
                if (!board.cells[row - 1][column].isOccupied) {
                    if (!board.cells[row - 1][column].isOccupied) {
                        permittedCells.push(board.cells[row - 1][column]);
                    }
                }
                if (board.cells[row - 1][column + 1]) {
                    if (board.cells[row - 1][column + 1].isOccupied) {
                        if (board.cells[row - 1][column + 1].storedPiece.side != this.side)
                            permittedCells.push(board.cells[row - 1][column + 1]);
                    }
                }
                if (board.cells[row - 1][column - 1]) {
                    if (board.cells[row - 1][column - 1].isOccupied) {
                        if (board.cells[row - 1][column - 1].storedPiece.side != this.side)
                            permittedCells.push(board.cells[row - 1][column - 1]);
                    }
                }
                if (this.isNeverMoved) {
                    if (!board.cells[row - 2][column].isOccupied) {
                        if (!board.cells[row - 1][column].isOccupied) {
                            permittedCells.push(board.cells[row - 2][column]);
                        }
                    }
                }
            }

            if (this.type === pawn && side === white && row < 8) {
                if (!board.cells[row + 1][column].isOccupied) {
                    permittedCells.push(board.cells[row + 1][column]);
                }
                if (board.cells[row + 1][column + 1]) {
                    if (board.cells[row + 1][column + 1].isOccupied) {
                        if (board.cells[row + 1][column + 1].storedPiece.side != this.side)
                            permittedCells.push(board.cells[row + 1][column + 1]);
                    }
                }
                if (board.cells[row + 1][column - 1]) {
                    if (board.cells[row + 1][column - 1].isOccupied) {
                        if (board.cells[row + 1][column - 1].storedPiece.side != this.side)
                            permittedCells.push(board.cells[row + 1][column - 1]);
                    }
                }
                if (this.isNeverMoved) {
                    if (!board.cells[row + 2][column].isOccupied) {
                        if (!board.cells[row + 1][column].isOccupied) {
                            permittedCells.push(board.cells[row + 2][column]);
                        }
                    }
                }
            }

            if (this.type === rook) {
                checkColumn();
                checkRow();
            }

            if (this.type === knight) {
                for (let i = 1; i <= 2; i++) {
                    let j = (i === 1) ? 2 : 1;
                    if ((row + i) <= 8 && (column + j) <= 8) {
                        if (board.cells[row + i][column + j].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row + i][column + j]);
                        }
                    }
                    if ((row + i) <= 8 && (column - j) > 0) {
                        if (board.cells[row + i][column - j].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row + i][column - j]);
                        }
                    }
                    if ((row - i) > 0 && (column + j) <= 8) {
                        if (board.cells[row - i][column + j].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row - i][column + j]);
                        }
                    }
                    if ((row - i) > 0 && (column - j) > 0) {
                        if (board.cells[row - i][column - j].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row - i][column - j]);
                        }
                    }
                }
            }

            if (this.type === bishop) {
                checkDiagonally();
            }

            if (this.type === queen) {
                checkColumn();
                checkRow();
                checkDiagonally();
            }

            if (this.type === king) {
                for (let i = - 1; i <= 1; i++) {
                    if ((row + i) > 0 && (row + i) <= 8 && (column + 1) <= 8) {
                        if (board.cells[row + i][column + 1].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row + i][column + 1]);
                        }
                    }
                    if ((row + i) > 0 && (row + i) <= 8) {
                        if (board.cells[row + i][column].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row + i][column]);
                        }
                    }
                    if ((row + i) > 0 && (row + i) <= 8 && (column - 1) > 0) {
                        if (board.cells[row + i][column - 1].canBeOccupiedBy(side)) {
                            permittedCells.push(board.cells[row + i][column - 1]);
                        }
                    }
                }
                if (this.side === black && this.isNeverMoved) {
                    if (!board.cells[8][6].isOccupied && !board.cells[8][7].isOccupied && board.cells[8][8].isOccupied) {
                        if (board.cells[8][8].storedPiece.isNeverMoved) {
                            permittedCells.push(board.cells[8][7]);
                        }
                    }
                }

                if (this.side === white && this.isNeverMoved) {
                    if (!board.cells[1][6].isOccupied && !board.cells[1][7].isOccupied && board.cells[1][8].isOccupied) {
                        if (board.cells[1][8].storedPiece.isNeverMoved)
                            permittedCells.push(board.cells[1][7]);
                    }
                }

                if (this.side === black && this.isNeverMoved) {
                    if (!board.cells[8][4].isOccupied && !board.cells[8][3].isOccupied && !board.cells[8][2].isOccupied && board.cells[8][1].isOccupied) {
                        if (board.cells[8][1].storedPiece.isNeverMoved)
                            permittedCells.push(board.cells[8][3]);
                    }
                }

                if (this.side === white && this.isNeverMoved) {
                    if (!board.cells[1][4].isOccupied && !board.cells[1][3].isOccupied && !board.cells[1][2].isOcuppied && board.cells[1][1].isOccupied) {
                        if (board.cells[1][1].storedPiece.isNeverMoved)
                            permittedCells.push(board.cells[1][3]);
                    }
                }
            }

            function checkColumn() {
                for (let i = row + 1; i <= 8; i++) {
                    if (board.cells[i][column].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[i][column]);
                    }
                    if (board.cells[i][column].isOccupied) {
                        break;
                    }
                }
                for (let i = row - 1; i > 0; i--) {
                    if (board.cells[i][column].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[i][column]);
                    }
                    if (board.cells[i][column].isOccupied) {
                        break;
                    }
                }
            }

            function checkRow() {
                for (let i = column + 1; i <= 8; i++) {
                    if (board.cells[row][i].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[row][i]);
                    }
                    if (board.cells[row][i].isOccupied) {
                        break;
                    }
                }
                for (let i = column - 1; i > 0; i--) {
                    if (board.cells[row][i].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[row][i]);
                    }
                    if (board.cells[row][i].isOccupied) {
                        break;
                    }
                }
            }

            function checkDiagonally() {
                let i, j;
                i = row + 1;
                j = column + 1;
                while (i <= 8 && j <= 8) {
                    if (board.cells[i][j].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[i][j]);
                    }
                    if (board.cells[i][j].isOccupied) {
                        break;
                    }
                    i++;
                    j++;
                }

                i = row - 1;
                j = column + 1;
                while (i > 0 && j <= 8) {
                    if (board.cells[i][j].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[i][j]);
                    }
                    if (board.cells[i][j].isOccupied) {
                        break;
                    }
                    i--;
                    j++;
                }

                i = row - 1;
                j = column - 1;
                while (i > 0 && j > 0) {
                    if (board.cells[i][j].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[i][j]);
                    }
                    if (board.cells[i][j].isOccupied) {
                        break;
                    }
                    i--;
                    j--;
                }

                i = row + 1;
                j = column - 1;
                while (i <= 8 && j > 0) {
                    if (board.cells[i][j].canBeOccupiedBy(side)) {
                        permittedCells.push(board.cells[i][j]);
                    }
                    if (board.cells[i][j].isOccupied) {
                        break;
                    }
                    i++;
                    j--;
                }
            }

            return permittedCells;
        }

        moveTo(cell) {
            this.currentCell.unoccupy();
            cell.occupyPiece(this);
            this.currentCell = cell;
        }
    }

    class Move {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.capturedPiece = 0;
            this.points = 0;
            this.fromWasNeverMoved = this.from.storedPiece.isNeverMoved;
            this.promotionChoice = 0;
            this.isPromotionAvailable = false;
            this.castleMove = 0;
            if (this.to.isOccupied) {
                this.capturedPiece = this.to.storedPiece;
                this.toWasNeverMoved = this.to.storedPiece.isNeverMoved;
                this.points = this.capturedPiece.points;
            }
            this.from.storedPiece.isNeverMoved = false;
            this.from.storedPiece.moveTo(this.to);
            if (this.to.storedPiece.type === king) this.checkForCastling();
            if (this.to.storedPiece.type === pawn) this.isPromotionAvailable = this.checkForPromotion();
        }
        updateCells() {
            this.from.update();
            this.to.update();
            if (this.castleMove != 0) {
                this.castleMove.updateCells();
            }
        }
        undo() {
            this.to.storedPiece.moveTo(this.from);
            if (this.capturedPiece != 0) {
                this.to.occupyPiece(this.capturedPiece);
                this.to.storedPiece.isNeverMoved = this.toWasNeverMoved;
            }
            if (this.isPromotionAvailable) this.from.occupyPiece(new Piece(this.from.storedPiece.side, pawn, this.from));
            this.from.storedPiece.isNeverMoved = this.fromWasNeverMoved;
            if (this.castleMove != 0) this.castleMove.undo();
        }
        checkForCastling() {
            if (Math.abs(this.from.address.column - this.to.address.column) === 2) {
                if (this.to.address.column === 7) {
                    this.castleMove = new Move(board.cells[this.from.address.row][8], board.cells[this.from.address.row][6]);
                }
                if (this.to.address.column === 3) {
                    this.castleMove = new Move(board.cells[this.from.address.row][1], board.cells[this.from.address.row][4]);
                }
            }
        }

        checkForPromotion() {
            if (this.to.address.row === 8 || this.to.address.row === 1) {
                if (board.gameMode === 4) {
                    this.promotionChoice = queen;
                    this.promote();
                }
                if (this.gameMode < 3 && this.side === black) {
                    this.promotionChoice = queen;
                    this.promote();
                }
                return true;
            }
            else return false;
        }
        promote() {
            this.to.occupyPiece(new Piece(this.to.storedPiece.side, this.promotionChoice, this.to));
            this.points += this.to.storedPiece.points - 1;
        }
    }

    function autoBot(side, level) {
        let validMoves = [];
        let maximumPoints = -10000;
        let movesWithMaximumPoints = [];
        validMoves = findValidMovesOf(side);
        if (level > 0) {
            for (let k in validMoves) {
                let tempMove = new Move(validMoves[k].occupiedCell, validMoves[k].destinationCell);
                validMoves[k].points = tempMove.points;
                let secondTurnMaxPoints = -1000;
                let secondTurnMoves = findValidMovesOf(oppositeOfSide(side));
                for (let j in secondTurnMoves) {
                    let tempMove2 = new Move(secondTurnMoves[j].occupiedCell, secondTurnMoves[j].destinationCell);
                    secondTurnMoves[j].points = tempMove2.points;
                    let thirdMoveMaxPoints = -100;
                    if (level > 1) {
                        let thirdTurnMoves = findValidMovesOf(side);
                        thirdTurnMoves.forEach((move) => {
                            let tempMove4 = new Move(move.occupiedCell, move.destinationCell);
                            let temp = tempMove4.points;
                            tempMove4.undo();
                            if (thirdMoveMaxPoints < temp) thirdMoveMaxPoints = temp;
                        });
                        secondTurnMoves[j].points -= thirdMoveMaxPoints;
                    }
                    tempMove2.undo();

                    if (secondTurnMaxPoints < secondTurnMoves[j].points) secondTurnMaxPoints = secondTurnMoves[j].points;
                }
                tempMove.undo();
                validMoves[k].points -= secondTurnMaxPoints;
                if (validMoves[k].points === maximumPoints) {
                    movesWithMaximumPoints.push(validMoves[k]);
                }
                if (validMoves[k].points > maximumPoints) {
                    maximumPoints = validMoves[k].points;
                    movesWithMaximumPoints.splice(0, movesWithMaximumPoints.length);
                    movesWithMaximumPoints.push(validMoves[k]);
                }
            }
        }
        if (movesWithMaximumPoints.length === 0)
            movesWithMaximumPoints = validMoves;
        let random = Math.floor(Math.random() * movesWithMaximumPoints.length);
        movesWithMaximumPoints[random].occupiedCell.elt.click();
        movesWithMaximumPoints[random].destinationCell.elt.click();

        function findValidMovesOf(givenSide) {
            let moves = [];
            board.performOnOccupiedCells((cell) => {
                if (cell.storedPiece.side === givenSide) {
                    let permittedCells = cell.storedPiece.canMoveToCells();
                    for (let n in permittedCells) {
                        let tempMove3 = new Move(cell, permittedCells[n]);
                        if (!board.searchForPiece(givenSide, king)[0].canBeReachedBySide(oppositeOfSide(givenSide))) {
                            tempMove3.undo();
                            moves.push({ occupiedCell: cell, destinationCell: permittedCells[n], points: 0 });
                        }
                        else {
                            tempMove3.undo();
                        }
                    }
                }
            });
            return moves;
        }
    }

    let board = new Board();
    board.setGUI();
    board.resetBoard();
}
startGame();
