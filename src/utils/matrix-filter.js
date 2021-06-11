module.exports = (cell, mine) => {
  if (cell.row === mine.row - 1 && cell.col === mine.col - 1) return true;
  if (cell.row === mine.row && cell.col === mine.col - 1) return true;
  if (cell.row === mine.row + 1 && cell.col === mine.col - 1) return true;

  if (cell.row === mine.row - 1 && cell.col === mine.col) return true;
  if (cell.row === mine.row + 1 && cell.col === mine.col) return true;

  if (cell.row === mine.row - 1 && cell.col === mine.col + 1) return true;
  if (cell.row === mine.row && cell.col === mine.col + 1) return true;
  if (cell.row === mine.row + 1 && cell.col === mine.col + 1) return true;

  if (cell.row + 1 === mine.row && cell.col + 1 === mine.col) return true; 
};
