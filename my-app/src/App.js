import logo from "./logo.svg";
import "./App.css";
import WindowGrid from "./WindowGrid";

function App() {
  return (
    <div>
      <WindowGrid
        widthPx={2048}
        heightPx={1024}
        blockSizeFactor={16}
      ></WindowGrid>
    </div>
  );
}

export default App;
