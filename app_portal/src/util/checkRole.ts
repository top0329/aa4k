interface Group {
  id: string;
  code: string;
  name: string;
  description: string;
}

/**
 * 操作ユーザがAA4k利用権限があるかをチェック
 * @returns チェック結果
 */
export async function checkRole(code: string) {

  // ログインユーザーが所属するグループ（ロール）を取得
  const response = await kintone.api(kintone.api.url('/v1/user/groups.json', true), 'GET', { code: code })
  // グループ情報を取得
  const groups = response.groups as Group[];

  // 「aa4k」グループに所属しているかをチェック
  const isInGroup = groups.some(function (group) {
    return group.code === 'aa4k';
  });

  return isInGroup;
}

