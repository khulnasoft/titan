import React from "react";
import ReactDOM from "react-dom/client";
import Triangle from "./triangle.jsx";

function App() {
  React.useEffect(() => {
    globalThis.__titanpackBenchBinding &&
      globalThis.__titanpackBenchBinding("Hydration done");
  });
  return (
    <svg height="100%" viewBox="-5 -4.33 10 8.66" style={{}}>
      <Triangle style={{ fill: "white" }} />
    </svg>
  );
}

document.body.style.backgroundColor = "black";

ReactDOM.hydrateRoot(document.getElementById("app"), <App />);
