/*
  This prototype will just focus on resizing and moving windows,
  ignoring selector size/ child elements
*/

class TPGridBlock {
  constructor() {
    this.intersects = {};
  }
}

class TPGridRect {
  constructor(topleft, width, height) {
    this.id = +new Date().getTime();
    this.topleft = topleft;
    this.x = topleft[0];
    this.y = topleft[1];
    this.width = width;
    this.height = height;
  }

  left() {}

  right() {}

  bottom() {}

  top() {}

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  setPos(newTopLeft) {
    this.topleft = newTopLeft;
    this.x = topleft[0];
    this.y = topleft[1];
  }
}

class TPGrid {
  constructor(widthPx, heightPx, blockSizeFactor) {
    this.widthPx = widthPx;
    this.heightPx = heightPx;
    this.blockSizeX = widthPx / blockSizeFactor;
    this.blockSizeY = heightPx / blockSizeFactor;
    this.gridWidth = widthPx / blockSizeX;
    this.gridHeight = heightPx / blockSizeY;
    // this.numBlocks = (widthPx * heightPx) / (this.blockSizeX * this.blockSizeY)
    this.grid = new Array(gridWidth);
    for (var i = 0; i < numBlocks; i++) {
      this.grid[i] = new Array(this.gridHeight);
      for (var j = 0; j < this.gridHeight; j++) {
        this.grid[i][j] = new TPGridBlock();
      }
    }
    this.windows = {};
    this.selected = null;

    this.DEFAULT_WINDOW_SIZE_X = this.blockSizeX * 2;
    this.DEFAULT_WINDOW_SIZE_Y = this.blockSizeY * 2;
  }

  markIntersectingBlocks(window) {
    for (var i = window.x; i < window.width; i++) {
      for (var j = window.y; j < window.height; j++) {
        var block = grid[i][j];
        block.intersects[window.id] = window.id;
      }
    }
  }

  unmarkIntersectingBlocks(window) {
    for (var i = window.x; i < window.width; i++) {
      for (var j = window.y; j < window.height; j++) {
        var block = grid[i][j];
        delete block.intersects[window.id];
      }
    }
  }

  selectInitialWindow() {
    if (this.windows.length > 0) {
      this.selected = this.windows[Object.keys(this.windows)[0]];
    } else this.selected = null;
  }

  openWindow() {
    var window = new TPGridRect(
      [0, 0],
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

  hasIntersection(block) {
    return block.intersects.length > 0;
  }

  getIntersection(block) {
    return block.intersects[Object.keys(block.intersects)[0]];
  }

  getClosestWindowLeft(window) {
    var left = window.left();
    //Search for any items directly left
    for (var x = left.x - 1; x >= 0; x--) {
      var block = this.grid[x][left.y];
      if (this.hasIntersection(block)) return this.getIntersection(block);
    }
    //Since you didn't find any, begin to look for the nearest item
    //in the vertical left direction too
    for (var x = left.x - 1; x >= 0; x--) {
      for (var y = left.y + 1; y < this.gridHeight; y++) {
        var block = this.grid[x][y];
        if (this.hasIntersection(block)) return this.getIntersection(block);
      }
      for (var y = left.y - 1; y >= 0; y--) {
        var block = this.grid[x][y];
        if (this.hasIntersection(block)) return this.getIntersection(block);
      }
    }
    //You found nothing.
    return null;
  }
  getClosestWindowRight(window) {}
  getClosestWindowUp(window) {}
  getClosestWindowDown(window) {}
  moveToAdjacentWindow(dir) {}
}
