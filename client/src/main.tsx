import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Alive trace: 确认 bundle 被正确加载
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODE = (import.meta as any).env?.MODE;
console.log("[Alive] main.tsx executed, mode=", MODE);
const rootEl = document.getElementById("root")!;
rootEl.setAttribute("data-alive", "1");
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
