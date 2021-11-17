const ORANGE_OUTLINE_COLOR = "#ffa500";
const BLACK_OUTLINE_COLOR = "#000000";

class ScreenElement {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

function ScreenElement(props) {
  const outlineColor = props.isSelected
    ? ORANGE_OUTLINE_COLOR
    : BLACK_OUTLINE_COLOR;

  return (
    <div
      style={{
        border: `1px solid ${outlineColor}`,
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
    >
      {props.children}
    </div>
  );
}
export default ScreenElement;
