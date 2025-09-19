import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("[BOOT] main.tsx mounted");   // 调试日志
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
