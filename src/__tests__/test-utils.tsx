import { type RenderOptions, render as rtlRender } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import ColorSchemeProvider from '../colorscheme/ColorSchemeProvider';

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  withProviders?: boolean;
};

// Custom render function that wraps components with necessary providers
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { withProviders = true, ...renderOptions } = options;

  if (!withProviders) {
    return rtlRender(ui, renderOptions);
  }

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <ColorSchemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ColorSchemeProvider>
    ),
    ...renderOptions,
  });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the render method with our custom one
export { customRender as render };
