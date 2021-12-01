import React from "react";
import { TPGrid } from "./2PGrid";
import Keybindings from "./Keybindings";
import Window from "./Window";

const BLACK_OUTLINE_COLOR = "#000000";

function WindowGrid({ widthPx, heightPx, blockSizeFactor }) {
  const [grid, setGrid] = React.useState(
    new TPGrid(widthPx, heightPx, blockSizeFactor)
  );

  /*
   * Keyboard Handling
   */

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
    // e.stopPropagation();
    console.log(
      "handling keyboard",
      hasKeyDown(e, Keybindings.MOD),
      hasKeyDown(e, Keybindings.NEW_WINDOW),
      grid
    );
    var dir;
    console.log("before switch");
    switch (e) {
      case e:
        console.log("in switch");
      case hasKeyDown(e, Keybindings.MOD):
        console.log("found mod key", e);
        switch (e) {
          case e:
            console.log("in 2nd switch");
          case hasKeyDown(e, Keybindings.NEW_WINDOW):
            console.log("found t key");
            grid.openWindow(0, 0);
            setGrid(grid);
            console.log("New Window");
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
            setGrid(grid);
            break;
          case e[Keybindings.CLOSE_WINDOW]:
            grid.closeWindow(grid.selected);
            setGrid(grid);
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
            setGrid(grid);
            break;
        }
        break;
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, []);
  React.useEffect(() => {}, [grid]);

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
        var isSelected = window === grid.selected;
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
