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
        {modalDialogFab ? '' : <App pluginId={pluginId} />}
      </ThemeProvider>
    </React.StrictMode >,
    document.getElementById(mainElementId),
  );
};
((PLUGIN_ID: string) => {
    kintone.events.on("portal.show", () =>
    handleKintoneEvent("modal-dialog-fab", "corner-dialog-fab", PLUGIN_ID),
  );

  kintone.events.on("space.portal.show", () =>
    handleKintoneEvent("corner-dialog-fab", "modal-dialog-fab", PLUGIN_ID),
  );

  kintone.events.on("app.record.index.show", () =>
    handleKintoneEvent("corner-dialog-fab", "modal-dialog-fab", PLUGIN_ID),
  );
})(`${kintone.$PLUGIN_ID}`);
