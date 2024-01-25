export type Revision = string | number;
export type AppCustomizeScope = "ALL" | "ADMIN" | "NONE";
export type AppCustomizeResourceForResponse = {
  type: "URL";
  url: string;
} | {
  type: "FILE";
  file: {
    fileKey: string;
    name: string;
    contentType: string;
    size: string;
  };
};
export type AppCustomizeForResponse = {
  js: AppCustomizeResourceForResponse[];
  css: AppCustomizeResourceForResponse[];
};
export type AppCustomize = {
  scope: AppCustomizeScope;
  desktop: AppCustomizeForResponse;
  mobile: AppCustomizeForResponse;
  revision: string;
}

/**
 * kintoneカスタマイズからjavascriptファイルを取得
 * @param appId 
 * @param deviceDiv 
 * @returns { kintoneCustomizeFiles targetFileKey jsCodeForKintone }
 */
export async function getKintoneCustomizeJs(appId: string, deviceDiv: string) {
  let jsCodeForKintone = "";
  let targetFileKey: string = "";

  const kintoneCustomizeFiles = await kintone.api(
    kintone.api.url("/k/v1/preview/app/customize.json", false),
    "GET", { app: appId },
  ) as AppCustomize;
  const jsFiles = (deviceDiv === "desktop") ? kintoneCustomizeFiles.desktop.js : kintoneCustomizeFiles.mobile.js

  for (const jsFile of jsFiles) {
    if (!(jsFile.type === "FILE")) continue;
    if (!(jsFile.file.name === import.meta.env.VITE_AA4K_FILE_NAME)) continue;

    targetFileKey = jsFile.file.fileKey;
    const resp = await fetch(
      `/k/v1/file.json?fileKey=${targetFileKey}`,
      {
        method: "GET",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      },
    );
    jsCodeForKintone = await resp.text();
  }
  return { kintoneCustomizeFiles, targetFileKey, jsCodeForKintone }
}

/**
 * kintoneカスタマイズJSのアップロード
 * @param jsCode 
 * @param existingFileKey 
 * @param kintoneCustomizeFiles 
 * @param appId 
 * @param deviceDiv 
 */
export async function updateKintoneCustomizeJs(jsCode: string, existingFileKey: string, kintoneCustomizeFiles: AppCustomize, appId: string, deviceDiv: string) {
  // JSコードを一時保存領域へアップロード
  const blob = new Blob([jsCode], {
    type: "application/javascript",
  });
  const formData = new FormData();
  formData.append("file", blob, import.meta.env.VITE_AA4K_FILE_NAME);
  formData.append("__REQUEST_TOKEN__", kintone.getRequestToken());
  const headers = {
    "X-Requested-With": "XMLHttpRequest",
  };
  const resp = await fetch("/k/v1/file.json", {
    method: "POST",
    headers,
    body: formData,
  });
  const respData = await resp.json();
  const fileKey = respData.fileKey;


  // 一時保管領域にアップロードしたファイル情報を作成
  const addFile = { type: "FILE", file: { fileKey: fileKey, }, } as AppCustomizeResourceForResponse

  // AA4kのファイルを除外
  const filterTarget = (deviceDiv === "desktop") ? kintoneCustomizeFiles.desktop.js : kintoneCustomizeFiles.mobile.js;
  const filteredJs = filterTarget!.filter(
    (item: AppCustomizeResourceForResponse) => (item.type === "FILE" && item.file.fileKey !== existingFileKey),
  );
  if (deviceDiv === "desktop") {
    kintoneCustomizeFiles.desktop.js = filteredJs;  // AA4kのファイルを除外したものに洗い替え
    kintoneCustomizeFiles.desktop.js.push(addFile); // 一時保管領域にアップロードしたファイル情報を追記
  } else {
    kintoneCustomizeFiles.mobile.js = filteredJs;  // AA4kのファイルを除外したものに洗い替え
    kintoneCustomizeFiles.mobile.js.push(addFile); // 一時保管領域にアップロードしたファイル情報を追記
  }

  // 一時保管領域にアップロードしたファイルと既存のファイル情報を、アプリのjavascriptファイルとして設定
  const body = {
    app: appId,
    scope: "ALL",
    desktop: kintoneCustomizeFiles.desktop,
    mobile: kintoneCustomizeFiles.mobile,
  };
  await kintone.api(kintone.api.url("/k/v1/preview/app/customize.json", false),
    "PUT",
    body,
  )
}