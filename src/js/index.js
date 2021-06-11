const getRandom = require("../utils/random-generator");
const matrixFilter = require("../utils/matrix-filter");
let board, cv, cx;
const COLORS = ["#aaffaa", "#ccffaa", "#ffffaa", "#ffccaa"];
let blockSize;
class Board {
  constructor({ rows, cols, mines }) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = [];
    this.mines = mines || 10;
    this.firstFlip = true;
  }

  generateBoard() {
    const mines = [];
    this.matrix = [];
    for (let i = 0; i < this.mines; i++) {
      let row;
      let col;
      do {
        row = getRandom(this.rows - 1, 0);
        col = getRandom(this.cols - 1, 0);
        mines[i] = { row, col };
      } while (mines.filter((m) => m.row === row && m.col === col).length > 1);
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cell = new Cell({ row: i, col: j, hasMine: false });

        if (mines.find((m) => m.row === cell.row && m.col === cell.col)) {
          cell.hasMine = true;
        }
        this.matrix.push(cell);
      }
    }

    for (let mine of mines) {
      let cells = this.matrix.filter((cell) => matrixFilter(cell, mine));
      cells.map((cell) => (cell.nearMines += 1));
    }
  }

  draw(cx) {
    cx.strokeStyle = "#FFFFFF";

    for (let { row, col, hasMine, isFaceUp, isMarked, nearMines } of this
      .matrix) {
      cx.beginPath();
      cx.fillStyle = isFaceUp
        ? nearMines > 0 && !hasMine
          ? COLORS[nearMines - 1]
          : "#DDDDDD"
        : "#BBBBBB";
      cx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
      cx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
      cx.fill();
      cx.stroke();
      cx.closePath();
      if (isFaceUp) {
        if (hasMine) {
          cx.beginPath();
          cx.fillStyle = "#000000";
          cx.arc(
            col * blockSize + blockSize / 2,
            row * blockSize + blockSize / 2,
            8,
            0,
            Math.PI * 2
          );
          cx.fill();
          cx.closePath();
        } else {
          cx.beginPath();
          cx.fillStyle = "#000000";
          cx.font = "bold 36px courier";
          cx.textAlign = "center";
          cx.textBaseline = "middle";
          cx.fillText(
            nearMines || "",
            col * blockSize + blockSize / 2,
            row * blockSize + blockSize / 2
          );
          cx.fill();
          cx.closePath();
        }
      } else {
        if (isMarked) {
          cx.beginPath();
          cx.fillStyle = "#000000";
          cx.font = "bold 36px courier";
          cx.textAlign = "center";
          cx.textBaseline = "middle";
          cx.fillText(
            "X",
            col * blockSize + blockSize / 2,
            row * blockSize + blockSize / 2
          );
          cx.fill();
          cx.closePath();
        }
      }
    }
  }

  getNears(cell) {
    let nears = this.matrix.filter((c) => {
      if (c.row === cell.row - 1 && c.col === cell.col && !c.isFaceUp)
        return true;
      if (c.row === cell.row + 1 && c.col === cell.col && !c.isFaceUp)
        return true;
      if (c.row === cell.row && c.col === cell.col - 1 && !c.isFaceUp)
        return true;
      if (c.row === cell.row && c.col === cell.col + 1 && !c.isFaceUp)
        return true;
      return false;
    });

    return nears;
  }

  flipCell({ row, col }) {
    let cell = this.matrix.find((c) => c.row === row && c.col === col);
    let nears = this.getNears(cell);

    if (cell.nearMines === 0 && !cell.hasMine) {
      this.firstFlip = false;
      cell.isFaceUp = true;
      nears.map((n) => (n.isFaceUp = true));
      for (let near of nears) {
        if (near.nearMines === 0) {
          this.flipCell(near);
        }
      }
    } else if (this.firstFlip) {
      this.firstFlip = false;
      do {
        this.generateBoard();
      } while (
        this.matrix.find(
          (c) =>
            row === c.row && col === c.col && (c.nearMines !== 0 || c.hasMine)
        )
      );
      let newCell = this.matrix.find((c) => c.row === row && c.col === col);
      this.flipCell(newCell);
    } else {
      cell.isFaceUp = true;
    }
  }

  markCell({ row, col }) {
    let cell = this.matrix.find((c) => c.row === row && c.col === col);
    if (!cell.isFaceUp) {
      cell.isMarked = !cell.isMarked;
    }
  }
}

class Cell {
  constructor({ row, col, hasMine }) {
    this.row = row;
    this.col = col;
    this.hasMine = hasMine;
    this.isMarked = false;
    this.isFaceUp = false;
    this.nearMines = 0;
  }
}

function init() {
  cv = document.getElementById("cv");
  cx = cv.getContext("2d");
  let size = 8;
  blockSize = cv.width / size;
  board = new Board({ rows: size, cols: size, mines: 10 });
  board.generateBoard();
}

function run() {
  window.requestAnimationFrame(run);
  actions();
  draw();
}

function draw() {
  board.draw(cx);
}

function actions() {}

init();
run();

cv.addEventListener("click", ({ clientX, clientY }) => {
  let row = Math.floor((clientY - cv.offsetTop) / blockSize);
  let col = Math.floor((clientX - cv.offsetLeft) / blockSize);
  board.flipCell({ row, col });
});

cv.addEventListener("contextmenu", (evt) => {
  evt.preventDefault();
  let row = Math.floor((evt.clientY - cv.offsetTop) / blockSize);
  let col = Math.floor((evt.clientX - cv.offsetLeft) / blockSize);
  board.markCell({ row, col });
});
