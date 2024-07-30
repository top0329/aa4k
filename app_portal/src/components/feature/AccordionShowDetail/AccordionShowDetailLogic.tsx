// src\components\feature\AccordionShowDetail\AccordionShowDetailLogic.tsx

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SettingInfoState } from "~/state/settingInfoState";

export const useAccordionShowDetailLogic = () => {
  const [settingInfoItems, setSettingInfo] = useAtom(SettingInfoState);
  // フィールド（type,label,displayTypeのセット）がいくつあるかの状態を管理
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    if (settingInfoItems &&  settingInfoItems.fields &&  settingInfoItems.fields.length > 0) {
      // フィールド数をitem-{num}で設定
      setActiveItem(`item-${ settingInfoItems.fields.length - 1}`);
    }
  }, [settingInfoItems]);

  return {
    settingInfoItems,
    setSettingInfo,
    activeItem,
    setActiveItem,
  };
};
