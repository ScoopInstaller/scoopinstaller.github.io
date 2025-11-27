import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CopyToClipboardButton from './CopyToClipboardButton';

describe('CopyToClipboardButton', () => {
  const renderButton = (overrides: Partial<ComponentProps<typeof CopyToClipboardButton>> = {}) => {
    const props = {
      title: 'Copy command',
      variant: 'outline-primary',
      className: 'copy-button',
      onClick: vi.fn(),
      ...overrides,
    };

    return {
      ...render(<CopyToClipboardButton {...props} />),
      props,
    };
  };

  it('invokes the provided onClick and disables itself temporarily', () => {
    vi.useFakeTimers();
    const { props } = renderButton();
    const button = screen.getByRole('button', { name: /copy command/i });

    fireEvent.click(button);

    expect(props.onClick).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(button).not.toBeDisabled();
    vi.useRealTimers();
  });

  it('allows subsequent copies after the notification delay', () => {
    vi.useFakeTimers();
    const { props } = renderButton();
    const button = screen.getByRole('button', { name: /copy command/i });

    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    fireEvent.click(button);
    expect(props.onClick).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
