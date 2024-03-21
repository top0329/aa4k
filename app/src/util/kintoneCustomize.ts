import { DeviceDiv } from "~/constants";
import { KintoneRestAPiError } from "~/types/apiResponse"
import { ErrorCode, ErrorMessage as ErrorMessageConst } from "~/constants"
import { KintoneError } from "~/util/customErrors"

// 下記の型は以下(kintone/js-sdk)を参考に設定
// https://github.com/kintone/js-sdk/blob/master/packages/rest-api-client/src/client/types/app/customize.ts
export type Revision = string | number;
export const AppCustomizeScope = {
  all: "ALL",
  admin: "ADMIN",
  none: "NONE",
} as const;
export type AppCustomizeScope =
  (typeof AppCustomizeScope)[keyof typeof AppCustomizeScope];
export type AppCustomizeResourceForResponse =
  | {
    type: "URL";
    url: string;
  }
  | {
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
};

/**
 * kintoneカスタマイズからアプリのカスタマイズ情報とAA4Kで作成したjavascript情報を取得する
 * @param appId
 * @param deviceDiv
 * @param isGuestSpace
 * @returns {object} {kintoneCustomizeFiles, targetFileKey, jsCodeForKintone}
 * @returns {AppCustomize} kintoneCustomizeFiles - カスタマイズ設定情報
 * @returns {string} targetFileKey - AA4kのjavascriptファイルキー
 * @returns {string} jsCodeForKintone - AA4kのjavascriptコード
 */
export interface GetKintoneCustomizeJs {
  kintoneCustomizeFiles: AppCustomize;
  targetFileKey: string;
  jsCodeForKintone: string;
}
export async function getKintoneCustomizeJs(
  appId: number,
  deviceDiv: DeviceDiv,
  isGuestSpace: boolean,
): Promise<GetKintoneCustomizeJs> {
  try {
    let jsCodeForKintone = "";
    let targetFileKey: string = "";

    const kintoneCustomizeFiles = await kintone.api(
      kintone.api.url("/k/v1/preview/app/customize.json", isGuestSpace),
      "GET",
      { app: appId },
    ).catch((e: KintoneRestAPiError) => {
      throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
    }) as AppCustomize;

    const jsFiles =
      deviceDiv === DeviceDiv.desktop
        ? kintoneCustomizeFiles.desktop.js
        : kintoneCustomizeFiles.mobile.js;

    for (const jsFile of jsFiles) {
      if (!(jsFile.type === "FILE")) continue;
      if (!(jsFile.file.name === import.meta.env.VITE_AA4K_FILE_NAME)) continue;

      targetFileKey = jsFile.file.fileKey;
      const resp = await fetch(
        kintone.api.urlForGet(
          "/k/v1/file.json",
          { fileKey: targetFileKey },
          isGuestSpace,
        ),
        {
          method: "GET",
          headers: { "X-Requested-With": "XMLHttpRequest" },
        },
      );
      jsCodeForKintone = await resp.text();
    }
    return { kintoneCustomizeFiles, targetFileKey, jsCodeForKintone };
  } catch (e) {
    if (e instanceof KintoneError) {
      throw new KintoneError(e.message)
    }
    throw new KintoneError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00007}）`)
  }
}

/**
 * kintoneカスタマイズJSのアップロード
 * @param jsCode
 * @param existingFileKey
 * @param kintoneCustomizeFiles
 * @param appId
 * @param deviceDiv
 * @param isGuestSpace
 */
export async function updateKintoneCustomizeJs(
  jsCode: string,
  existingFileKey: string,
  kintoneCustomizeFiles: AppCustomize,
  appId: number,
  deviceDiv: DeviceDiv,
  isGuestSpace: boolean,
): Promise<void> {
  try {
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
    const resp = await fetch(kintone.api.url("/k/v1/file.json", isGuestSpace), {
      method: "POST",
      headers,
      body: formData,
    });
    const respData = await resp.json();
    const fileKey = respData.fileKey;

    // 一時保管領域にアップロードしたファイル情報を作成
    const addFile = {
      type: "FILE",
      file: { fileKey: fileKey },
    } as AppCustomizeResourceForResponse;

    // AA4kのファイルを除外
    const filterTarget =
      deviceDiv === DeviceDiv.desktop
        ? kintoneCustomizeFiles.desktop.js
        : kintoneCustomizeFiles.mobile.js;
    const filteredJs = filterTarget.filter(
      (item: AppCustomizeResourceForResponse) =>
        item.type === "FILE" && item.file.fileKey !== existingFileKey,
    );
    if (deviceDiv === DeviceDiv.desktop) {
      kintoneCustomizeFiles.desktop.js = filteredJs; // AA4kのファイルを除外したものに洗い替え
      kintoneCustomizeFiles.desktop.js.push(addFile); // 一時保管領域にアップロードしたファイル情報を追記
    } else {
      kintoneCustomizeFiles.mobile.js = filteredJs; // AA4kのファイルを除外したものに洗い替え
      kintoneCustomizeFiles.mobile.js.push(addFile); // 一時保管領域にアップロードしたファイル情報を追記
    }

    // 一時保管領域にアップロードしたファイルと既存のファイル情報を、アプリのjavascriptファイルとして設定
    const body = {
      app: appId,
      scope: AppCustomizeScope.all,
      desktop: kintoneCustomizeFiles.desktop,
      mobile: kintoneCustomizeFiles.mobile,
    };
    await kintone.api(
      kintone.api.url("/k/v1/preview/app/customize.json", isGuestSpace),
      "PUT",
      body,
    ).catch((e: KintoneRestAPiError) => {
      throw new KintoneError(`${ErrorMessageConst.E_MSG006}（${ErrorCode.E00007}）\n${e.message}\n(${e.code} ${e.id})`)
    });
  } catch (e) {
    if (e instanceof KintoneError) {
      throw new KintoneError(e.message)
    }
    throw new KintoneError(`${ErrorMessageConst.E_MSG003}（${ErrorCode.E00007}）`)
  }
}
