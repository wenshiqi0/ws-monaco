const lightThemeDefaults = require('../extensions/themes/theme-defaults/themes/light_defaults.json');
const lightTheme = require('../extensions/themes/theme-defaults/themes/light_vs.json');
const lightThemePlus = require('../extensions/themes/theme-defaults/themes/light_plus.json');

const darkThemeDefaults = require('../extensions/themes/theme-defaults/themes/dark_defaults.json');
const darkTheme = require('../extensions/themes/theme-defaults/themes/dark_vs.json');
const darkThemePlus = require('../extensions/themes/theme-defaults/themes/dark_plus.json');

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