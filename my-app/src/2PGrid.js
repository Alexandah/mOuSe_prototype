// import Keybindings from "./Keybindings";
//temp for testing since imports are screwy without npm start
const Keybindings = {
  UP: "k",
  DOWN: "j",
  LEFT: "h",
  RIGHT: "l",
  CLICK: "spacebar",
};

/*
  This prototype will just focus on resizing and moving windows,
  ignoring selector size/child elements
*/

const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

class TPGridBlock {
  constructor() {
    this.intersects = {};
  }

  hasIntersection() {
    // console.log("checking intersection");
    return Object.keys(this.intersects).length > 0;
  }

  getIntersection() {
    // console.log("getting intersection");
    return this.intersects[Object.keys(this.intersects)[0]];
  }
}

var nextId = 0;
class TPGridRect {
  constructor(topleft, width, height) {
    this.id = nextId++;
    this.x = Math.floor(topleft[0]);
    this.y = Math.floor(topleft[1]);
    this.topleft = [this.x, this.y];
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  /*
  These return the point in the middle (dir) of the edge of the rect
  plus 1*direction 
  */

  left() {
    var atLeftEdge = this.x === 0;
    var oneLeft = atLeftEdge ? this.x : this.x - 1;
    return { x: oneLeft, y: this.y + Math.floor(this.height / 2) };
  }

  right() {
    var atRightEdge = this.x === GRID_WIDTH - 1;
    var oneRight = atRightEdge ? this.x : this.x + this.width;
    return { x: oneRight, y: this.y + Math.floor(this.height / 2) };
  }

  bottom() {
    var atBottomEdge = this.y === GRID_HEIGHT - 1;
    var oneBelow = atBottomEdge ? this.y : this.y + this.height;
    return { x: this.x + Math.floor(this.width / 2), y: oneBelow };
  }

  top() {
    var atTopEdge = this.y === 0;
    var oneAbove = atTopEdge ? this.y : this.y - 1;
    return { x: this.x + Math.floor(this.width / 2), y: oneAbove };
  }

  resize(width, height) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  setPos(newTopLeft) {
    this.x = Math.floor(newTopLeft[0]);
    this.y = Math.floor(newTopLeft[1]);
    this.topleft = [this.x, this.y];
  }
}

class TPGrid {
  constructor(widthPx, heightPx, blockSizeFactor) {
    this.widthPx = widthPx;
    this.heightPx = heightPx;
    this.blockSizeX = widthPx / blockSizeFactor;
    this.blockSizeY = heightPx / blockSizeFactor;
    this.gridWidth = widthPx / this.blockSizeX;
    this.gridHeight = heightPx / this.blockSizeY;
    this.numBlocks = (widthPx * heightPx) / (this.blockSizeX * this.blockSizeY);
    this.numBlocksX = this.numBlocks / this.gridHeight;
    this.numBlocksY = this.numBlocks / this.gridWidth;
    this.grid = new Array(this.gridWidth);
    for (var i = 0; i < this.gridWidth; i++) {
      this.grid[i] = new Array(this.gridHeight);
      for (var j = 0; j < this.gridHeight; j++) {
        this.grid[i][j] = new TPGridBlock();
      }
    }
    this.windows = {};
    this.selected = null;

    this.DEFAULT_WINDOW_SIZE_X = (this.numBlocksX / blockSizeFactor) * 2;
    this.DEFAULT_WINDOW_SIZE_Y = (this.numBlocksY / blockSizeFactor) * 2;
  }

  printGrid() {
    for (var i = 0; i < this.gridWidth; i++) {
      var row = "";
      for (var j = 0; j < this.gridHeight; j++) {
        row += this.grid[i][j].hasIntersection() ? "X," : "_,";
      }
      console.log(row);
    }
  }

  markIntersectingBlocks(window) {
    for (var i = window.x; i < window.x + window.width; i++) {
      for (var j = window.y; j < window.y + window.height; j++) {
        var block = this.grid[i][j];
        block.intersects[window.id] = window;
      }
    }
  }

  unmarkIntersectingBlocks(window) {
    for (var i = window.x; i < window.x + window.width; i++) {
      for (var j = window.y; j < window.x + window.height; j++) {
        var block = this.grid[i][j];
        delete block.intersects[window.id];
      }
    }
  }

  selectInitialWindow() {
    if (Object.keys(this.windows).length > 0) {
      this.selected = this.windows[Object.keys(this.windows)[0]];
    } else this.selected = null;
  }

