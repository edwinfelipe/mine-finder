const getRandom = require("../utils/random-generator");
const matrixFilter = require("../utils/matrix-filter");
let ui,
  board,
  cv,
  cx,
  config = {};
const COLORS = ["#aaffaa", "#ccffaa", "#ffffaa", "#ffccaa"];

class UI {
  constructor(options) {
    this.options = options;
  }

  draw(cx) {
    for (let i = 0; i < this.options.length; i++) {
      let option = this.options[i];
      cx.beginPath();
      cx.fillStyle = "#DDDDDD";
      cx.fillRect(0, i * 100, cv.width, 90);
      cx.fill();
      cx.closePath();

      cx.beginPath();
      cx.font = "bold 24px courier";
      cx.fillStyle = "black";
      cx.fillText(option.name, 24, i * 100 + 40);
      cx.fill();
      cx.closePath();

      cx.beginPath();
      cx.font = "bold 16px courier";
      cx.fillStyle = "black";
      cx.fillText(`${option.cols} X ${option.rows}`, 24, i * 100 + 64);
      cx.fill();
      cx.closePath();

      cx.beginPath();
      cx.font = "bold 14px courier";
      cx.fillStyle = "#666666";
      cx.fillText(`${option.mines} Mines`, 24, i * 100 + 80);
      cx.fill();
      cx.closePath();
    }
  }
}
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
      let rowDistance = Math.abs(c.row - cell.row);
      let colDistance = Math.abs(c.col - cell.col);
      if (!c.isFaceUp && rowDistance < 2 && colDistance < 2 ) return true;
      return false;
    });
    return nears;
  }
  

  flipCell({ row, col }) {
    let faceDown = this.matrix.filter((c) => !c.isFaceUp);

    let cell = this.matrix.find((c) => c.row === row && c.col === col);

    if(cell.hasMine && !this.firstFlip){
      cell.isFaceUp = true;
      alert("You Made KBOOM!!!!");
      this.generateBoard();
      this.firstFlip = true;
      return;
    }

    if (faceDown.length === this.mines + 1 && !cell.hasMine) {
      alert("You Win!!!!!");
      this.generateBoard();
      this.firstFlip = true;
      return;
    }


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

  ui = new UI([
    {
      name: "Easy",
      rows: 8,
      cols: 8,
      mines: 10,
    },
    {
      name: "Medium",
      rows: 16,
      cols: 16,
      mines: 40,
    },
    {
      name: "Hard",
      rows: 16,
      cols: 28,
      mines: 99,
    },
  ]);
}

function run() {
  window.requestAnimationFrame(run);
  actions();
  draw();
}

function draw() {
  if (board) {
    board.draw(cx);
  } else if (ui) {
    ui.draw(cx);
  }
}

function actions() {}

init();
run();

cv.addEventListener("click", ({ clientX, clientY }) => {
  if (board) {
    let row = Math.floor((clientY - cv.offsetTop) / blockSize);
    let col = Math.floor((clientX - cv.offsetLeft) / blockSize);
    board.flipCell({ row, col });
  } else {
    let row = Math.floor((clientY - cv.offsetTop) / 100);
    config = ui.options[row];
    blockSize = cv.width / config.cols;
    cv.width = blockSize * config.cols;
    cv.height = blockSize * config.rows;
    board = new Board({
      rows: config.rows,
      cols: config.cols,
      mines: config.mines,
    });
    board.generateBoard();
  }
});

cv.addEventListener("contextmenu", (evt) => {
  evt.preventDefault();

  if (board) {
    let row = Math.floor((evt.clientY - cv.offsetTop) / blockSize);
    let col = Math.floor((evt.clientX - cv.offsetLeft) / blockSize);
    board.markCell({ row, col });
  } else {
  }
});
