const resolvers = require("./resolvers");

// Mock the database module
jest.mock("./db");
const db = require("./db");

// Mock the delay function to speed up tests
jest.mock("./db", () => {
  const mockDb = jest.fn();
  return mockDb;
});

describe("GraphQL Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Query.tasks", () => {
    it("should return all tasks ordered by id", async () => {
      const mockTasks = [
        { id: 1, title: "Task 1", completed: false },
        { id: 2, title: "Task 2", completed: true },
        { id: 3, title: "Task 3", completed: false },
      ];

      const mockOrderBy = jest.fn().mockResolvedValue(mockTasks);
      db.mockReturnValue({ orderBy: mockOrderBy });

      const promise = resolvers.Query.tasks();
      
      // Fast-forward the delay
      jest.advanceTimersByTime(300);
      
      const result = await promise;

      expect(db).toHaveBeenCalledWith("tasks");
      expect(mockOrderBy).toHaveBeenCalledWith("id");
      expect(result).toEqual(mockTasks);
    });

    it("should return empty array when no tasks exist", async () => {
      const mockOrderBy = jest.fn().mockResolvedValue([]);
      db.mockReturnValue({ orderBy: mockOrderBy });

      const promise = resolvers.Query.tasks();
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      const mockOrderBy = jest.fn().mockRejectedValue(new Error("Database error"));
      db.mockReturnValue({ orderBy: mockOrderBy });

      const promise = resolvers.Query.tasks();
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow("Database error");
    });
  });

  describe("Mutation.createTask", () => {
    it("should create a new task with completed set to false", async () => {
      const newTask = { id: 1, title: "New Task", completed: false };
      
      const mockReturning = jest.fn().mockResolvedValue([newTask]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      db.mockReturnValue({ insert: mockInsert });

      const promise = resolvers.Mutation.createTask(null, { title: "New Task" });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(db).toHaveBeenCalledWith("tasks");
      expect(mockInsert).toHaveBeenCalledWith({ title: "New Task", completed: false });
      expect(mockReturning).toHaveBeenCalledWith("*");
      expect(result).toEqual(newTask);
    });

    it("should return the full task object, not just the ID", async () => {
      const newTask = { id: 5, title: "Test Task", completed: false };
      
      const mockReturning = jest.fn().mockResolvedValue([newTask]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      db.mockReturnValue({ insert: mockInsert });

      const promise = resolvers.Mutation.createTask(null, { title: "Test Task" });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("completed");
      expect(result.id).toBe(5);
    });

    it("should handle empty title", async () => {
      const newTask = { id: 1, title: "", completed: false };
      
      const mockReturning = jest.fn().mockResolvedValue([newTask]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      db.mockReturnValue({ insert: mockInsert });

      const promise = resolvers.Mutation.createTask(null, { title: "" });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(mockInsert).toHaveBeenCalledWith({ title: "", completed: false });
      expect(result.title).toBe("");
    });

    it("should handle database errors during creation", async () => {
      const mockReturning = jest.fn().mockRejectedValue(new Error("Insert failed"));
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      db.mockReturnValue({ insert: mockInsert });

      const promise = resolvers.Mutation.createTask(null, { title: "New Task" });
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow("Insert failed");
    });
  });

  describe("Mutation.toggleTask", () => {
    it("should toggle task to completed", async () => {
      const updatedTask = { id: 1, title: "Task 1", completed: true };
      
      const mockReturning = jest.fn().mockResolvedValue([updatedTask]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      db.mockReturnValue({ where: mockWhere });

      const promise = resolvers.Mutation.toggleTask(null, { id: "1", completed: true });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(db).toHaveBeenCalledWith("tasks");
      expect(mockWhere).toHaveBeenCalledWith("id", "1");
      expect(mockUpdate).toHaveBeenCalledWith({ completed: true });
      expect(mockReturning).toHaveBeenCalledWith("*");
      expect(result).toEqual(updatedTask);
    });

    it("should toggle task to incomplete", async () => {
      const updatedTask = { id: 2, title: "Task 2", completed: false };

      const mockReturning = jest.fn().mockResolvedValue([updatedTask]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      db.mockReturnValue({ where: mockWhere });

      const promise = resolvers.Mutation.toggleTask(null, { id: "2", completed: false });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(mockUpdate).toHaveBeenCalledWith({ completed: false });
      expect(result.completed).toBe(false);
    });

    it("should work with both string and number IDs", async () => {
      const updatedTask = { id: 123, title: "Task", completed: true };

      const mockReturning = jest.fn().mockResolvedValue([updatedTask]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      db.mockReturnValue({ where: mockWhere });

      const promise = resolvers.Mutation.toggleTask(null, { id: 123, completed: true });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(mockWhere).toHaveBeenCalledWith("id", 123);
      expect(result).toEqual(updatedTask);
    });

    it("should handle non-existent task ID", async () => {
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      db.mockReturnValue({ where: mockWhere });

      const promise = resolvers.Mutation.toggleTask(null, { id: "999", completed: true });
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toBeUndefined();
    });

    it("should handle database errors during update", async () => {
      const mockReturning = jest.fn().mockRejectedValue(new Error("Update failed"));
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      db.mockReturnValue({ where: mockWhere });

      const promise = resolvers.Mutation.toggleTask(null, { id: "1", completed: true });
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow("Update failed");
    });

    it("should only update the completed field, not the title", async () => {
      const updatedTask = { id: 1, title: "Original Title", completed: true };

      const mockReturning = jest.fn().mockResolvedValue([updatedTask]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      db.mockReturnValue({ where: mockWhere });

      const promise = resolvers.Mutation.toggleTask(null, { id: "1", completed: true });
      jest.advanceTimersByTime(300);
      await promise;

      // Verify only completed field is in the update
      expect(mockUpdate).toHaveBeenCalledWith({ completed: true });
      expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ title: expect.anything() }));
    });
  });

  describe("Delay functionality", () => {
    it("should delay for 300ms before returning results", async () => {
      const mockOrderBy = jest.fn().mockResolvedValue([]);
      db.mockReturnValue({ orderBy: mockOrderBy });

      const promise = resolvers.Query.tasks();

      // Should not resolve immediately
      jest.advanceTimersByTime(100);
      expect(mockOrderBy).not.toHaveBeenCalled();

      // Should resolve after 300ms
      jest.advanceTimersByTime(200);
      await promise;

      expect(mockOrderBy).toHaveBeenCalled();
    });
  });
});

