import { useCallback, useEffect, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import TodoWorkspace, {
  type TodoTask,
} from '../components/TodoWorkspace';
import { createBrowserTaskRepository } from '../lib/browserTaskRepository';

export const Route = createFileRoute('/')({
  component: TodoPage,
});

export function TodoPage() {
  const repository = useMemo(() => createBrowserTaskRepository(), []);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setTasks(await repository.list());
  }, [repository]);

  useEffect(() => {
    let mounted = true;

    repository
      .list()
      .then((loadedTasks) => {
        if (mounted) setTasks(loadedTasks);
      })
      .catch((cause: unknown) => {
        if (mounted) setError(errorMessage(cause));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [repository]);

  const runAction = useCallback(
    async (action: () => Promise<unknown>) => {
      setError(null);
      try {
        await action();
        await refreshTasks();
      } catch (cause) {
        setError(errorMessage(cause));
      }
    },
    [refreshTasks],
  );

  const addTask = useCallback(
    (title: string) => runAction(() => repository.add(title)),
    [repository, runAction],
  );

  const toggleTask = useCallback(
    (id: string) => runAction(() => repository.toggle(id)),
    [repository, runAction],
  );

  const deleteTask = useCallback(
    (id: string) => runAction(() => repository.remove(id)),
    [repository, runAction],
  );

  const clearCompleted = useCallback(
    () => runAction(() => repository.clearCompleted()),
    [repository, runAction],
  );

  return (
    <TodoWorkspace
      tasks={tasks}
      isLoading={isLoading}
      error={error}
      onAddTask={addTask}
      onToggleTask={toggleTask}
      onDeleteTask={deleteTask}
      onClearCompleted={clearCompleted}
    />
  );
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : 'Your local task list could not be saved. Please try again.';
}
