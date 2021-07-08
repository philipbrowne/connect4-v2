/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const game = document.getElementById('game');
const startBtn = document.getElementById('startBtn');
const startGame = document.getElementById('startGame');
 
class Game {
  constructor(p1, p2, HEIGHT = 6, WIDTH = 7) {
    this.players = [p1, p2];
    this.HEIGHT = HEIGHT;
    this.WIDTH = WIDTH;
    this.currPlayer = p1;
    this.playerTurn = 1;
    this.board = [];
    this.makeBoard();
    this.makeHtmlBoard();
    this.isGameOver = false;
  }
  /** makeBoard: create in-JS board structure:
 *   board = array of rows, each row is array of cells  (board[y][x])
 */
  makeBoard() {
    this.board.length = 0;
    for (let y = 0; y < this.HEIGHT; y++) {
      this.board.push(Array.from({ length: this.WIDTH }));
    }
  };
  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const table = document.createElement('table');
    table.setAttribute('id', 'board');
    game.append(table);
    
    const board = document.getElementById('board');
    board.innerHTML = '';
    const playerTurn = document.createElement('div');
    playerTurn.removeAttribute('class');
    playerTurn.setAttribute('id', 'playerTurn');
    game.append(playerTurn);
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick.bind(this));

    for (let x = 0; x < this.WIDTH; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // make main part of board
    for (let y = 0; y < this.HEIGHT; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.WIDTH; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }
      board.append(row);
    }
    playerTurn.innerHTML = '';
    const bottom = document.getElementById('bottom');
    bottom.innerHTML = '';
    const playerTurnMsg = document.createElement('span');
    const playerTurnToken = document.createElement('div');
    playerTurnMsg.innerText = `Player ${this.playerTurn}'s Turn`;
    playerTurnMsg.style.color = `${this.currPlayer.color}`;
    if (playerTurnMsg.style.color === 'white') {
      playerTurnMsg.style.color = 'black';
    }
    playerTurn.classList.add('player1Msg');
    playerTurnToken.classList.add('playerToken');
    playerTurnToken.classList.add(`${this.currPlayer.color}`);
    playerTurn.append(playerTurnMsg);
    playerTurn.append(playerTurnToken);
    const restartBtn = document.createElement('button');
    restartBtn.setAttribute('id', 'startBtn');
    restartBtn.innerText = 'Restart Game';
    restartBtn.addEventListener('click', this.restartGame.bind(this));
    bottom.append(restartBtn);
  }


  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }
  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.classList.add(`${this.currPlayer.color}`);
    piece.style.top = -50 * (y + 2);
    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
    this.dropDown(spot, piece);
  }
  dropDown (position, piece) {
    let yPos = position.offsetTop;
    piece.style.position = 'absolute';
    piece.style.top = `${-yPos + 150}px`;
    // This was the closest I could find to the top row
    piece.style.left = '5px';
    let interval = setInterval(() => this.dropDownMvt(piece, interval), 12);
  }
  dropDownMvt (piece, interval) {
    let yPos = piece.offsetTop;
    if (yPos < 10) {
      piece.style.top = `${yPos + 30}px`;
    } else {
      piece.style.position = 'relative';
      piece.style.top = 'unset';
      piece.style.left = 'unset';
      clearInterval(interval);
    }
  }
  /** endGame: announce game end */

  endGame(msg) {
    setTimeout(() => {
      alert(msg);
      const top = document.getElementById('column-top');
      top.setAttribute('id', 'gameovertop');
      this.isGameOver = true;
      this.gameOverMsg();
    }, 100);
  }

  gameOverMsg() {
    const gameOverMsg = document.createElement('span');
    const playerTurn = document.getElementById('playerTurn');
    playerTurn.innerHTML = '';
    if (!this.checkForTie()) {
      gameOverMsg.innerText = `Player ${this.playerTurn} wins!`;
      gameOverMsg.style.color = `${this.currPlayer.color}`;
    }
    else { gameOverMsg.innerText = 'TIE GAME!' };
    const restartBtn = document.getElementById('startBtn');
    restartBtn.style.display = 'none';
    playerTurn.setAttribute('class', 'gameovermsg');
    playerTurn.append(gameOverMsg);
    const playAgain = document.createElement('div');
    playAgain.setAttribute('id', 'playAgain');
    playAgain.innerText = 'Click to Play Again';
    playAgain.addEventListener('click', this.restartGame.bind(this));
    playerTurn.append(playAgain);
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    const playerTurn = document.getElementById('playerTurn');
    // get x from ID of clicked cell
    if (!this.isGameOver) {
      const x = +evt.target.id;
      // get next spot in column (if none, ignore click)
      const y = this.findSpotForCol(x);
      if (y === null) {
        return;
      }

      // place piece in board and add to HTML table
      this.board[y][x] = this.currPlayer;
      this.placeInTable(y, x);

      // check for win
      if (this.checkForWin()) {
        const winningPiece = document.getElementById(`${y}-${x}`).querySelector('div');
        winningPiece.classList.add('winningPiece');
        return this.endGame(`Player ${this.playerTurn} wins!`);
      }

      // // check for tie
      if (this.checkForTie()) {
        return endGame('TIE GAME!');
      }
      // switch players
      this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
      if (this.playerTurn === 1) {
        this.playerTurn = 2;
      } else this.playerTurn = 1;
      playerTurn.innerHTML = '';
      const playerTurnMsg = document.createElement('span');
      const playerTurnToken = document.createElement('div');
      playerTurnToken.classList.remove(...playerTurnToken.classList);
      playerTurnMsg.innerText = `Player ${this.playerTurn}'s Turn`;
      playerTurnToken.classList.add('playerToken');
      playerTurnToken.classList.add(`${this.currPlayer.color}`);
      playerTurnMsg.style.color = `${this.currPlayer.color}`;
      if (playerTurnMsg.style.color === 'white') {
        playerTurnMsg.style.color = 'black';
      }
      playerTurn.append(playerTurnMsg);
      playerTurn.append(playerTurnToken);
    }
  }
  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.HEIGHT &&
          x >= 0 &&
          x < this.WIDTH &&
          this.board[y][x] === this.currPlayer
      );
    };

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
  checkForTie() {
    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        if (this.board[y][x] === undefined) {
          return false;
        }
      }
    }
    return true;
  }

  restartGame() {
    const playerTurn = document.getElementById('playerTurn');
    game.innerHTML = '';
    startGame.style.display = 'block';
    const restartBtn = document.getElementById('startBtn');
    restartBtn.innerText = 'Start Game';
    restartBtn.style.display = 'block';
    restartBtn.addEventListener('click', () => {
      
      let p1 = new Player(document.getElementById('p1color').value);
      let p2 = new Player(document.getElementById('p2color').value);
      if (p1.color === p2.color) {
        alert('Must Select Different Colors!');
      }
      else {
        new Game(p1, p2);
        const bottom = document.getElementById('bottom');
        restartBtn.style.display = 'none';
        startGame.style.display = 'none';
      }
    })
  }
}

class Player {
  constructor(color) {
    this.color = color;
  }
}

startBtn.addEventListener('click', () => {
  let p1 = new Player(document.getElementById('p1color').value);
  let p2 = new Player(document.getElementById('p2color').value);
  if (p1.color === p2.color) {
    alert('Must Select Different Colors!');
  }
  else {
    new Game(p1, p2);
    startBtn.style.display = 'none';
    startGame.style.display = 'none';
  }
})
