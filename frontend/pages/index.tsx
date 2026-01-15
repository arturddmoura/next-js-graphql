import { useState } from "react";
import { fetchTasks, createTask, updateTask, Task } from "../services/index";
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
  const [newTask, setNewTask] = useState("");

  // Add data to the database
  const { isPending, mutate } = useMutation({
    mutationFn: (title: string) => createTask(title),
    onSettled: async () => {
      // Invalidate and refetch, wait for it to complete
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask("");
    },
    onError: (error) => {
      alert(`Error updating task: ${error}`);
      setNewTask("");
    },
  });

  // Update data in the database
  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, completed),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
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
            setNewTask(newTitle);
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
      {isPending && <li style={{ opacity: 0.5 }}>{newTask} — Pending</li>}
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
