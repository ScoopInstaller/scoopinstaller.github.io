import React from 'react';

import { ColorSchemeType } from './ColorSchemeType';

export interface IColorSchemeContext {
  colorScheme: ColorSchemeType;
  isDarkMode: boolean;
  toggleColorScheme: () => void;
}

export const defaultState = {
  colorScheme: ColorSchemeType.Auto,
  isDarkMode: false,
  toggleColorScheme: () => {},
};

export const ColorSchemeContext = React.createContext<IColorSchemeContext>(defaultState);
