import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Circle, Moon, Plus, RotateCcw, Sun, Trash2 } from 'lucide-react';
import './TodoWorkspace.css';

export type TodoTask = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type TodoWorkspaceProps = {
  tasks: TodoTask[];
  isLoading: boolean;
  error: string | null;
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
};

type TaskFilter = 'all' | 'active' | 'completed';
type ThemePreference = 'system' | 'light' | 'dark';

const themeStorageKey = 'simple-todo-theme';

const filters: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'To do' },
  { id: 'completed', label: 'Done' },
];

export default function TodoWorkspace({
  tasks,
  isLoading,
  error,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}: TodoWorkspaceProps) {
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const isDark = themePreference === 'dark'
    || (themePreference === 'system' && systemPrefersDark);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(themeStorageKey);
    if (storedPreference === 'light' || storedPreference === 'dark') {
      setThemePreference(storedPreference);
    }

    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = () => setSystemPrefersDark(colorScheme.matches);
    updateSystemPreference();
    colorScheme.addEventListener('change', updateSystemPreference);

    return () => colorScheme.removeEventListener('change', updateSystemPreference);
  }, []);

  useEffect(() => {
    const resolvedTheme = isDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [isDark]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    }),
    [tasks, filter],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onAddTask(trimmedTitle);
    setTitle('');
  }

  function toggleTheme() {
    const nextPreference = isDark ? 'light' : 'dark';
    window.localStorage.setItem(themeStorageKey, nextPreference);
    setThemePreference(nextPreference);
  }

  const emptyCopy = filter === 'completed'
    ? { title: 'Nothing checked off yet.', detail: 'The finished things will gather here.' }
    : filter === 'active'
      ? { title: 'You’re all caught up.', detail: 'A little breathing room. Add something when it comes to mind.' }
      : { title: 'A little space to begin.', detail: 'Add a task above. You can figure out the rest as you go.' };

  return (
    <main
      className="todo-page"
      data-theme={isDark ? 'dark' : 'light'}
      data-testid="todo-workspace"
    >
      <section className="todo-shell" aria-labelledby="todo-heading">
        <button
          type="button"
          className="todo-theme-toggle"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
        >
          {isDark
            ? <Sun size={17} strokeWidth={1.8} aria-hidden="true" />
            : <Moon size={17} strokeWidth={1.8} aria-hidden="true" />}
        </button>
        <header className="todo-header">
          <div className="todo-mark" aria-hidden="true"><span /></div>
          <p className="todo-eyebrow">A little list for today</p>
          <h1 id="todo-heading">Simple To-Do</h1>
          <p className="todo-intro">Keep what matters in view. Let the rest wait.</p>
        </header>

        <form className="todo-entry" onSubmit={handleSubmit} data-testid="form-add-task">
          <label className="visually-hidden" htmlFor="new-task">Add a task</label>
          <input
            id="new-task"
            data-testid="input-new-task"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            maxLength={180}
            autoComplete="off"
          />
          <button
            type="submit"
            className="todo-add-button"
            data-testid="button-add-task"
            aria-label="Add task"
            disabled={!title.trim()}
          >
            <Plus size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Add</span>
          </button>
        </form>

        <div className="todo-toolbar">
          <div className="todo-filters" role="tablist" aria-label="Filter tasks">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`todo-filter${filter === item.id ? ' is-selected' : ''}`}
                onClick={() => setFilter(item.id)}
                data-testid={`filter-${item.id}`}
              >
                {item.label}
                <span className="filter-count" aria-label={`${item.id === 'all' ? tasks.length : item.id === 'active' ? activeCount : completedCount} tasks`}>
                  {item.id === 'all' ? tasks.length : item.id === 'active' ? activeCount : completedCount}
                </span>
              </button>
            ))}
          </div>
          <span className="todo-summary" data-testid="text-task-summary" aria-live="polite">
            {activeCount} {activeCount === 1 ? 'left' : 'left'}
          </span>
        </div>

        <section className="todo-list-panel" aria-label="Your tasks">
          {error && (
            <div className="todo-error" role="alert" data-testid="status-error">
              <span>{error}</span>
              <span className="todo-error-note">Your list is still here.</span>
            </div>
          )}

          {isLoading ? (
            <div className="todo-loading" aria-label="Loading tasks" data-testid="status-loading">
              {[0, 1, 2].map((line) => (
                <div className="skeleton-row" key={line}>
                  <span className="skeleton-circle" />
                  <span className={`skeleton-text skeleton-text-${line}`} />
                </div>
              ))}
            </div>
          ) : visibleTasks.length > 0 ? (
            <ul className="todo-list" data-testid="list-tasks">
              {visibleTasks.map((task) => (
                <li className={`todo-row${task.completed ? ' is-complete' : ''}`} key={task.id} data-testid={`task-${task.id}`}>
                  <button
                    type="button"
                    className="todo-check"
                    role="checkbox"
                    aria-checked={task.completed}
                    aria-label={`${task.completed ? 'Mark as not done' : 'Mark as done'}: ${task.title}`}
                    onClick={() => onToggleTask(task.id)}
                    data-testid={`button-toggle-${task.id}`}
                  >
                    {task.completed
                      ? <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                      : <Circle size={19} strokeWidth={1.6} aria-hidden="true" />}
                  </button>
                  <span className="todo-task-title" data-testid={`text-task-title-${task.id}`}>{task.title}</span>
                  <button
                    type="button"
                    className="todo-delete"
                    aria-label={`Delete ${task.title}`}
                    onClick={() => onDeleteTask(task.id)}
                    data-testid={`button-delete-${task.id}`}
                  >
                    <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="todo-empty" data-testid="empty-state">
              <div className="empty-orbit" aria-hidden="true"><span /><span /><span /></div>
              <p className="empty-title">{emptyCopy.title}</p>
              <p className="empty-detail">{emptyCopy.detail}</p>
            </div>
          )}
        </section>

        <footer className="todo-footer">
          <span className="todo-footer-note" data-testid="text-footer-count">
            {tasks.length === 0
              ? 'One thing at a time.'
              : `${completedCount} of ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} finished`}
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              className="todo-clear-button"
              onClick={onClearCompleted}
              data-testid="button-clear-completed"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Clear completed
            </button>
          )}
        </footer>
      </section>
      <p className="todo-signoff">Small steps count.</p>
    </main>
  );
}
