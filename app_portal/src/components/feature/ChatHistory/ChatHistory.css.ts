import { style } from '@vanilla-extract/css';

export const sChatHistory = style({
  height: '456px',
  width: '946px',
  position: 'relative',
  top: '0',
  left: '0',
  background: 'transparent',
  zIndex: 105, // AppGenerationDialog（100）よりも前面に表示
});

export const sChatHistorySuggest = style({
  padding: 16,
  backgroundColor: '#ffffff',
  border: '1px solid',
  borderColor: '#ebebeb',
  borderRadius: '100px',
  height: '56px',
  overflow: 'hidden',
  width: '219px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  ":hover": {
    backgroundColor: '#f0f0f0',
  },
});

export const sChatHistorySuggestButtonIcon = style({
  pointerEvents: 'none',
  width: '9px',
  height: '17px',
});

export const sChatHistorySuggestCard = style({
  padding: 0,
  width: 'fit-content',
  borderRadius: '100px',
});
