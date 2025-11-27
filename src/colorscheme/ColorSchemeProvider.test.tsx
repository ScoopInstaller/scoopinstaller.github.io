import { act, render as rtlRender, screen } from '@testing-library/react';
import { type ReactElement, useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorSchemeContext } from './ColorSchemeContext';
import ColorSchemeProvider from './ColorSchemeProvider';
import { ColorSchemeType } from './ColorSchemeType';

// Test component that displays context values
function TestComponent() {
  const context = useContext(ColorSchemeContext);

  return (
    <div>
      <div data-testid="preferred-scheme">{context.preferedColorScheme}</div>
      <div data-testid="browser-scheme">{context.browserColorScheme}</div>
      <div data-testid="is-dark-mode">{context.isDarkMode.toString()}</div>
      <button type="button" onClick={context.toggleColorScheme}>
        Toggle
      </button>
    </div>
  );
}

const renderWithoutProviders = (ui: ReactElement) => rtlRender(ui);

describe('ColorSchemeProvider', () => {
  let mockDocumentRoot: { classList: { add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> } };
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mediaQueryListeners: ((event: { matches: boolean }) => void)[] = [];

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset media query listeners
    mediaQueryListeners = [];

    // Mock document.getElementsByTagName
    mockDocumentRoot = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };

    const mockHtmlCollection = {
      0: mockDocumentRoot as unknown as HTMLHtmlElement,
      length: 1,
      item: vi.fn(() => mockDocumentRoot as unknown as HTMLHtmlElement),
      namedItem: vi.fn(() => null),
    } as unknown as HTMLCollectionOf<HTMLHtmlElement>;

    vi.spyOn(document, 'getElementsByTagName').mockReturnValue(mockHtmlCollection);

    // Mock window.matchMedia
    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, handler: (event: { matches: boolean }) => void) => {
        if (event === 'change') {
          mediaQueryListeners.push(handler);
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial render', () => {
    it('should render with Auto mode and light browser preference', () => {
      mockMatchMedia.mockReturnValue({
        matches: false, // Light mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Auto.toString());
      expect(screen.getByTestId('browser-scheme')).toHaveTextContent(ColorSchemeType.Light.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });

    it('should render with Auto mode and dark browser preference', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Auto.toString());
      expect(screen.getByTestId('browser-scheme')).toHaveTextContent(ColorSchemeType.Dark.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });

    it('should load user preference from localStorage', () => {
      localStorage.setItem('preferred-color-scheme', ColorSchemeType.Dark.toString());

      mockMatchMedia.mockReturnValue({
        matches: false, // Browser prefers light
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      // User preference overrides browser preference
      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Dark.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });
  });

  describe('DOM class updates', () => {
    it('should add light class and remove dark class for light mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(mockDocumentRoot.classList.add).toHaveBeenCalledWith('light');
      expect(mockDocumentRoot.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should add dark class and remove light class for dark mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(mockDocumentRoot.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentRoot.classList.remove).toHaveBeenCalledWith('light');
    });
  });

  describe('localStorage persistence', () => {
    it('should save user preference to localStorage when not Auto', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      localStorage.setItem('preferred-color-scheme', ColorSchemeType.Dark.toString());

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(localStorage.getItem('preferred-color-scheme')).toBe(ColorSchemeType.Dark.toString());
    });

    it('should remove localStorage item when set to Auto', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(localStorage.getItem('preferred-color-scheme')).toBeNull();
    });
  });

  describe('toggle functionality', () => {
    it('should toggle from Auto to Dark when browser prefers Light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false, // Light mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Dark.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });

    it('should toggle from Auto to Light when browser prefers Dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Light.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });

    it('should toggle from Light to Auto when browser prefers Light', () => {
      localStorage.setItem('preferred-color-scheme', ColorSchemeType.Light.toString());

      mockMatchMedia.mockReturnValue({
        matches: false, // Light mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Auto.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });

    it('should toggle from Light to Dark when browser prefers Dark', () => {
      localStorage.setItem('preferred-color-scheme', ColorSchemeType.Light.toString());

      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Dark.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });

    it('should toggle from Dark to Light when browser prefers Light', () => {
      localStorage.setItem('preferred-color-scheme', ColorSchemeType.Dark.toString());

      mockMatchMedia.mockReturnValue({
        matches: false, // Light mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Light.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });

    it('should toggle from Dark to Auto when browser prefers Dark', () => {
      localStorage.setItem('preferred-color-scheme', ColorSchemeType.Dark.toString());

      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(screen.getByTestId('preferred-scheme')).toHaveTextContent(ColorSchemeType.Auto.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });
  });

  describe('media query listener', () => {
    it('should register and cleanup media query change listener', () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: vi.fn(),
      });

      const { unmount } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      // Verify cleanup on unmount
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update color scheme when media query changes', () => {
      let changeHandler: ((event: { matches: boolean }) => void) | null = null;

      mockMatchMedia.mockReturnValue({
        matches: false, // Initially Light mode
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn((event: string, handler: (event: { matches: boolean }) => void) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { rerender } = renderWithoutProviders(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      // Initially should be light mode (Auto follows browser)
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');

      // Simulate media query change to dark mode
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true });
        }
      });

      rerender(
        <ColorSchemeProvider>
          <TestComponent />
        </ColorSchemeProvider>
      );

      // Should now be dark mode
      expect(screen.getByTestId('browser-scheme')).toHaveTextContent(ColorSchemeType.Dark.toString());
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });
  });
});
