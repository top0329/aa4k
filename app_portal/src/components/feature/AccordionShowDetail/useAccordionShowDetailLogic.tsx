// src\components\feature\AccordionShowDetail\useAccordionShowDetailLogic.tsx

import { useAtom } from "jotai";
import { useState } from "react";
import { SettingInfoState } from "~/state/settingInfoState";

export const useAccordionShowDetailLogic = () => {
  const [settingInfoItems, setSettingInfo] = useAtom(SettingInfoState);
  // Accordion.Itemのどれを選択しているかの状態を管理
  const [activeItem, setActiveItem] = useState('');

  return {
    settingInfoItems,
    setSettingInfo,
    activeItem,
    setActiveItem,
  };
};
