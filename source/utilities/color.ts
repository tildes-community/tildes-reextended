/**
 * Returns whether a hex color is "bright".
 * @param color The hex color.
 */
export function isColorBright(color: string): boolean {
  if (color.startsWith('#')) {
    color = color.slice(1);
  }

  // 4 character hex colors have an alpha value, we only need RGB here so remove
  // the alpha character.
  if (color.length === 4) {
    color = color.slice(0, 3);
  }

  // 8 character hex colors also have an alpha value, so remove the last 2.
  if (color.length === 8) {
    color = color.slice(0, 6);
  }

  // 3 character hex colors can be represented as 6 character ones too, so
  // transform it. For example "#123" is the same as "#112233".
  if (color.length === 3) {
    color = color
      .split('')
      .map((value) => value.repeat(2))
      .join('');
  }

  // Split the color up into 3 segments of 2 characters and convert them from
  // hexadecimal to decimal.
  const [red, green, blue] = color
    .split(/(.{2})/)
    .filter((value) => value !== '')
    .map((value) => Number.parseInt(value, 16));

  // Magical numbers taken from https://stackoverflow.com/a/12043228/12251171.
  // "Per ITU-R BT.709"
  const brightness = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return brightness > 128;
}

// CSS custom properties from the Tildes themes.
export const themeColors = [
  {
    name: 'Background Primary',
    value: '--background-primary-color'
  },
  {
    name: 'Background Secondary',
    value: '--background-secondary-color'
  },
  {
    name: 'Foreground Primary',
    value: '--foreground-primary-color'
  },
  {
    name: 'Foreground Secondary',
    value: '--foreground-secondary-color'
  },
  {
    name: 'Exemplary',
    value: '--comment-label-exemplary-color'
  },
  {
    name: 'Off-topic',
    value: '--comment-label-offtopic-color'
  },
  {
    name: 'Joke',
    value: '--comment-label-joke-color'
  },
  {
    name: 'Noise',
    value: '--comment-label-noise-color'
  },
  {
    name: 'Malice',
    value: '--comment-label-malice-color'
  },
  {
    name: 'Mine',
    value: '--stripe-mine-color'
  },
  {
    name: 'Official',
    value: '--alert-color'
  }
];
