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
  constructor(topleft, rectWidth, rectHeight, gridWidth, gridHeight) {
    this.id = nextId++;
    this.x = Math.floor(topleft[0]);
    this.y = Math.floor(topleft[1]);
    this.topleft = [this.x, this.y];
    this.width = Math.floor(rectWidth);
    this.height = Math.floor(rectHeight);
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
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
    var atRightEdge = this.x === this.gridWidth - 1;
    var oneRight = atRightEdge ? this.x : this.x + this.width;
    return { x: oneRight, y: this.y + Math.floor(this.height / 2) };
  }

  right() {
    var atBottomEdge = this.y === this.gridHeight - 1;
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
    this.blockSizeFactor = blockSizeFactor;
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

  gridPosToPx(x, y) {
    return { x: x * this.blockSizeFactor, y: y * this.blockSizeFactor };
  }

  markIntersectingBlocks(window) {
    for (var i = window.x; i < window.x + window.width; i++) {
      for (var j = window.y; j < window.y + window.height; j++) {
        var block = this.grid[i][j];
        block.intersects[window.id] = window;
      }
    }
  }

  numBlocksMarked() {
    var numMarked = 0;
    for (var i = 0; i < this.gridWidth; i++) {
      for (var j = 0; j < this.gridHeight; j++) {
        var block = this.grid[i][j];
        if (block.hasIntersection()) numMarked++;
      }
    }
    return numMarked;
  }

  unmarkIntersectingBlocks(window) {
    for (var i = window.x; i < window.x + window.width; i++) {
      for (var j = window.y; j < window.y + window.height; j++) {
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
      this.DEFAULT_WINDOW_SIZE_Y,
      this.gridWidth,
      this.gridHeight
    );
    this.markIntersectingBlocks(window);
    this.windows[window.id] = window;
    this.selected = window;
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
    if (newWidth >= this.gridWidth) newWidth = this.gridWidth;
    else if (this.DEFAULT_WINDOW_SIZE_X > newWidth)
      newWidth = this.DEFAULT_WINDOW_SIZE_X;
    if (newHeight >= this.gridHeight) newHeight = this.gridHeight;
    else if (this.DEFAULT_WINDOW_SIZE_Y > newHeight)
      newHeight = this.DEFAULT_WINDOW_SIZE_Y;

    this.unmarkIntersectingBlocks(window);
    window.resize(newWidth, newHeight);
    var newTopLeft = [window.x, window.y];
    if (window.x + window.width - 1 >= this.gridWidth) {
      // var amountExceededX = window.x + window.width - 1 - this.gridWidth;
      // newTopLeft[0] = amountExceededX;
      //easy solution
      newTopLeft[0] = 0;
    }
    if (window.y + window.height - 1 >= this.gridHeight) {
      // var amountExceededY = window.y + window.height - 1 - this.gridHeight;
      // newTopLeft[1] = amountExceededY;
      //easy solution
      newTopLeft[1] = 0;
    }
    window.setPos(newTopLeft);
    this.markIntersectingBlocks(window);
  }

  //Scan along an expanding radius, on a line perpendicular to the given point on the vertical axis
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

  //Scan along an expanding radius, on a line perpendicular to the given point on the horizontal axis
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
    var newTopLeft = [window.x, window.y];
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
      assert(grid.selected.id == 2);
      grid.moveToAdjacentWindow(Keybindings.UP);
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
      var initNumBlocksMarked = grid.numBlocksMarked();
      grid.shiftWindow(window, Keybindings.DOWN);
      assert(grid.numBlocksMarked() == initNumBlocksMarked);
      assert(window.x == 2 && window.y == 0);
      grid.shiftWindow(window, Keybindings.RIGHT);
      assert(grid.numBlocksMarked() == initNumBlocksMarked);
      assert(window.x == 2 && window.y == 2);
      grid.shiftWindow(window, Keybindings.RIGHT);
      assert(grid.numBlocksMarked() == initNumBlocksMarked);
      assert(window.x == 2 && window.y == 4);
      grid.shiftWindow(window, Keybindings.UP);
      assert(grid.numBlocksMarked() == initNumBlocksMarked);
      assert(window.x == 0 && window.y == 4);
      grid.shiftWindow(window, Keybindings.UP);
      assert(grid.numBlocksMarked() == initNumBlocksMarked);
      assert(window.x == 0 && window.y == 4);
      grid.shiftWindow(window, Keybindings.LEFT);
      assert(grid.numBlocksMarked() == initNumBlocksMarked);
      assert(window.x == 0 && window.y == 2);
    },
  },
  {
    name: "Window Resizer 1",
    func: function () {
      var grid = new TPGrid(100, 100, 10);
      var window = grid.openWindow(4, 4);

      grid.resizeWindow(window, window.width * 2, window.height * 2);
      assert(window.width == 4 && window.height == 4);
      grid.moveWindow(window, [0, 0]);
      assert(window.width == 4 && window.height == 4);
      assert(window.x == 0 && window.y == 0);
      grid.resizeWindow(window, window.width * 2, window.height * 2);
      assert(window.width == 8 && window.height == 8);
      grid.resizeWindow(window, grid.gridWidth, grid.gridHeight);
      assert(window.width == 10 && window.height == 10);
      grid.resizeWindow(window, window.width * 2, window.height * 2);
      assert(window.width == 10 && window.height == 10);
      grid.resizeWindow(window, window.width * 2, window.height * 2);
      assert(window.width == 10 && window.height == 10);
      grid.resizeWindow(window, window.width / 2, window.height / 2);
      assert(window.width == 5 && window.height == 5);
      grid.moveWindow(window, [5, 4]);
      assert(window.width == 5 && window.height == 5);
      assert(window.x == 5 && window.y == 4);
      grid.resizeWindow(window, window.width * 2, window.height * 2);
      assert(window.width == 10 && window.height == 10);
      assert(window.x == 0 && window.y == 0);
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

// export { TPGridRect, TPGrid };
