export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface FetchTasksResponse {
  data: {
    tasks: Task[];
  };
}

export interface CreateTaskResponse {
  data: {
    createTask: Task;
  };
}

export const fetchTasks = async (): Promise<FetchTasksResponse> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `{ tasks { id title completed } }`,
      variables: {},
    }),
  });

  if (!response.ok) {
    throw new Error("Error while connecting to the server");
  }

  const data: FetchTasksResponse = await response.json();
  return data;
};

export const createTask = async (title: string): Promise<CreateTaskResponse> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation ($title: String!) { createTask(title: $title) { id title } }`,
      variables: { title },
    }),
  });
  if (!response.ok) {
    throw new Error("Error while connecting to the server");
  }

  const data: CreateTaskResponse = await response.json();
  return data;
};

export const updateTask = async (id: string, completed: boolean) => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: `mutation ($id: ID!, $completed: Boolean!) { toggleTask(id: $id, completed: $completed) { id completed } }`,
      variables: { id, completed },
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Error while connecting to the server");
  }
  return response;
};
