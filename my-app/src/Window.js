import ScreenElement from "./ScreenElement";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 500;

function Window(props) {
  var width = props.width || DEFAULT_WIDTH;
  var height = props.height || DEFAULT_HEIGHT;

  return (
    <ScreenElement style={{ width: width, height: height }}>
      <ScreenElement width={25} height={25} isSelected={false}>
        <div style={{ color: "red" }}>x</div>
      </ScreenElement>
      <ScreenElement width={25} height={25} isSelected={false}>
        <div style={{ color: "yellow" }}>x</div>
      </ScreenElement>
      {props.children}
    </ScreenElement>
  );
}
export default Window;
