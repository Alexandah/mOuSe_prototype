import "./Keybindings.js";

class WindowGrid {
  constructor(width, height) {
    this.widthPx = width;
    this.heightPx = height;
    this.gridBlockSizeX = width / 8;
    this.gridBlockSizeY = height / 8;
    this.grid = new Array(width / gridBlockSizeX);
    for (let i = 0; i < grid.length; i++) {
      this.grid[i] = new Array(height / gridBlockSizeY);
      for (let j = 0; j < grid[i].length; j++) {
        this.grid[i][j] = {};
      }
    }
    this.gridWidth = this.grid.length;
    this.gridHeight = this.grid[0].length;
    this.windows = {};
    this.selectorSize = [gridWidth, gridHeight];
    this.selected = null;

    this.DEFAULT_WINDOW_WIDTH = this.gridBlockSizeX * 2;
    this.DEFAULT_WINDOW_HEIGHT = this.gridBlockSizeY * 2;
  }

  /*
   *  0   1
   *  2   3
   */
  getSelectedQuadrant() {
    if (this.selected == null) return 0;
    var midX = this.gridWidth / 2;
    var midY = this.gridHeight / 2;
    var right = midX <= this.selected.gridX;
    var up = midY >= this.selected.gridY;
    if (!right && up) return 0;
    if (right && up) return 1;
    if (!right && !up) return 2;
    if (right && !up) return 3;
  }

  getTopLeftOfQuadrant(quadrant) {
    var midX = this.gridWidth / 2;
    var midY = this.gridHeight / 2;
    switch (quadrant) {
      case 0:
        return [0, 0];
      case 1:
        return [0, midY];
      case 2:
        return [midX, 0];
      case 3:
        return [midX, midY];
    }
  }

  selectWindow(window) {
    this.selected = window;
    //somehow update ui for old window too
    //TODO
  }

  markGridBlock(gridX, gridY, window) {
    var block = this.grid[gridX][gridY];
    block[window.id] = window;
  }

  unmarkGridBlock(gridX, gridY, window) {
    var block = this.grid[gridX][gridY];
    delete block[window.id];
  }

  markIntersectingGridBlocks(window) {
    for (var x = window.gridX; x < window.gridX + window.gridWidth; x++) {
      for (var y = window.gridY; y < window.gridY + window.gridHeight; y++) {
        this.markGridBlock(x, y, window);
      }
    }
  }

  addWindow() {
    var spawnPoint = this.getTopLeftOfQuadrant(this.getSelectedQuadrant());
    var window = new Window(
      spawnPoint[0],
      spawnPoint[1],
      this.DEFAULT_WINDOW_WIDTH,
      this.DEFAULT_WINDOW_HEIGHT,
      "New Window"
    );
    this.selectWindow(window);
    this.markIntersectingGridBlocks(window);
    this.windows[window.id] = window;
  }

  toggleGrab() {
    if (this.selected != null) {
      this.selected.grabbed = !this.selected.grabbed;
    }
  }

  pickBestAdjacentElement(start, gridX, gridY) {
    var block = this.grid[gridX][gridY];
    return block[Object.keys(block)[0]];
  }

  hopToElement(dir) {
    var dest;
    switch (dir) {
      case UP:
        for (var y = selected.gridY; y >= 0; y--) {
          if (this.grid[selected.gridX][y].length != 0) {
            dest = this.pickBestAdjacentElement(selected, selected.gridX, y);
            break;
          }
        }
        return;
      case DOWN:
        for (var y = selected.gridY; y < this.gridHeight; y++) {
          if (this.grid[selected.gridX][y].length != 0) {
            dest = this.pickBestAdjacentElement(selected, selected.gridX, y);
            break;
          }
        }
        return;
      case LEFT:
        for (var x = selected.gridX; x >= 0; x--) {
          if (this.grid[x][selected.gridY].length != 0) {
            dest = this.pickBestAdjacentElement(selected, x, selected.gridY);
            break;
          }
        }
        return;
      case RIGHT:
        for (var x = selected.gridX; x < this.gridWidth; x++) {
          if (this.grid[x][selected.gridY].length != 0) {
            dest = this.pickBestAdjacentElement(selected, x, selected.gridY);
            break;
          }
        }
        return;
    }
    this.selectWindow(dest);
  }

  changeSelectorSize() {
    //TODO
  }

  expandSelector() {
    //TODO
    changeSelectorSize();
  }

  shrinkSelector() {
    //TODO
    changeSelectorSize();
  }
}

class Element {
  constructor(gridX, gridY, gridWidth, gridHeight, canMove) {
    this.id = new Date().getTime();
    this.gridX = gridX;
    this.gridY = gridY;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.canMove = canMove;
    this.grabbed = false;
  }
}

class Window extends Element {
  constructor(gridX, gridY, gridWidth, gridHeight, name) {
    super(gridX, gridY, gridWidth, gridHeight, true);
    this.name = name;
  }
}
