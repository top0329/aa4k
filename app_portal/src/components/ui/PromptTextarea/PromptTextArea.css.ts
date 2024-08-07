import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const StyledItem = style({
  boxShadow: `0px 0px 16px 0 ${vars.color.grayA.grayA2}`,
  selectors: {
    "&[data-com-onepassword-filled]": {
      color: vars.color.grayDark.gray8,
    },
  },
});

export const sPromptTextAreaContainer = style({
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  height:'108px'
});

export const sPromptTextArea = style({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
});
