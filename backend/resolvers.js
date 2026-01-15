const db = require("./db");

module.exports = {
  Query: {
    tasks: async () => {
      const tasks = await db("tasks");
      return tasks.map(async (t) => {
        const result = await db("tasks").where("id", t.id).first();
        return result;
      });
    },
  },

  Mutation: {
    createTask: async (_, { title }) => {
      const inserted = await db("tasks").insert({ title, completed: false });
      return inserted[0];
    },

    toggleTask: async (_, { id }) => {
      const task = db("tasks").where("id", id).first();

      await db("tasks").where("id", id).update({ completed: !task.completed });

      return task;
    },
  },
};
