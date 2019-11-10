export type ThemeKey = keyof typeof themeColors;
export type ColorKey = keyof typeof themeColors[ThemeKey];

export const themeColors = {
  atomOneDark: {
    background: '#282C34',
    backgroundAlt: '#21242b',
    foreground: '#ABB2BF',
    foregroundAlt: '#828997',
    cyan: '#56B6C2',
    blue: '#61AFEF',
    purple: '#C678DD',
    green: '#98C379',
    red: '#E06C75',
    orange: '#D19A66'
  },
  black: {
    background: '#000',
    backgroundAlt: '#222',
    foreground: '#ccc',
    foregroundAlt: '#888',
    cyan: '#2aa198',
    blue: '#268bd2',
    purple: '#6c71c4',
    green: '#859900',
    red: '#f00',
    orange: '#b58900'
  },
  dracula: {
    background: '#282a36',
    backgroundAlt: '#44475a',
    foreground: '#f8f8f2',
    foregroundAlt: '#6272a4',
    cyan: '#8be9fd',
    blue: '#6272a4',
    purple: '#bd93f9',
    green: '#50fa7b',
    red: '#ff5555',
    orange: '#ffb86c'
  },
  gruvboxDark: {
    background: '#282828',
    backgroundAlt: '#3c3836',
    foreground: '#fbf1c7',
    foregroundAlt: '#ebdbb2',
    cyan: '#689d6a',
    blue: '#458588',
    purple: '#b16286',
    green: '#98971a',
    red: '#fb4934',
    orange: '#fabd2f'
  },
  gruvboxLight: {
    background: '#fbf1c7',
    backgroundAlt: '#ebdbb2',
    foreground: '#282828',
    foregroundAlt: '#3c3836',
    cyan: '#689d6a',
    blue: '#458588',
    purple: '#b16286',
    green: '#98971a',
    red: '#fb4934',
    orange: '#fabd2f'
  },
  solarizedLight: {
    background: '#fdf6e3',
    backgroundAlt: '#eee8d5',
    foreground: '#657b83',
    foregroundAlt: '#93a1a1',
    cyan: '#2aa198',
    blue: '#268bd2',
    purple: '#6c71c4',
    green: '#859900',
    red: '#dc322f',
    orange: '#cb4b16'
  },
  solarizedDark: {
    background: '#002b36',
    backgroundAlt: '#073642',
    foreground: '#839496',
    foregroundAlt: '#586e75',
    cyan: '#2aa198',
    blue: '#268bd2',
    purple: '#6c71c4',
    green: '#859900',
    red: '#dc322f',
    orange: '#cb4b16'
  },
  white: {
    background: '#fff',
    backgroundAlt: '#eee',
    foreground: '#333',
    foregroundAlt: '#888',
    cyan: '#1e824c',
    blue: '#1460aa',
    purple: '#551a8b',
    green: '#4b6319',
    red: '#d91e18',
    orange: '#e66b00'
  },
  zenburn: {
    background: '#3f3f3f',
    backgroundAlt: '#4f4f4f',
    foreground: '#dcdccc',
    foregroundAlt: '#aaa',
    cyan: '#8cd0d3',
    blue: '#80d4aa',
    purple: '#bc8cbc',
    green: '#7f9f7f',
    red: '#dc8c6c',
    orange: '#efef8f'
  }
};
