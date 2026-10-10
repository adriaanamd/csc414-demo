/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoWorkspace from '@/components/TodoWorkspace';

describe('Task Entry UI', () => {
  const defaultProps = {
    tasks: [],
    isLoading: false,
    error: null,
    onAddTask: vi.fn(),
    onToggleTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onClearCompleted: vi.fn(),
  };

  it('renders task input form, text field, and submit button', () => {
    render(<TodoWorkspace {...defaultProps} />);

    expect(screen.getByTestId('form-add-task')).toBeInTheDocument();
    expect(screen.getByTestId('input-new-task')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-task')).toBeInTheDocument();
  });

  it('keeps add button disabled when input is empty or whitespace only', () => {
    render(<TodoWorkspace {...defaultProps} />);

    const button = screen.getByTestId('button-add-task');
    const input = screen.getByTestId('input-new-task');

    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: '   ' } });
    expect(button).toBeDisabled();
  });

  it('enables add button when text is entered and invokes onAddTask on submit', () => {
    const onAddTask = vi.fn();
    render(<TodoWorkspace {...defaultProps} onAddTask={onAddTask} />);

    const input = screen.getByTestId('input-new-task');
    const button = screen.getByTestId('button-add-task');

    fireEvent.change(input, { target: { value: 'Prepare homework' } });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onAddTask).toHaveBeenCalledWith('Prepare homework');
    expect(input).toHaveValue('');
  });

  it('trims leading and trailing whitespace on submit', () => {
    const onAddTask = vi.fn();
    render(<TodoWorkspace {...defaultProps} onAddTask={onAddTask} />);

    const input = screen.getByTestId('input-new-task');
    const form = screen.getByTestId('form-add-task');

    fireEvent.change(input, { target: { value: '  Water plants  ' } });
    fireEvent.submit(form);

    expect(onAddTask).toHaveBeenCalledWith('Water plants');
  });
});
