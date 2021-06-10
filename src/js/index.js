const getRandom = require("../utils/random-generator");

let board, cv, cx;

class Board {
  constructor({ rows, cols, mines }) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = [];
    this.mines = mines || 10;
  }

  generateBoard() {
    const mines = [];

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
  }

  draw(cx) {
    cx.strokeStyle = "#FFFFFF";

    for (let { row, col, hasMine, isFaceUp } of this.matrix) {
      cx.beginPath();
      cx.fillStyle = isFaceUp ? "#DDDDDD" : "#BBBBBB";
      cx.fillRect(col * 50, row * 50, 50, 50);
      cx.strokeRect(col * 50, row * 50, 50, 50);
      cx.fill();
      cx.stroke();
      cx.closePath();
      if (hasMine && isFaceUp) {
        cx.beginPath();
        cx.fillStyle = "#000000";
        cx.arc(col * 50 + 25, row * 50 + 25, 8, 0, Math.PI * 2);
        cx.fill();
        cx.closePath();
      }
    }
  }

  turnCellFaceUp({ row, col }) {
    let cell = this.matrix.find((c) => c.row === row && c.col === col);
    cell.isFaceUp = true;
  }
}

class Cell {
  constructor({ row, col, hasMine }) {
    this.row = row;
    this.col = col;
    this.hasMine = hasMine;
    this.isMarked = false;
    this.isFaceUp = false;
  }
}

function init() {
  cv = document.getElementById("cv");
  cx = cv.getContext("2d");

  board = new Board({ rows: 8, cols: 8, mines: 10 });
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
  let row = Math.floor((clientY - cv.offsetTop) / 50);
  let col = Math.floor((clientX - cv.offsetLeft) / 50);
  board.turnCellFaceUp({ row, col });
});
