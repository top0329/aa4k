// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { InfoMessage, DockDisplayTypes } from "~/constants";
import { useCodeAction } from "~/hooks/useCodeAction";
import useToggleDockItem from "~/hooks/useToggleDockItem";
import { DesktopIsChangeCodeState, MobileIsChangeCodeState } from '~/state/codeActionState';
import { ViewModeState } from "~/state/viewModeState";

type DockProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  isChangeCodeRef: React.MutableRefObject<boolean>;
}

export const useDockLogic = ({ setHumanMessage, isChangeCodeRef }: DockProps) => {
  const {
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
  } = useToggleDockItem();
  const [isPcViewMode, setIsPcViewMode] = useAtom(ViewModeState);
  const [isDesktopChangeCode] = useAtom(DesktopIsChangeCodeState);
  const [isMobileChangeCode] = useAtom(MobileIsChangeCodeState);
  const { initCodeActionState } = useCodeAction(isPcViewMode);
  const [dockDisplayType, setDockDisplayType] = useState<DockDisplayTypes>(null);
  const [isInitJsGenCntrolBtnClicked, setIsJsGenCntrolBtnClicked] = useState(false);
  const [isInitDataGenCntrolBtnClicked, setIsDataGenCntrolBtnClicked] = useState(false);

  const { jsGen, dataGen } = DockDisplayTypes;

  const updateKintonePointerEvents = () => {
    document.body.style.pointerEvents = dockState.dialogVisible && (dockState.chatVisible || dockState.spChatVisible) || dockState.dataGenChatVisible || dockState.codeEditorVisible ? 'none' : '';
  };

  // ページ遷移・リロードしてきた際に、pointerEvents判定をしたいので以下の処理を追加
  useEffect(() => {
    updateKintonePointerEvents();
  }, []);

  useEffect(() => {
    updateKintonePointerEvents();
  }, [dockState]);

  const initDockState = async () => {
    await setDockState({
      dialogVisible: false,
      chatVisible: false,
      dataGenChatVisible: false,
      codeEditorVisible: false,
      spChatVisible: false,
    });
    document.body.style.pointerEvents = '';
  };

  // Docを閉じる処理
  const handleDockClose = () => {
    const shouldCloseDock = (!isDesktopChangeCode && !isMobileChangeCode) || window.confirm(InfoMessage.I_MSG002);

    if (shouldCloseDock) {
      setHumanMessage("");
      setIsPcViewMode(true);
      initCodeActionState();
      isChangeCodeRef.current = false;
      initDockState();
    }
  };

  // js生成-操作ボタンを押下した処理
  const handleJsGenClick = () => {
    // setHumanMessage(""); TODO: data生成用のsetHumanMessageをリセット
    setDockDisplayType(jsGen); // js生成のUIを表示
    if (!isInitJsGenCntrolBtnClicked) {
      // 初回のクリック時、自動でチャット画面を開く（2回目以降は何もせず、チャット画面の表示/非表示はチャットボタンで行う）
      setIsJsGenCntrolBtnClicked(true);
      setIsDataGenCntrolBtnClicked(false); // data生成-操作ボタンの初回クリック状態をリセット
      setDockState({
        ...dockState,
        chatVisible: true,
        dataGenChatVisible: false,
      });
    }
  };

  // data生成-操作ボタンを押下した処理
  const handleDataGenClick = () => {
    // js生成でコード編集中の場合は破棄してよいかを確認する
    const checkJsCodeEditorEditingStatus = (!isDesktopChangeCode && !isMobileChangeCode) || window.confirm(InfoMessage.I_MSG002);

    if (checkJsCodeEditorEditingStatus) {
      setHumanMessage(""); // js生成のユーザーメッセージをクリア
      initCodeActionState(); // ja生成のコードエディタを初期化
      isChangeCodeRef.current = false;
      setDockDisplayType(dataGen); // data生成のUIを表示
      if (!isInitDataGenCntrolBtnClicked) {
        // 初回のクリック時、自動でチャット画面を開く（2回目以降は何もせず、チャット画面の表示/非表示はチャットボタンで行う）
        setIsDataGenCntrolBtnClicked(true);
        setIsJsGenCntrolBtnClicked(false); // js生成-操作ボタンの初回クリック状態をリセット
        setDockState({
          ...dockState,
          chatVisible: false,
          dataGenChatVisible: true,
          codeEditorVisible: false,
        });
      }
    }
  };

  const deleteHistory = () => {
    // Implement the logic for deleting history if needed
  };

  return {
    isPcViewMode,
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
    deleteHistory,
    handleDockClose,
    dockDisplayType,
    handleJsGenClick,
    handleDataGenClick,
  };
};
