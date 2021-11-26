import React from "react";

const ORANGE_OUTLINE_COLOR = "#ffa500";
const BLACK_OUTLINE_COLOR = "#000000";

function Window(props) {
  const outlineColor = props.isSelected
    ? ORANGE_OUTLINE_COLOR
    : BLACK_OUTLINE_COLOR;

  return (
    <div
      style={{
        border: `1px solid ${outlineColor}`,
        width: `${props.width}px`,
        height: `${props.height}px`,
        x: props.x,
        y: props.y,
        position: `absolute`,
      }}
    >
      {props.children}
    </div>
  );
}
export default Window;
