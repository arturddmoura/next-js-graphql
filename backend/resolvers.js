const db = require("./db");

// Added a small delay to simulate network latency for better testing of loading states in the frontend.
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  // Here the backend API was not returning the results correctly, it wasn't sorted by id or anything
  // and this caused issues where the items would change around in the frontend and not match the expected order.
  // Also removed the redundant select that was causing an unnecessary performance hit.
  Query: {
    tasks: async () => {
      await delay(500);
      return await db("tasks").orderBy('id');
    },
  },

  Mutation: {
    createTask: async (_, { title }) => {
      // Here the return value was not correct, it was returning an ID instead of full object.
      await delay(500);
      const inserted = await db("tasks").insert({ title, completed: false }).returning("*");
      return inserted[0];
    },

    toggleTask: async (_, { id, completed }) => {
      // Removed unnecessary select before update, which was causing performance issues.
      // Now the correct values already come from the frontend.
      // There was also a bug where the value would not update correctly when changing to Done to Pending.
      // Now it works both ways, you can mark as completed and unmark as well.
      await delay(500);
      const updatedTask = await db("tasks").where("id", id).update({ completed: completed }).returning("*");
      return updatedTask[0];
    },
  },
};
