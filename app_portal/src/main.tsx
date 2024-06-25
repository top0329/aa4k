// src/main.tsx
// kintone ビルド用

import React from "react";
import ReactDOM from "react-dom";
// import "regenerator-runtime/runtime"; // react-speech-recognition のエラーの回避のため https://github.com/JamesBrill/react-speech-recognition#regeneratorruntime-is-not-defined
import App from "./App";
import ThemeProvider from "./ThemeProvider";

const setViewport = () => {
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0';
  document.head.appendChild(viewportMeta);
};

export const handleKintoneEvent = (
  mainElementId: string,
) => {
  const el = document.createElement("div");
  el.id = mainElementId;
  el.className = mainElementId;
  document.body.appendChild(el);

  // css styleのthemingのためにbodyにidを付与
  document.body.id = "kintone-copilot-root";

  setViewport();

  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById(mainElementId),
  );
};

(() => {
  kintone.events.on("portal.show", () =>
    handleKintoneEvent("kintone-copilot"),
  );
})();
