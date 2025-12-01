import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  const setup = (overrides: Partial<ComponentProps<typeof SearchBar>> = {}) => {
    const props = {
      query: '',
      onQueryChange: vi.fn(),
      onSubmit: vi.fn(),
      ...overrides,
    };

    return {
      ...render(<SearchBar {...props} />),
      props,
    };
  };

  it('focuses the input on mount', () => {
    setup();

    expect(screen.getByPlaceholderText('Search an app')).toHaveFocus();
  });

  describe('debounce behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('updates the query and eventually submits after the debounce', () => {
      const { props } = setup();
      const input = screen.getByPlaceholderText('Search an app');

      fireEvent.change(input, { target: { value: 'git' } });

      expect(props.onQueryChange).toHaveBeenCalledWith('git');

      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(props.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('clears pending submissions when the component unmounts', () => {
      const { unmount, props } = setup();
      const input = screen.getByPlaceholderText('Search an app');

      fireEvent.change(input, { target: { value: 'hello' } });
      unmount();

      act(() => {
        vi.runAllTimers();
      });

      expect(props.onSubmit).not.toHaveBeenCalled();
    });

    it('submits immediately via form submission and cancels the pending timer', () => {
      const { props } = setup();
      const input = screen.getByPlaceholderText('Search an app');

      fireEvent.change(input, { target: { value: 'node' } });
      fireEvent.submit(input.closest('form') as HTMLFormElement);

      expect(props.onSubmit).toHaveBeenCalledTimes(1);

      act(() => {
        vi.runAllTimers();
      });

      expect(props.onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
