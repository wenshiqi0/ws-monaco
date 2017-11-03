const lightThemeDefaults = require('../../themes/theme-defaults/themes/light_defaults.json');
const lightTheme = require('../../themes/theme-defaults/themes/light_vs.json');
const lightThemePlus = require('../../themes/theme-defaults/themes/light_plus.json');

const darkThemeDefaults = require('../../themes/theme-defaults/themes/dark_defaults.json');
const darkTheme = require('../../themes/theme-defaults/themes/dark_vs.json');
const darkThemePlus = require('../../themes/theme-defaults/themes/dark_plus.json');

const darkSettings = [].concat(darkTheme.tokenColors, darkThemePlus.tokenColors)
export const dark = {
	tokens: darkSettings,
	settings: darkSettings,
  theme: darkThemeDefaults,
  defaults: darkThemeDefaults.colors,
};

const lightSettings = [].concat(lightTheme.tokenColors, lightThemePlus.tokenColors);
export const light = {
	tokens: lightSettings,
	settings: lightSettings,
  theme: lightThemeDefaults,
  defaults: lightThemeDefaults.colors,
}

function isValidHexColor(hex) {
	if (/^#[0-9a-f]{6}$/i.test(hex)) {
		// #rrggbb
		return true;
	}

	if (/^#[0-9a-f]{8}$/i.test(hex)) {
		// #rrggbbaa
		return true;
	}

	if (/^#[0-9a-f]{3}$/i.test(hex)) {
		// #rgb
		return true;
	}

	if (/^#[0-9a-f]{4}$/i.test(hex)) {
		// #rgba
		return true;
	}

	return false;
}

export function parseTheme(source) {
	if (!source) {
		return [];
	}
	if (!source.settings || !Array.isArray(source.settings)) {
		return [];
	}
	let settings = source.settings;
	let result = [], resultLen = 0;
	for (let i = 0, len = settings.length; i < len; i++) {
		let entry = settings[i];

		if (!entry.settings) {
			continue;
		}

		let scopes;
		if (typeof entry.scope === 'string') {
			let _scope = entry.scope;

			// remove leading commas
			_scope = _scope.replace(/^[,]+/, '');

			// remove trailing commans
			_scope = _scope.replace(/[,]+$/, '');

			scopes = _scope.split(',');
		} else if (Array.isArray(entry.scope)) {
			scopes = entry.scope;
		} else {
			scopes = [''];
		}

		let fontStyle = FontStyle.NotSet;
		if (typeof entry.settings.fontStyle === 'string') {
			fontStyle = FontStyle.None;

			let segments = entry.settings.fontStyle.split(' ');
			for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
				let segment = segments[j];
				switch (segment) {
					case 'italic':
						fontStyle = fontStyle | FontStyle.Italic;
						break;
					case 'bold':
						fontStyle = fontStyle | FontStyle.Bold;
						break;
					case 'underline':
						fontStyle = fontStyle | FontStyle.Underline;
						break;
				}
			}
		}

		let foreground = null;
		if (typeof entry.settings.foreground === 'string' && isValidHexColor(entry.settings.foreground)) {
			foreground = entry.settings.foreground;
		}

		let background = null;
		if (typeof entry.settings.background === 'string' && isValidHexColor(entry.settings.background)) {
			background = entry.settings.background;
		}

		for (let j = 0, lenJ = scopes.length; j < lenJ; j++) {
			let _scope = scopes[j].trim();

			let segments = _scope.split(' ');

			let scope = segments[segments.length - 1];
			let parentScopes = null;
			if (segments.length > 1) {
				parentScopes = segments.slice(0, segments.length - 1);
				parentScopes.reverse();
			}

			result[resultLen++] = {
				scope,
				parentScopes,
				index: i,
				fontStyle,
				foreground: (foreground && foreground.substring(1)) || null,
				background: (background && background.substring(1)) || null,
      };
		}
	}

	return result;
}

export const FontStyle = {
	NotSet: -1,
	None: 0,
	Italic: 1,
	Bold: 2,
	Underline: 4
}