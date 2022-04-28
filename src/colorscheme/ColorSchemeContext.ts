import React from 'react';

import { ColorSchemeType } from './ColorSchemeType';

export interface IColorSchemeContext {
  preferedColorScheme: ColorSchemeType;
  browserColorScheme: ColorSchemeType;
  isDarkMode: boolean;
  toggleColorScheme: () => void;
}

export const defaultState = {
  preferedColorScheme: ColorSchemeType.Auto,
  browserColorScheme: ColorSchemeType.Auto,
  isDarkMode: false,
  toggleColorScheme: () => {},
};

export const ColorSchemeContext = React.createContext<IColorSchemeContext>(defaultState);
