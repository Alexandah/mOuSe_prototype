import { useState } from "react";
import Keybindings from "./Keybindings";
import useEventListener from "@use-it/event-listener";

const BLACK_OUTLINE_COLOR = "#000000";
const ORANGE_OUTLINE_COLOR = "#ffa500";

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

function makeUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

//in grid coords
class TPGridRectData {
  constructor(x, y, width, height) {
    this.id = makeUniqueId();
    this.x = Math.floor(x);
    this.y = Math.floor(y);
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
    var atRightEdge = this.x === this.gridWidth - 1;
    var oneRight = atRightEdge ? this.x : this.x + this.width;
    return { x: oneRight, y: this.y + Math.floor(this.height / 2) };
  }

  bottom() {
    var atBottomEdge = this.y === this.gridHeight - 1;
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

  setPos(x, y) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }
}

//in world coords
function TPGridRect(props) {
  const outlineColor = props.isSelected
    ? ORANGE_OUTLINE_COLOR
    : BLACK_OUTLINE_COLOR;

  return (
    <div
      style={{
        border: `2px solid ${outlineColor}`,
        width: `${props.widthPx}px`,
        height: `${props.heightPx}px`,
        x: props.xPx,
        y: props.yPx,
        position: `absolute`,
      }}
    >
      {props.children}
    </div>
  );
}

