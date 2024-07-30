// src/components/ui/FieldIcon/FieldIcon.tsx

import React from 'react';
import textSingleLineIcon from '~/assets/fieldType/textSingleLineIcon.svg';
import textMultiLineIcon from '~/assets/fieldType/textMultiLineIcon.svg';
import richEditorIcon from '~/assets/fieldType/richEditorIcon.svg';
import numberIcon from '~/assets/fieldType/numberIcon.svg';
import calculationIcon from '~/assets/fieldType/calculationIcon.svg';
import radioButtonIcon from '~/assets/fieldType/radiobuttonIcon.svg';
import checkboxIcon from '~/assets/fieldType/checkboxIcon.svg';
import multiSelectIcon from '~/assets/fieldType/multiSelectIcon.svg';
import dropdownIcon from '~/assets/fieldType/dropdownIcon.svg';
import userSelectIcon from '~/assets/fieldType/userSelectIcon.svg';
import organizationSelectIcon from '~/assets/fieldType/organizationSelectIcon.svg';
import groupSelectIcon from '~/assets/fieldType/groupSelectIcon.svg';
import dateIcon from '~/assets/fieldType/dateIcon.svg';
import timeIcon from '~/assets/fieldType/timeIcon.svg';
import dateTimeIcon from '~/assets/fieldType/dateTimeIcon.svg';
import linkIcon from '~/assets/fieldType/linkIcon.svg';
import attachmentIcon from '~/assets/fieldType/attachmentIcon.svg';
import tableIcon from '~/assets/fieldType/tableIcon.svg';
import lookupIcon from '~/assets/fieldType/lookupIcon.svg';
import relatedRecordsIcon from '~/assets/fieldType/relatedRecordsIcon.svg';
import labelIcon from '~/assets/fieldType/labelIcon.svg';
import spaceIcon from '~/assets/fieldType/spaceIcon.svg';
import lineIcon from '~/assets/fieldType/lineIcon.svg';
import groupIcon from '~/assets/fieldType/groupIcon.svg';
import { sFieldIcon } from './FieldIcon.css';

type FieldIconProps = {
  displayType: string;
};

// 各フィールドのアイコンとタイプ
const fields = [
  { icon: textSingleLineIcon, text: '文字列 (1行)' },
  { icon: textMultiLineIcon, text: '文字列 (複数行)' },
  { icon: richEditorIcon, text: 'リッチエディター' },
  { icon: numberIcon, text: '数値' },
  { icon: calculationIcon, text: '計算' },
  { icon: radioButtonIcon, text: 'ラジオボタン' },
  { icon: checkboxIcon, text: 'チェックボックス' },
  { icon: multiSelectIcon, text: '複数選択' },
  { icon: dropdownIcon, text: 'ドロップダウン' },
  { icon: userSelectIcon, text: 'ユーザー選択' },
  { icon: organizationSelectIcon, text: '組織選択' },
  { icon: groupSelectIcon, text: 'グループ選択' },
  { icon: dateIcon, text: '日付' },
  { icon: timeIcon, text: '時刻' },
  { icon: dateTimeIcon, text: '日時' },
  { icon: linkIcon, text: 'リンク' },
  { icon: attachmentIcon, text: '添付ファイル' },
  { icon: tableIcon, text: 'テーブル' },
  { icon: lookupIcon, text: 'ルックアップ' },
  { icon: relatedRecordsIcon, text: '関連レコード一覧' },
  { icon: labelIcon, text: 'ラベル' },
  { icon: spaceIcon, text: 'スペース' },
  { icon: lineIcon, text: '罫線' },
  { icon: groupIcon, text: 'グループ' },
];

const FieldIcon: React.FC<FieldIconProps> = ({ displayType }) => {
  // displayTypeに一致するフィールドを検索
  const field = fields.find(f => f.text === displayType);
  const iconComponent = field ? field.icon : null;
  return iconComponent ? <img src={iconComponent} alt={displayType} className={sFieldIcon} /> : null; // 一致するフィールドが見つからなければ、何も表示しない
};

export default FieldIcon;
