import logo from "./logo.svg";
import "./App.css";
import TPGrid from "./R2PGrid";

function App() {
  return (
    <div>
      <TPGrid pxWidth={2048} pxHeight={1024} blockSizeFactor={4}></TPGrid>
    </div>
  );
}

export default App;