  openWindow(gridX, gridY) {
    var window = new TPGridRect(
      [gridX, gridY],
      this.DEFAULT_WINDOW_SIZE_X,
      this.DEFAULT_WINDOW_SIZE_Y
    );
    this.markIntersectingBlocks(window);
    this.windows[window.id] = window;
    if (this.selected == null) this.selectInitialWindow();
  }

  closeWindow(window) {
    var deletedId = window.id;
    this.unmarkIntersectingBlocks(window);
    delete this.windows[window.id];
    if (deletedId == this.selected.id) this.selectInitialWindow();
  }

  moveWindow(window, newTopLeft) {
    unmarkIntersectingBlocks(window);
    window.setPos(newTopLeft);
    markIntersectingBlocks(window);
  }

  resizeWindow(window, newWidth, newHeight) {
    unmarkIntersectingBlocks(window);
    window.resize(newWidth, newHeight);
    //todo: move window to keep in screen as appropriate
    markIntersectingBlocks(window);
  }

  getClosestWindowLeft(window) {
    var left = window.left();
    console.log("left ", left);
    //Search for any items directly left
    for (var x = left.x; x >= 0; x--) {
      var block = this.grid[x][left.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    //Since you didn't find any, begin to look for the nearest item
    //in the vertical left direction too
    for (var x = left.x; x >= 0; x--) {
      for (var y = left.y + 1; y < this.gridHeight; y++) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
      for (var y = left.y - 1; y >= 0; y--) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
    }
    //You found nothing.
    console.log("found nothing");
    return window;
  }

  getClosestWindowRight(window) {
    var right = window.right();
    console.log("right ", right);
    for (var x = right.x; x < this.gridWidth; x++) {
      var block = this.grid[x][right.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    //Since you didn't find any, begin to look for the nearest item
    //in the vertical right direction too
    for (var x = right.x; x < this.gridWidth; x++) {
      for (var y = right.y + 1; y < this.gridHeight; y++) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
      for (var y = right.y - 1; y >= 0; y--) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
    }
    //You found nothing.
    console.log("found nothing");
    return window;
  }

  getClosestWindowUp(window) {
    var up = window.top();
    for (var y = up.y; y >= 0; y--) {
      var block = this.grid[up.x][y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var y = up.y; y >= 0; y--) {
      for (var x = up.x + 1; x < this.gridWidth; x++) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
      for (var x = up.x - 1; x >= 0; x--) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
    }
    //You found nothing.
    return window;
  }

  getClosestWindowDown(window) {
    var down = window.bottom();
    for (var y = down.y; y < this.gridHeight; y++) {
      var block = this.grid[down.x][y];
      if (block.hasIntersection()) return block.getIntersection();
    }

    for (var y = down.y; y < this.gridHeight; y++) {
      for (var x = down.x + 1; x < this.gridWidth; x++) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
      for (var x = down.x - 1; x >= 0; x--) {
        var block = this.grid[x][y];
        if (block.hasIntersection()) return block.getIntersection();
      }
    }
    //You found nothing.
    return window;
  }

  moveToAdjacentWindow(dir) {
    switch (dir) {
      case Keybindings.UP:
        this.selected = this.getClosestWindowUp(this.selected);
        break;
      case Keybindings.DOWN:
        this.selected = this.getClosestWindowDown(this.selected);
        break;
      case Keybindings.LEFT:
        this.selected = this.getClosestWindowLeft(this.selected);
        break;
      case Keybindings.RIGHT:
        this.selected = this.getClosestWindowRight(this.selected);
        break;
    }
  }
}

var grid = new TPGrid(100, 100, 10);
console.log(grid.numBlocks);
console.log(grid.gridHeight);
console.log(grid.gridWidth);
grid.openWindow(0, 0);
grid.openWindow(5, 5);
grid.printGrid();
// console.log("windows: ");
// console.log(grid.windows);
console.log("selected: ");
console.log(grid.selected.id);
grid.moveToAdjacentWindow(Keybindings.DOWN);
console.log("selected: ");
console.log(grid.selected.id);
grid.moveToAdjacentWindow(Keybindings.UP);
console.log("selected: ");
console.log(grid.selected.id);
grid.moveToAdjacentWindow(Keybindings.RIGHT);
console.log("selected: ");
console.log(grid.selected.id);
grid.moveToAdjacentWindow(Keybindings.LEFT);
console.log("selected: ");
console.log(grid.selected.id);
