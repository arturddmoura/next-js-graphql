const { gql } = require("apollo-server-express");

module.exports = gql`
  type Task {
    id: ID!
    title: String!
    completed: Boolean
  }

  type Query {
    tasks: [Task]
  }

  # Added the completed field to the toggleTask mutation, as it was missing and the backend was not updating the correct value.
  type Mutation {
    createTask(title: String!): Task
    toggleTask(id: ID!, completed: Boolean!): Task
  }
`;
