import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 1) 启动日志
console.log("[BOOT] main.tsx loaded");

// 2) 挂载点兜底
const root = document.getElementById("root");
if (!root) {
  const el = document.createElement("div");
  el.textContent = "ERROR: #root not found";
  el.style.cssText = "padding:12px;background:#300;color:#fff";
  document.body.prepend(el);
  throw new Error("#root not found");
}

// 3) 在 App 上方放一条可见的“UI alive”提示，确认 React 已经渲染
function AliveBar() {
  return (
    <div style={{ padding: 8, background: "#111", color: "#0f0", fontFamily: "monospace" }}>
      UI alive — {new Date().toLocaleString()}
    </div>
  );
}

createRoot(root).render(
  <React.StrictMode>
    <AliveBar />
    <App />
  </React.StrictMode>
);
