/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoWorkspace, { type TodoTask } from '@/components/TodoWorkspace';

describe('Task List UI', () => {
  const sampleTasks: TodoTask[] = [
    { id: 't-1', title: 'Buy milk', completed: false, createdAt: 1000 },
    { id: 't-2', title: 'Read book', completed: true, createdAt: 2000 },
    { id: 't-3', title: 'Exercise', completed: false, createdAt: 3000 },
  ];

  const defaultProps = {
    tasks: sampleTasks,
    isLoading: false,
    error: null,
    onAddTask: vi.fn(),
    onToggleTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onClearCompleted: vi.fn(),
  };

  it('renders all tasks in list with their titles and buttons', () => {
    render(<TodoWorkspace {...defaultProps} />);

    expect(screen.getByTestId('list-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('task-t-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-t-2')).toBeInTheDocument();
    expect(screen.getByTestId('task-t-3')).toBeInTheDocument();

    expect(screen.getByTestId('text-task-title-t-1')).toHaveTextContent('Buy milk');
    expect(screen.getByTestId('text-task-title-t-2')).toHaveTextContent('Read book');
  });

  it('calls onToggleTask when checkbox toggle is clicked', () => {
    const onToggleTask = vi.fn();
    render(<TodoWorkspace {...defaultProps} onToggleTask={onToggleTask} />);

    fireEvent.click(screen.getByTestId('button-toggle-t-1'));
    expect(onToggleTask).toHaveBeenCalledWith('t-1');
  });

  it('calls onDeleteTask when delete button is clicked', () => {
    const onDeleteTask = vi.fn();
    render(<TodoWorkspace {...defaultProps} onDeleteTask={onDeleteTask} />);

    fireEvent.click(screen.getByTestId('button-delete-t-2'));
    expect(onDeleteTask).toHaveBeenCalledWith('t-2');
  });

  it('filters tasks when clicking filter tabs', () => {
    render(<TodoWorkspace {...defaultProps} />);

    // Click 'active' tab
    fireEvent.click(screen.getByTestId('filter-active'));
    expect(screen.getByTestId('task-t-1')).toBeInTheDocument();
    expect(screen.queryByTestId('task-t-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-t-3')).toBeInTheDocument();

    // Click 'completed' tab
    fireEvent.click(screen.getByTestId('filter-completed'));
    expect(screen.queryByTestId('task-t-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-t-2')).toBeInTheDocument();
    expect(screen.queryByTestId('task-t-3')).not.toBeInTheDocument();

    // Click 'all' tab
    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getByTestId('task-t-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-t-2')).toBeInTheDocument();
    expect(screen.getByTestId('task-t-3')).toBeInTheDocument();
  });

  it('displays clear completed button when completed tasks exist and handles click', () => {
    const onClearCompleted = vi.fn();
    render(<TodoWorkspace {...defaultProps} onClearCompleted={onClearCompleted} />);

    const clearButton = screen.getByTestId('button-clear-completed');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(onClearCompleted).toHaveBeenCalledTimes(1);
  });

  it('does not display clear completed button when no tasks are completed', () => {
    const activeOnly: TodoTask[] = [
      { id: 't-1', title: 'Buy milk', completed: false, createdAt: 1000 },
    ];
    render(<TodoWorkspace {...defaultProps} tasks={activeOnly} />);

    expect(screen.queryByTestId('button-clear-completed')).not.toBeInTheDocument();
  });
});
