// src/hooks/useCodeAction.ts
import { useAtom } from "jotai";
import {
  DesktopCodeState,
  DesktopCodeLatestState,
  DesktopIsChangeCodeState,
  DesktopIsInitialCodeState,
  MobileDesktopCodeState,
  MobileCodeLatestState,
  MobileIsChangeCodeState,
  MobileIsInitialCodeState,
} from "~/state/codeActionState";

export const useCodeAction = (isPcViewMode: boolean) => {
  const [desktopCode, setDesktopCode] = useAtom(DesktopCodeState);
  const [desktopCodeLatest, setDesktopCodeLatest] = useAtom(DesktopCodeLatestState);
  const [isDesktopChangeCode, setIsDesktopChangeCode] = useAtom(DesktopIsChangeCodeState);
  const [isDesktopInitialCode, setIsDesktopInitialCode] = useAtom(DesktopIsInitialCodeState);
  const [mobileCode, setMobileCode] = useAtom(MobileDesktopCodeState);
  const [mobileCodeLatest, setMobileCodeLatest] = useAtom(MobileCodeLatestState);
  const [isMobileChangeCode, setIsMobileChangeCode] = useAtom(MobileIsChangeCodeState);
  const [isMobileInitialCode, setIsMobileInitialCode] = useAtom(MobileIsInitialCodeState);

  // 現在のビューモードに基づいて適切な値とセッター関数を返す
  const code = isPcViewMode ? desktopCode : mobileCode;
  const setCode = isPcViewMode ? setDesktopCode : setMobileCode;
  const codeLatest = isPcViewMode ? desktopCodeLatest : mobileCodeLatest;
  const setCodeLatest = isPcViewMode ? setDesktopCodeLatest : setMobileCodeLatest;
  const isChangeCode = isPcViewMode ? isDesktopChangeCode : isMobileChangeCode;
  const setIsChangeCode = isPcViewMode ? setIsDesktopChangeCode : setIsMobileChangeCode;
  const isInitialCode = isPcViewMode ? isDesktopInitialCode : isMobileInitialCode;
  const setIsInitialCode = isPcViewMode ? setIsDesktopInitialCode : setIsMobileInitialCode;

  // 初期化処理
  const initCodeActionState = () => {
    setDesktopCode("");
    setDesktopCodeLatest("");
    setIsDesktopChangeCode(false);
    setIsDesktopInitialCode(false);
    setMobileCode("");
    setMobileCodeLatest("");
    setIsMobileChangeCode(false);
    setIsMobileInitialCode(false);
  }

  return {
    code,
    setCode,
    codeLatest,
    setCodeLatest,
    isChangeCode,
    setIsChangeCode,
    isInitialCode,
    setIsInitialCode,
    initCodeActionState,
  };
};
