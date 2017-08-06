const lightThemeDefaults = require('../../plugins/themes/theme-defaults/themes/light_defaults.json');
const lightTheme = require('../../plugins/themes/theme-defaults/themes/light_vs.json');
const lightThemePlus = require('../../plugins/themes/theme-defaults/themes/light_plus.json');

const darkThemeDefaults = require('../../plugins/themes/theme-defaults/themes/dark_defaults.json');
const darkTheme = require('../../plugins/themes/theme-defaults/themes/dark_vs.json');
const darkThemePlus = require('../../plugins/themes/theme-defaults/themes/dark_plus.json');

export const dark = {
  tokens: [].concat(darkTheme.tokenColors, darkThemePlus.tokenColors),
  theme: darkThemeDefaults,
  defaults: darkThemeDefaults.colors,
};

export const light = {
  tokens: [].concat(lightTheme.tokenColors, lightThemePlus.tokenColors),
  theme: lightThemeDefaults,
  defaults: lightThemeDefaults.colors,
}