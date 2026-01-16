import { useEffect, useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ tasks { id title completed } }`,
      }),
    })
      .then((res) => res.json())
      .then((data) => setTasks(data.data.tasks));
  });

  const addTask = async () => {
    const title = prompt("Task?");
    await fetch("/api/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: `mutation { createTask(title: "${title}") { id title } }`,
      }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const toggleTask = async (id: string) => {
    await fetch("/api/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: `mutation { toggleTask(id: "${id}") { id completed } }`,
      }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <div>
      <h1>Tasks</h1>
      <p>Click to complete the task</p>
      <button onClick={addTask}>Add</button>

      {tasks?.map((t: any) => (
        <div
          key={t.id}
          onClick={() => toggleTask(t.id)}
          style={{ cursor: "pointer" }}
        >
          {t.title} — {t.completed ? "Done" : "Pending"}
        </div>
      ))}
    </div>
  );
}
