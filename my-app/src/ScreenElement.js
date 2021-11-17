const ORANGE_OUTLINE_COLOR = "#ffa500";
const BLACK_OUTLINE_COLOR = "#000000";

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
