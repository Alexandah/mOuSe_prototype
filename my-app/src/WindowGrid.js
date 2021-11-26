import React from "react";
import { TPGrid } from "./2PGrid";
import Keybindings from "./Keybindings";
import Window from "./Window";

const BLACK_OUTLINE_COLOR = "#000000";

function WindowGrid({ widthPx, heightPx, blockSizeFactor }) {
  const grid = React.useState(new TPGrid(widthPx, heightPx, blockSizeFactor));

  /*
   * Keyboard Handling
   */
  const handleKeyboard = (e) => {
    var dir;
    switch (e) {
      case e[Keybindings.MOD]:
        switch (e) {
          case e[Keybindings.NEW_WINDOW]:
            grid.openWindow(0, 0);
            break;
          case e[Keybindings.UP]:
            dir = e[Keybindings.UP];
          case e[Keybindings.DOWN]:
            dir = e[Keybindings.DOWN];
          case e[Keybindings.RIGHT]:
            dir = e[Keybindings.RIGHT];
          case e[Keybindings.LEFT]:
            dir = e[Keybindings.LEFT];
            grid.shiftWindow(grid.selected, dir);
            break;
          case e[Keybindings.CLOSE_WINDOW]:
            grid.closeWindow(grid.selected);
            break;
        }
        break;
      default:
        switch (e) {
          case e[Keybindings.UP]:
            dir = e[Keybindings.UP];
          case e[Keybindings.DOWN]:
            dir = e[Keybindings.DOWN];
          case e[Keybindings.RIGHT]:
            dir = e[Keybindings.RIGHT];
          case e[Keybindings.LEFT]:
            dir = e[Keybindings.LEFT];
            grid.moveToAdjacentWindow(dir);
            break;
        }
        break;
    }
  };

  React.useEffect(() => {}, [handleKeyboard]);
  return (
    <div
      onKeyPress={handleKeyboard}
      style={{
        border: `1px solid ${BLACK_OUTLINE_COLOR}`,
        width: widthPx,
        height: heightPx,
      }}
    >
      {Object.keys(grid.windows).map((id) => {
        var window = grid.windows[id];
        var isSelected = window == grid.selected;
        var screenDim = grid.gridPosToPx(window.width, window.height);
        var screenPos = grid.gridPosToPx(window.x, window.y);
        return (
          <Window
            isSelected={isSelected}
            x={screenPos.x}
            y={screenPos.y}
            width={screenDim.x}
            height={screenDim.y}
          >
            fuck you ass whipe
          </Window>
        );
      })}
    </div>
  );
}
export default WindowGrid;
