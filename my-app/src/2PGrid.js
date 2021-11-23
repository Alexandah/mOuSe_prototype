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

//this is a hack because TPGridRect isn't a child class of TPGrid
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

class TPGridBlock {
  constructor() {
    this.intersects = {};
  }

  hasIntersection() {
    return Object.keys(this.intersects).length > 0;
  }

  getIntersection() {
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

  //todo: change local vars to reflect what the method actually does. low priority
  top() {
    var atLeftEdge = this.x === 0;
    var oneLeft = atLeftEdge ? this.x : this.x - 1;
    return { x: oneLeft, y: this.y + Math.floor(this.height / 2) };
  }

  bottom() {
    var atRightEdge = this.x === GRID_WIDTH - 1;
    var oneRight = atRightEdge ? this.x : this.x + this.width;
    return { x: oneRight, y: this.y + Math.floor(this.height / 2) };
  }

  right() {
    var atBottomEdge = this.y === GRID_HEIGHT - 1;
    var oneBelow = atBottomEdge ? this.y : this.y + this.height;
    return { x: this.x + Math.floor(this.width / 2), y: oneBelow };
  }

  left() {
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

  printGridPos(x, y) {
    for (var i = 0; i < this.gridWidth; i++) {
      var row = "";
      for (var j = 0; j < this.gridHeight; j++) {
        var item = "_";
        if (this.grid[i][j].hasIntersection()) item = "X";
        if (i === x && j === y) item = "~";
        row += item + ",";
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
    return window;
  }

  closeWindow(window) {
    var deletedId = window.id;
    this.unmarkIntersectingBlocks(window);
    delete this.windows[window.id];
    if (deletedId == this.selected.id) this.selectInitialWindow();
  }

  moveWindow(window, newTopLeft) {
    this.unmarkIntersectingBlocks(window);
    window.setPos(newTopLeft);
    this.markIntersectingBlocks(window);
  }

  resizeWindow(window, newWidth, newHeight) {
    this.unmarkIntersectingBlocks(window);
    window.resize(newWidth, newHeight);
    //todo: move window to keep in screen as appropriate
    this.markIntersectingBlocks(window);
  }

  //Scan along an expanding radius, on a line parallel to the given point on the vertical axis
  perpendicularScanVertical(x, y) {
    var r = 1;
    while (true) {
      var canContinueUp = x + r < this.gridWidth;
      var canContinueDown = x - r >= 0;
      var canContinue = canContinueUp || canContinueDown;
      if (!canContinue) return null;

      if (canContinueUp) {
        var block = this.grid[x + r][y];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }

      if (canContinueDown) {
        var block = this.grid[x - r][y];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }
      r++;
    }
  }

  //Scan along an expanding radius, on a line parallel to the given point on the horizontal axis
  perpendicularScanHorizontal(x, y) {
    var r = 1;
    while (true) {
      var canContinueRight = y + r < this.gridHeight;
      var canContinueLeft = y - r >= 0;
      var canContinue = canContinueRight || canContinueLeft;
      if (!canContinue) return null;

      if (canContinueRight) {
        var block = this.grid[x][y + r];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }

      if (canContinueLeft) {
        var block = this.grid[x][y - r];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }
      r++;
    }
  }

  getClosestWindowLeft(window) {
    var left = window.left();
    for (var y = left.y; y >= 0; y--) {
      var block = this.grid[left.x][y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var y = left.y; y >= 0; y--) {
      var found = this.perpendicularScanVertical(left.x, y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  }

  getClosestWindowRight(window) {
    var right = window.right();
    for (var y = right.y; y < this.gridHeight; y++) {
      var block = this.grid[right.x][y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var y = right.y; y < this.gridHeight; y++) {
      var found = this.perpendicularScanVertical(right.x, y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  }

  getClosestWindowUp(window) {
    var up = window.top();
    for (var x = up.x; x >= 0; x--) {
      var block = this.grid[x][up.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var x = up.x; x >= 0; x--) {
      var found = this.perpendicularScanHorizontal(x, up.y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  }

  getClosestWindowDown(window) {
    var down = window.bottom();
    for (var x = down.x; x < this.gridWidth; x++) {
      var block = this.grid[x][down.y];
      if (block.hasIntersection()) return block.getIntersection();
    }

    for (var x = down.x; x < this.gridWidth; x++) {
      var found = this.perpendicularScanHorizontal(x, down.y);
      if (found != null) return found;
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

  //Moves the window by the amount of its width/height in the given direction
  shiftWindow(window, dir) {
    var newTopLeft = window.topleft;
    switch (dir) {
      case Keybindings.UP:
        var newX = newTopLeft[0] - window.width;
        if (newX >= 0) newTopLeft[0] = newX;
        break;
      case Keybindings.DOWN:
        var newX = newTopLeft[0] + window.width;
        if (newX < this.gridWidth) newTopLeft[0] = newX;
        break;
      case Keybindings.LEFT:
        var newY = newTopLeft[1] - window.height;
        if (newY >= 0) newTopLeft[1] = newY;
        break;
      case Keybindings.RIGHT:
        var newY = newTopLeft[1] + window.height;
        if (newY < this.gridHeight) newTopLeft[1] = newY;
        break;
    }
    this.moveWindow(window, newTopLeft);
  }
}

/*
 * Testing Area
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

const TESTS = [
  {
    name: "Window Selection Hopper 1",
    func: function () {
      var grid = new TPGrid(100, 100, 10);
      grid.openWindow(0, 0);
      grid.openWindow(7, 0);
      grid.openWindow(5, 5);
      assert(grid.selected.id == 0);
      grid.moveToAdjacentWindow(Keybindings.DOWN);
      assert(grid.selected.id == 1);
      grid.moveToAdjacentWindow(Keybindings.UP);
      assert(grid.selected.id == 0);
      grid.moveToAdjacentWindow(Keybindings.RIGHT);
      assert(grid.selected.id == 2);
      grid.moveToAdjacentWindow(Keybindings.LEFT);
      assert(grid.selected.id == 1);
    },
  },
  {
    name: "Window Shifter 1",
    func: function () {
      var grid = new TPGrid(100, 100, 10);
      var window = grid.openWindow(0, 0);
      console.log("grid windows: ", grid.windows);
      grid.printGrid();
      var oldPos;
      grid.shiftWindow(window, Keybindings.DOWN);
      console.log("~~~~~~~~~~~~~~~~~~~~");
      grid.printGrid();
      grid.shiftWindow(window, Keybindings.RIGHT);
      console.log("~~~~~~~~~~~~~~~~~~~~");
      grid.printGrid();
      grid.shiftWindow(window, Keybindings.RIGHT);
      console.log("~~~~~~~~~~~~~~~~~~~~");
      grid.printGrid();
      grid.shiftWindow(window, Keybindings.UP);
      console.log("~~~~~~~~~~~~~~~~~~~~");
      grid.printGrid();
      grid.shiftWindow(window, Keybindings.UP);
      console.log("~~~~~~~~~~~~~~~~~~~~");
      grid.printGrid();
      grid.shiftWindow(window, Keybindings.LEFT);
      console.log("~~~~~~~~~~~~~~~~~~~~");
      grid.printGrid();
      console.log("grid windows: ", grid.windows);
      assert(false);
    },
  },
];

function tester(testName, testFunc) {
  console.log("Running test: " + testName);
  assert(testFunc(), "Test failed: " + testName);
}

TESTS.forEach((test) =>
  tester(test.name, function () {
    try {
      test.func();
      return true;
    } catch (e) {
      return false;
    }
  })
);
