## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine
- NodeJS
- Npm (or other NodeJS package manager)

### Running the Application

1. Clone this repository
2. Run the following command:

```bash
docker compose up 
```

3. Create the database tables
```bash
cd backend
npm run migrate
```

4. Seed your database with initial data
```bash
npm run seed
```

5. Start backend service 
```bash
> npm install
> npm run dev
```

6. Start frontend service 
```bash
> cd frontend
> npm install
> npm run dev
```

7. Open your browser:
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql

## Project Structure

```
├── backend/
│   ├── server.js       # Express + Apollo Server
│   ├── db.js           # Database connection
│   ├── schema.js       # GraphQL schema
│   ├── resolvers.js    # GraphQL resolvers
│   ├── knexfile.js     # Knex configuration
│   ├── migrations/     # Database migrations
│   └── seeds/          # Seed data
├── frontend/
│   ├── pages/
│   │   └── index.tsx   # Main page
│   ├── services/
│   │   └── index.tsx   # API services
│   ├── next.config.js  # Next.js configuration
│   └── tsconfig.json   # TypeScript configuration
└── docker-compose.yml
```

## Your Tasks

### 1. Find and Fix Bugs

The application has several bugs in both the backend and frontend. Your task is to:

- Identify the bugs
- Fix them
- Explain why they were bugs

### 2. Make Improvements

After fixing the bugs, make at least **two improvements** from the following:

- Remove inefficient queries (N+1 problems)
- Add validation and error handling
- Fix database insert return values
- Proper async/await handling
- Frontend re-render optimization
- Optimistic UI updates or proper refetching

### 3. Explain Trade-offs

As you work, explain your thought process:

- What are you prioritizing and why?
```
Before starting, I had some trouble with the setup, so I decided to update the documentation to make sure other developers can run the project smoothly.

The first thing I prioritized was the bug in the way we were getting the information from the database, the data was not returned in the correct order, there was an issue where every record was selected twice, and the frontend had a mistake in its usage of UseEffect, creating infinite re-renders and loops that added extra load to the database.

With react-query, I fixed the re-renders in the frontend, and also created a better user experience with the optimistic UI updates and its built-in caching.

I also added type safety to the frontend, creating a separate file for the services and the types, and then using them in the components. This made the code more readable and maintainable.

I also added some simple error validation, in the form of Alerts that pop up when there is an error in the API calls, but that could be greatly improved, with clearer messages of what went wrong.
```

- What trade-offs are you making?
```
I ended up focusing on fixing the major mistakes in the code, and improving the user experience, in detriment of adding more security or database optimization that are not directly related to the functionality of the application.
```

- How would you approach this differently in a production environment?
```
In a production environment, I would probably start with the authentication and authorization, then add the connection pooling and error handling in the database connection, then add the validation and error handling in the backend.
The client-facing changes I made this would be done after all that is done, and then add the caching layer, and then add the optimistic UI updates.
```

## Expected Deliverables

1. Working code with bugs fixed
2. At least 2 meaningful improvements
3. Clear explanation of changes made

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, Apollo Server
- **Database**: PostgreSQL with KnexJS
- **Infrastructure**: Docker, Docker Compose

Good luck!
