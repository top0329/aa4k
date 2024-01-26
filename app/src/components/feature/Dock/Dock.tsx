// src/components/feature/Dock/Dock.tsx
import { faClose, faHistory, faMessageLines } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { ChatHistoryState, ChatOpenState, DialogOpenState } from "../CornerDialog/CornerDialogState";
import { DockGroup, DockIcon, DockInner, DockItem } from "./Dock.css";

export const Dock = () => {
  const [chatOpen, setChatOpen] = useAtom(ChatOpenState);
  const [, setDialogOpen] = useAtom(DialogOpenState);
  const [, setChatHistory] = useAtom(ChatHistoryState);
  return (
    <div className={DockGroup}>
      <div className={DockInner}>
        <div className={DockItem} onClick={() => {
          chatOpen ? setChatOpen(false) : setChatOpen(true)
        }}>
          <FontAwesomeIcon icon={faMessageLines} size="lg" className={DockIcon} />
        </div>
        <div className={DockItem} onClick={() => setChatHistory(RESET)}>
          <FontAwesomeIcon icon={faHistory} size="lg" className={DockIcon} />
        </div>
        <div className={DockItem} onClick={() => setDialogOpen(false)}>
          <FontAwesomeIcon icon={faClose} size="lg" className={DockIcon} />
        </div>

      </div>
    </div>
  );
}
