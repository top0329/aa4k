// src/components/ui/PromptTextarea/PromptTextArea.css.ts
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const StyledItem = style({
  boxShadow: `0px 0px 16px 0 ${vars.color.grayA.grayA2}`,
  selectors: {
    ":autofill": {
      color: vars.color.grayDark.gray8,
    },
    "&[data-com-onepassword-filled]": {
      color: vars.color.grayDark.gray8,
    },
  },
});
