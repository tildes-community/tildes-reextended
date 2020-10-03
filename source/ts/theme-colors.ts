export type ColorKey = keyof typeof themeColors;

export const themeColors = {
  backgroundPrimary: '--background-primary-color',
  backgroundSecondary: '--background-secondary-color',
  foregroundPrimary: '--foreground-primary-color',
  foregroundSecondary: '--foreground-secondary-color',
  exemplary: '--comment-label-exemplary-color',
  offtopic: '--comment-label-offtopic-color',
  joke: '--comment-label-joke-color',
  noise: '--comment-label-noise-color',
  malice: '--comment-label-malice-color',
  mine: '--stripe-mine-color',
  official: '--alert-color'
};
