import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CopyButton } from './CopyButton';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const labels = { copyLabel: 'COPY_X', copiedLabel: 'COPIED_X' };

describe('CopyButton', () => {
  test('is named from the labels it is given, not from the component', () => {
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    expect(screen.getByRole('button', { name: 'COPY_X LABEL_X' })).toBeInTheDocument();
  });

  test('writes the value to the clipboard and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    await user.click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('VALUE_X');
    expect(await screen.findByText('COPIED_X')).toBeInTheDocument();
  });

  test('leaves the button usable when the clipboard rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const user = userEvent.setup();
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeEnabled();
  });

  test('clears the confirmation about two seconds after copying', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
    });
    expect(screen.getByText('COPIED_X')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('COPIED_X')).not.toBeInTheDocument();
  });

  test('cannot update state after unmount once the timer would fire', async () => {
    vi.useFakeTimers();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const { unmount } = render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(consoleError).not.toHaveBeenCalled();
  });
});
