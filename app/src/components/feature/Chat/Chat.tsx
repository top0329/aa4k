// src/components/feature/Chat/Chat.tsx
import { Badge, Box, Flex, Switch } from "@radix-ui/themes";
import { useAtom } from "jotai";
import ScrollToBottom from "react-scroll-to-bottom";
import { vars } from '~/styles/theme.css';
import AccordionHistory from "../AccordionHistory/AccordionHistory";
import { ViewModeState } from "../CornerDialog/CornerDialogState";
import PromptForm from "../PromptForm/PromptForm";
import { sChat } from './Chat.css';

const Chat = () => {
  const [
    isPcViewMode,
    setIsPcViewMode,
  ] = useAtom(ViewModeState);

  return (
    <Box className={sChat} >
      <ScrollToBottom
        className="w-100"
        scrollViewClassName="scrollbar">
        <Box style={{
          background: 'white'
        }}>
          <AccordionHistory />
        </Box>

        <Box p={'5'}
          width={'100%'}
          style={{
            background: isPcViewMode ? vars.color.indigoA.indigoA2 : vars.color.crimsonA.crimsonA1
          }}>
          <PromptForm />

          <Flex gap="2" pt={'3'}
            align={'center'}
            justify={'between'}
          >
            <Flex gap="2" align={'center'}>
              <Switch
                color={
                  isPcViewMode
                    ? 'indigo'
                    : 'crimson'
                }
                checked={!isPcViewMode}
                onCheckedChange={() => setIsPcViewMode(!isPcViewMode)}
              />

              {
                isPcViewMode ? <Badge>スマートフォン用アプリのカスタマイズに切り替える</Badge> : <Badge color='crimson'>PC用アプリのカスタマイズに切り替える</Badge>
              }
            </Flex>
          </Flex>

        </Box>
      </ScrollToBottom>
    </Box>
  );
};

export default Chat;
