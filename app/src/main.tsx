// src/main.tsx
// kintone ビルド用

import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime"; // react-speech-recognition のエラーの回避のため https://github.com/JamesBrill/react-speech-recognition#regeneratorruntime-is-not-defined
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
  pluginId: string,
  isDisplay: boolean,
) => {
  const el = document.createElement("div");
  el.id = mainElementId;
  document.body.appendChild(el);

  // css styleのthemingのためにbodyにidを付与
  document.body.id = "kintone-copilot-root";

  setViewport();

  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider>
        {!isDisplay ? '' : <App pluginId={pluginId} />}
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById(mainElementId),
  );
};

((PLUGIN_ID: string) => {
  const appId = kintone.app.getId();
  const previewPath = `/k/admin/preview/${appId}/`;
  const currentUrl = location.href;
  const isPreview = currentUrl.includes(previewPath);

  kintone.events.on("app.record.index.show", (event) => {
    if (!isPreview) handleKintoneEvent("kintone-copilot", PLUGIN_ID, true);
    return event;
  });
  kintone.events.on("app.record.detail.show", (event) => {
    if (!isPreview) handleKintoneEvent("kintone-copilot", PLUGIN_ID, true)
    return event;
  });
  kintone.events.on("app.record.edit.show", (event) => {
    if (!isPreview) handleKintoneEvent("kintone-copilot", PLUGIN_ID, false)
    return event;
  });
})(`${kintone.$PLUGIN_ID}`);
