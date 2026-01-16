/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("tasks").del();

  // Inserts seed entries
  await knex("tasks").insert([
    { title: "Learn GraphQL basics", completed: true },
    { title: "Set up Apollo Server", completed: true },
    { title: "Connect to PostgreSQL", completed: false },
    { title: "Build frontend with Next.js", completed: false },
    { title: "Debug and fix issues", completed: false },
  ]);
};
