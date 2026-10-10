/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoWorkspace from '@/components/TodoWorkspace';

describe('Landing Page UI', () => {
  const defaultProps = {
    tasks: [],
    isLoading: false,
    error: null,
    onAddTask: vi.fn(),
    onToggleTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onClearCompleted: vi.fn(),
  };

  it('renders landing page hero header and branding', () => {
    render(<TodoWorkspace {...defaultProps} />);

    expect(screen.getByTestId('todo-workspace')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Simple To-Do/i })).toBeInTheDocument();
    expect(screen.getByText('A little list for today')).toBeInTheDocument();
    expect(screen.getByText('Keep what matters in view. Let the rest wait.')).toBeInTheDocument();
  });

  it('renders empty state when no tasks are present', () => {
    render(<TodoWorkspace {...defaultProps} />);

    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('A little space to begin.')).toBeInTheDocument();
    expect(screen.getByText(/Add a task above/i)).toBeInTheDocument();
  });

  it('toggles theme between light and dark when theme button is clicked', () => {
    render(<TodoWorkspace {...defaultProps} />);

    const themeButton = screen.getByTestId('button-toggle-theme');
    expect(themeButton).toBeInTheDocument();

    const initialAria = themeButton.getAttribute('aria-pressed');
    fireEvent.click(themeButton);
    const toggledAria = themeButton.getAttribute('aria-pressed');

    expect(toggledAria).not.toBe(initialAria);
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(<TodoWorkspace {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('status-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  it('renders error alert banner when error is provided', () => {
    const errorMessage = 'Failed to connect to local database';
    render(<TodoWorkspace {...defaultProps} error={errorMessage} />);

    const errorAlert = screen.getByTestId('status-error');
    expect(errorAlert).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders summary and footer note for task counts', () => {
    const tasks = [
      { id: '1', title: 'Task 1', completed: false, createdAt: 1 },
      { id: '2', title: 'Task 2', completed: true, createdAt: 2 },
    ];

    render(<TodoWorkspace {...defaultProps} tasks={tasks} />);

    expect(screen.getByTestId('text-task-summary')).toHaveTextContent('1 left');
    expect(screen.getByTestId('text-footer-count')).toHaveTextContent('1 of 2 tasks finished');
  });
});