function TPGrid({ pxWidth, pxHeight, blockSizeFactor }) {
  const gridBlockSizeX = pxWidth / blockSizeFactor;
  const gridBlockSizeY = pxHeight / blockSizeFactor;
  const gridBlocksWidth = pxWidth / gridBlockSizeX;
  const gridBlocksHeight = pxHeight / gridBlockSizeY;
  const numBlocks = (pxWidth * pxHeight) / (gridBlockSizeX * gridBlockSizeY);
  const numBlocksX = numBlocks / gridBlocksWidth;
  const numBlocksY = numBlocks / gridBlocksHeight;
  const DEFAULT_WINDOW_SIZE_X = (numBlocksX / blockSizeFactor) * 2;
  const DEFAULT_WINDOW_SIZE_Y = (numBlocksY / blockSizeFactor) * 2;

  let initGrid = new Array(gridBlocksWidth);
  for (var i = 0; i < gridBlocksWidth; i++) {
    initGrid[i] = new Array(gridBlocksHeight);
    for (var j = 0; j < gridBlocksHeight; j++) {
      initGrid[i][j] = new TPGridBlock();
    }
  }
  const [grid, setGrid] = useState(initGrid);
  const [windows, setWindows] = useState({});
  const [selected, setSelected] = useState(null);

  const gridPosToPx = (x, y) => {
    return { x: x * blockSizeFactor, y: y * blockSizeFactor };
  };

  const markIntersectingBlocks = (window) => {
    for (var i = window.x; i < window.x + window.width; i++) {
      for (var j = window.y; j < window.y + window.height; j++) {
        var block = grid[i][j];
        block.intersects[window.id] = window;
      }
    }
    setGrid(grid);
  };

  const numBlocksMarked = () => {
    var numMarked = 0;
    for (var i = 0; i < gridBlocksWidth; i++) {
      for (var j = 0; j < gridBlocksHeight; j++) {
        var block = grid[i][j];
        if (block.hasIntersection()) numMarked++;
      }
    }
    return numMarked;
  };

  const unmarkIntersectingBlocks = (window) => {
    for (var i = window.x; i < window.x + window.width; i++) {
      for (var j = window.y; j < window.y + window.height; j++) {
        var block = grid[i][j];
        delete block.intersects[window.id];
      }
    }
    setGrid(grid);
  };

  const selectInitialWindow = () => {
    if (Object.keys(windows).length > 0) {
      setSelected(windows[Object.keys(windows)[0]]);
    } else setSelected(null);
  };

  const openWindow = (gridX, gridY) => {
    var window = new TPGridRectData(
      gridX,
      gridY,
      DEFAULT_WINDOW_SIZE_X,
      DEFAULT_WINDOW_SIZE_Y
    );
    windows[window.id] = window;
    setWindows(windows);
    markIntersectingBlocks(window);
    setSelected(window);
    return window;
  };

  const closeWindow = (window) => {
    var deletedId = window.id;
    unmarkIntersectingBlocks(window);
    delete windows[window.id];
    setWindows(windows);
    if (deletedId == selected.id) selectInitialWindow();
  };

  const moveWindow = (window, x, y) => {
    unmarkIntersectingBlocks(window);
    window.setPos(x, y);
    windows[window.id] = window;
    setWindows(windows);
    markIntersectingBlocks(window);
  };

  const resizeWindow = (window, newWidth, newHeight) => {
    if (newWidth >= gridBlocksWidth) newWidth = gridBlocksWidth;
    else if (DEFAULT_WINDOW_SIZE_X > newWidth) newWidth = DEFAULT_WINDOW_SIZE_X;
    if (newHeight >= gridBlocksHeight) newHeight = gridBlocksHeight;
    else if (DEFAULT_WINDOW_SIZE_Y > newHeight)
      newHeight = DEFAULT_WINDOW_SIZE_Y;

    unmarkIntersectingBlocks(window);
    window.resize(newWidth, newHeight);
    var newX = window.x;
    var newY = window.y;
    if (window.x + window.width - 1 >= this.gridWidth) {
      // var amountExceededX = window.x + window.width - 1 - this.gridWidth;
      // newTopLeft[0] = amountExceededX;
      //easy solution
      newX = 0;
    }
    if (window.y + window.height - 1 >= this.gridHeight) {
      // var amountExceededY = window.y + window.height - 1 - this.gridHeight;
      // newTopLeft[1] = amountExceededY;
      //easy solution
      newY = 0;
    }
    window.setPos(newX, newY);
    windows[window.id] = window;
    setWindows(windows);
    markIntersectingBlocks(window);
  };

  //Scan along an expanding radius, on a line perpendicular to the given point on the vertical axis
  const perpendicularScanVertical = (x, y) => {
    var r = 1;
    while (true) {
      var canContinueUp = y + r < gridBlocksHeight;
      var canContinueDown = y - r >= 0;
      var canContinue = canContinueUp || canContinueDown;
      if (!canContinue) return null;

      if (canContinueUp) {
        var block = grid[x][y + r];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }

      if (canContinueDown) {
        var block = grid[x][y - r];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }
      r++;
    }
  };

  //Scan along an expanding radius, on a line perpendicular to the given point on the horizontal axis
  const perpendicularScanHorizontal = (x, y) => {
    var r = 1;
    while (true) {
      var canContinueRight = x + r < gridBlocksWidth;
      var canContinueLeft = x - r >= 0;
      var canContinue = canContinueRight || canContinueLeft;
      if (!canContinue) return null;

      if (canContinueRight) {
        var block = grid[x + r][y];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }

      if (canContinueLeft) {
        var block = grid[x - r][y];
        if (block.hasIntersection()) {
          return block.getIntersection();
        }
      }
      r++;
    }
  };

  const getClosestWindowUp = (window) => {
    var up = window.up();
    for (var y = up.y; y >= 0; y--) {
      var block = grid[window.x][up.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var y = up.y; y >= 0; y--) {
      var found = perpendicularScanVertical(window.x, up.y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  };

  const getClosestWindowDown = (window) => {
    var down = window.bottom();
    for (var y = down.y; y < gridBlocksHeight; y++) {
      var block = grid[window.x][down.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var y = down.y; y < gridBlocksHeight; y++) {
      var found = perpendicularScanVertical(window.x, down.y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  };

  const getClosestWindowLeft = (window) => {
    var left = window.left();
    for (var x = left.x; x >= 0; x--) {
      var block = grid[left.x][window.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var x = left.x; x >= 0; x--) {
      var found = perpendicularScanHorizontal(left.x, window.y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  };

  const getClosestWindowRight = (window) => {
    var right = window.right();
    for (var x = right.x; x < gridBlocksWidth; x++) {
      var block = grid[right.x][window.y];
      if (block.hasIntersection()) return block.getIntersection();
    }
    for (var x = right.x; x < gridBlocksWidth; x++) {
      var found = perpendicularScanHorizontal(right.x, window.y);
      if (found != null) return found;
    }
    //You found nothing.
    return window;
  };

  const moveToAdjacentWindow = (dir) => {
    switch (dir) {
      case Keybindings.UP:
        setSelected(getClosestWindowUp(selected));
        break;
      case Keybindings.DOWN:
        setSelected(getClosestWindowDown(this.selected));
        break;
      case Keybindings.LEFT:
        setSelected(getClosestWindowLeft(this.selected));
        break;
      case Keybindings.RIGHT:
        setSelected(getClosestWindowRight(this.selected));
        break;
    }
  };

  //Moves the window by the amount of its width/height in the given direction
  const shiftWindow = (window, dir) => {
    var newTopLeft = [window.x, window.y];
    var newX = window.x;
    var newY = window.y;
    switch (dir) {
      case Keybindings.UP:
        if (newX - window.width >= 0) newX -= window.width;
        break;
      case Keybindings.DOWN:
        if (newX + window.width < gridBlocksWidth) newX += window.width;
        break;
      case Keybindings.LEFT:
        if (newY - window.height >= 0) newY -= window.height;
        break;
      case Keybindings.RIGHT:
        if (newY + window.height < gridBlocksHeight) newY += window.height;
        break;
    }
    moveWindow(window, newX, newY);
  };

  const hasKeyDown = (e, keycode) => {
    switch (keycode) {
      case "altKey":
        return e.altKey;
      case "ctrlKey":
        return e.ctrlKey;
      case "metaKey":
        return e.metaKey;
      case "shiftKey":
        return e.shiftKey;
      case e.key:
        return true;
      default:
        return false;
    }
  };

  const handleKeyboard = (e) => {
    e.preventDefault();
    var dir;
    switch (e) {
      case hasKeyDown(e, Keybindings.MOD):
        switch (e) {
          case hasKeyDown(e, Keybindings.NEW_WINDOW):
            openWindow(0, 0);
            break;
          case hasKeyDown(e, Keybindings.UP):
            shiftWindow(selected, Keybindings.UP);
            break;
          case hasKeyDown(e, Keybindings.DOWN):
            shiftWindow(selected, Keybindings.DOWN);
            break;
          case hasKeyDown(e, Keybindings.RIGHT):
            shiftWindow(selected, Keybindings.RIGHT);
            break;
          case hasKeyDown(e, Keybindings.LEFT):
            shiftWindow(selected, Keybindings.LEFT);
            break;
          case hasKeyDown(e, Keybindings.CLOSE_WINDOW):
            closeWindow(selected);
            break;
        }
        break;
      default:
        switch (e) {
          case hasKeyDown(e, Keybindings.UP):
            moveToAdjacentWindow(Keybindings.UP);
            break;
          case hasKeyDown(e, Keybindings.DOWN):
            moveToAdjacentWindow(Keybindings.DOWN);
            break;
          case hasKeyDown(e, Keybindings.RIGHT):
            moveToAdjacentWindow(Keybindings.RIGHT);
            break;
          case hasKeyDown(e, Keybindings.LEFT):
            moveToAdjacentWindow(Keybindings.LEFT);
            break;
        }
        break;
    }
  };
  useEventListener("keydown", handleKeyboard);

  return (
    <div
      style={{
        border: `2px solid ${BLACK_OUTLINE_COLOR}`,
        width: pxWidth,
        height: pxHeight,
      }}
    >
      {Object.keys(windows).map((id) => {
        var window = windows[id];
        var isSelected = window === selected;
        var screenDim = gridPosToPx(window.width, window.height);
        var screenPos = gridPosToPx(window.x, window.y);
        return (
          <TPGridRect
            isSelected={isSelected}
            x={screenPos.x}
            y={screenPos.y}
            width={screenDim.x}
            height={screenDim.y}
          >
            Wassup cunt?
          </TPGridRect>
        );
      })}
    </div>
  );
}
export default TPGrid;
