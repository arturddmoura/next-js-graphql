
import {
  fetchTasks,
  createTask,
  updateTask,
  Task,
  FetchTasksResponse,
} from "../services/index";
import {
  QueryClientProvider,
  QueryClient,
  useQueryClient,
  useQuery,
  useMutation,
} from "@tanstack/react-query";

// Decided to break this up into smaller components for better readability and maintainability.
function Tasks() {
  const queryClient = useQueryClient();

  // Add data to the database
  // https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates#via-the-cache
  const { isPending, mutate } = useMutation({
    mutationFn: (title: string) => createTask(title),
    onMutate: async (title: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      
      queryClient.setQueryData(["tasks"], (old: FetchTasksResponse) => ({
        data: {
          tasks: [...old.data.tasks, { title, completed: false, id: "temp-id" }],
        },
      }));
      
      return { previousTasks }; // For rollback on error
    },
    onError: (error, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      alert(`Error: ${error}`);
    },
    onSettled: (data, error, variables, onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Update data in the database
  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, completed),
    onMutate: async (
      { id, completed }: { id: string; completed: boolean },
      context
    ) => {
      await context.client.cancelQueries({ queryKey: ["tasks", id] });

      const previousTask: FetchTasksResponse | undefined =
        context.client.getQueryData(["tasks", id]);

      queryClient.setQueryData(["tasks"], (old: FetchTasksResponse) => ({
        data: {
          tasks: old.data.tasks.map((task) =>
            task.id === id ? { ...task, completed: completed } : task
          ),
        },
      }));

      return { previousTask };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      alert(`Error updating task: ${error}`);
    },
  });

  // Get data from the database
  // Here there was a bug where useEffect was missing a dependency array, causing infinite re-renders.
  // I could just add the empty array, but I decided to refactor to use React Query for better data fetching and caching.
  const { isError, isLoading, data } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading tasks.</div>;
  }

  const tasks: Task[] | undefined = data?.data?.tasks;

  return (
    <div>
      <h1>Tasks</h1>
      <p>Click to complete the task</p>
      <button
        onClick={() => {
          const newTitle = prompt("Please input the name of your task");
          if (newTitle !== null) {
            mutate(newTitle);
          }
        }}
      >
        Add
      </button>

      {tasks?.map((t: Task) => (
        <div
          key={t.id}
          onClick={() =>
            updateMutation.mutate({ id: t.id, completed: !t.completed })
          }
          style={{ cursor: "pointer" }}
        >
          {t.title} — {t.completed ? "Done" : "Pending"}
        </div>
      ))}
    </div>
  );
}

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Tasks />
    </QueryClientProvider>
  );
}
