import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ColorSchemeProvider } from '../colorscheme/ColorSchemeProvider';

// Custom render function that wraps components with necessary providers
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ColorSchemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ColorSchemeProvider>
    ),
    ...options,
  });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the render method with our custom one
export { customRender as render };
