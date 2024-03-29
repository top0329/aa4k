// kintone ビルド用
import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime"; // react-speech-recognition のエラーの回避のため https://github.com/JamesBrill/react-speech-recognition#regeneratorruntime-is-not-defined
import App from "./App";
import ThemeProvider from "./ThemeProvider";

export const handleKintoneEvent = (
  mainElementId: string,
  altElementId: string,
  pluginId: string,
  isDisplay: boolean,
) => {
  const el = document.createElement("div");
  el.id = mainElementId;
  document.body.appendChild(el);

  // If alternative element exists, remove it
  const removeElement = document.getElementById(altElementId);
  if (removeElement) {
    removeElement.remove();
  }

  const modalDialogFab = document.getElementById("modal-dialog-fab");
  // css styleのthemingのためにbodyにidを付与
  document.body.id = "kintone-copilot-root";

  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider>
        {modalDialogFab || !isDisplay ? '' : <App pluginId={pluginId} />}
      </ThemeProvider>
    </React.StrictMode >,
    document.getElementById(mainElementId),
  );
};
((PLUGIN_ID: string) => {
  const appId = kintone.app.getId();
  const previewPath = `/k/admin/preview/${appId}/`;
  const currentUrl = location.href;
  const isPreview = currentUrl.includes(previewPath);

  kintone.events.on("app.record.index.show", (event) => {
    if (!isPreview) handleKintoneEvent("corner-dialog-fab", "modal-dialog-fab", PLUGIN_ID, true);
    return event;
  });
  kintone.events.on("app.record.detail.show", (event) => {
    if (!isPreview) handleKintoneEvent("corner-dialog-fab", "modal-dialog-fab", PLUGIN_ID, true)
    return event;
  });
  kintone.events.on("app.record.edit.show", (event) => {
    if (!isPreview) handleKintoneEvent("corner-dialog-fab", "modal-dialog-fab", PLUGIN_ID, false)
    return event;
  });
})(`${kintone.$PLUGIN_ID}`);
