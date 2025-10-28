/**
 * Custom hook for task operations
 * Uses tRPC for type-safe task management with inferred types
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import type { AppRouter } from '@/lib/trpc/router';
import type { inferRouterInputs } from '@trpc/server';

// Infer types from tRPC router - no need for centralized type definitions!
type RouterInput = inferRouterInputs<AppRouter>;
type CreateTaskInput = RouterInput['tasks']['create'];
type UpdateTaskInput = RouterInput['tasks']['update'];
type TaskListFilters = RouterInput['tasks']['list'];

export function useTasks(filters?: TaskListFilters) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Fetch tasks with server-side filtering (completed, priority, search)
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = trpc.tasks.list.useQuery(filters, {
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
    enabled: !!filters?.organizationId,
  });

  // Create task mutation
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    },
  });

  // Update task mutation
  const updateTask = trpc.tasks.update.useMutation({
    onMutate: (data) => {
      const previousData = utils.tasks.list.getData(filters);

      utils.tasks.list.setData(filters, (old) => {
        if (!old) return old;
        return old.map((task) => {
          if (task.id !== data.id) return task;
          return {
            ...task,
            ...data,
          };
        });
      });

      return { previousData };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      refetch();
    },
    onError: (error, _data, context) => {
      if (context?.previousData) {
        utils.tasks.list.setData(filters, context.previousData);
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  // Delete task mutation
  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        variant: 'destructive',
      });
    },
  });

  return {
    tasks: tasks ?? [],
    isLoading,
    error,
    createTask: (input: CreateTaskInput) => createTask.mutateAsync(input),
    updateTask: (input: UpdateTaskInput) => updateTask.mutateAsync(input),
    deleteTask: (id: string) => deleteTask.mutateAsync({ id }),
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
  };
}
