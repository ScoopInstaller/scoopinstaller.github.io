import { useCallback, useLayoutEffect, useState } from 'react';

import { ColorSchemeContext, defaultState, IColorSchemeContext } from './ColorSchemeContext';
import { ColorSchemeType } from './ColorSchemeType';

const ColorSchemeProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const CLASS_NAME_LIGHT = 'light';
  const CLASS_NAME_DARK = 'dark';
  const PREFERRED_COLOR_SCHEME_STORAGE = 'preferred-color-scheme';

  const [contextState, setContextState] = useState<IColorSchemeContext>(defaultState);

  const [browserColorSchemePreference, setBrowserColorSchemePreference] = useState<ColorSchemeType>();
  const [userColorSchemePreference, setUserColorSchemePreference] = useState<ColorSchemeType | undefined>();

  const toggleColorScheme = useCallback((): void => {
    switch (userColorSchemePreference) {
      case ColorSchemeType.Auto:
        setUserColorSchemePreference(
          browserColorSchemePreference === ColorSchemeType.Light ? ColorSchemeType.Dark : ColorSchemeType.Light
        );
        break;
      case ColorSchemeType.Light:
        setUserColorSchemePreference(
          browserColorSchemePreference === ColorSchemeType.Light ? ColorSchemeType.Auto : ColorSchemeType.Dark
        );
        break;
      case ColorSchemeType.Dark:
        setUserColorSchemePreference(
          browserColorSchemePreference === ColorSchemeType.Dark ? ColorSchemeType.Auto : ColorSchemeType.Light
        );
        break;
    }
  }, [userColorSchemePreference, browserColorSchemePreference]);

  const toColorSchemeType = (value: boolean | string | null): ColorSchemeType => {
    if (value === null) {
      return ColorSchemeType.Auto;
    }

    if (typeof value == 'boolean') {
      return value ? ColorSchemeType.Dark : ColorSchemeType.Light;
    }

    return parseInt(value) as ColorSchemeType;
  };

  const updateUI = (colorSchemePreference: ColorSchemeType) => {
    const documentRoot = document.getElementsByTagName('html')[0];
    if (colorSchemePreference === ColorSchemeType.Dark) {
      documentRoot.classList.remove(CLASS_NAME_LIGHT);
      documentRoot.classList.add(CLASS_NAME_DARK);
    } else {
      documentRoot.classList.remove(CLASS_NAME_DARK);
      documentRoot.classList.add(CLASS_NAME_LIGHT);
    }
  };

  useLayoutEffect(() => {
    if (userColorSchemePreference === undefined || browserColorSchemePreference === undefined) {
      // Ensure userColorSchemePreference/browserColorSchemePreference are assigned
      // before performing any update to avoid any incorrect color scheme change
      return;
    }

    // Select and store user preferred color scheme or fallback to the browser choice
    let preferedColorScheme: ColorSchemeType;
    if (userColorSchemePreference === ColorSchemeType.Auto) {
      preferedColorScheme = browserColorSchemePreference;
      localStorage.removeItem(PREFERRED_COLOR_SCHEME_STORAGE);
    } else {
      preferedColorScheme = userColorSchemePreference;
      localStorage.setItem(PREFERRED_COLOR_SCHEME_STORAGE, userColorSchemePreference.toString());
    }

    updateUI(preferedColorScheme);

    setContextState({
      preferedColorScheme: userColorSchemePreference,
      browserColorScheme: browserColorSchemePreference,
      isDarkMode: preferedColorScheme === ColorSchemeType.Dark,
      toggleColorScheme,
    });
  }, [browserColorSchemePreference, userColorSchemePreference, toggleColorScheme]);

  useLayoutEffect(() => {
    const browserColorSchemeMediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    browserColorSchemeMediaQueryList.addEventListener('change', (e) => {
      setBrowserColorSchemePreference(toColorSchemeType(e.matches));
    });

    setBrowserColorSchemePreference(toColorSchemeType(browserColorSchemeMediaQueryList.matches));
    setUserColorSchemePreference(toColorSchemeType(localStorage.getItem(PREFERRED_COLOR_SCHEME_STORAGE)));
  }, []);

  return <ColorSchemeContext.Provider value={contextState}>{props.children}</ColorSchemeContext.Provider>;
};

export default ColorSchemeProvider;
