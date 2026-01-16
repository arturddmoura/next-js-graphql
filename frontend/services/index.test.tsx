import { fetchTasks, createTask, updateTask } from './index';

describe('Services', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = {
        data: {
          tasks: [
            { id: '1', title: 'Task 1', completed: false },
            { id: '2', title: 'Task 2', completed: true },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      });

      const result = await fetchTasks();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{ tasks { id title completed } }`,
          variables: {},
        }),
      });
      expect(result).toEqual(mockTasks);
    });

    it('should throw an error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchTasks()).rejects.toThrow('Error while connecting to the server');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchTasks()).rejects.toThrow('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return empty tasks array when no tasks exist', async () => {
      const mockEmptyResponse = {
        data: {
          tasks: [],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyResponse,
      });

      const result = await fetchTasks();

      expect(result).toEqual(mockEmptyResponse);
      expect(result.data.tasks).toHaveLength(0);
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockResponse = {
        data: {
          createTask: { id: '3', title: 'New Task' },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createTask('New Task');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation ($title: String!) { createTask(title: $title) { id title } }`,
          variables: { title: 'New Task' },
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(createTask('New Task')).rejects.toThrow('Error while connecting to the server');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty title', async () => {
      const mockResponse = {
        data: {
          createTask: { id: '4', title: '' },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createTask('');

      expect(result.data.createTask.title).toBe('');
    });

    it('should handle special characters in title', async () => {
      const specialTitle = 'Task with "quotes" and \'apostrophes\'';
      const mockResponse = {
        data: {
          createTask: { id: '5', title: specialTitle },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createTask(specialTitle);

      expect(result.data.createTask.title).toBe(specialTitle);
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            toggleTask: { id: '1', completed: true },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateTask('1', true);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: `mutation ($id: ID!, $completed: Boolean!) { toggleTask(id: $id, completed: $completed) { id completed } }`,
          variables: { id: '1', completed: true },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should toggle task to incomplete', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            toggleTask: { id: '2', completed: false },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateTask('2', false);

      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: `mutation ($id: ID!, $completed: Boolean!) { toggleTask(id: $id, completed: $completed) { id completed } }`,
          variables: { id: '2', completed: false },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(updateTask('999', true)).rejects.toThrow('Error while connecting to the server');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors during update', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(updateTask('1', true)).rejects.toThrow('Connection timeout');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle string IDs correctly', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            toggleTask: { id: 'abc-123', completed: true },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await updateTask('abc-123', true);

      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: `mutation ($id: ID!, $completed: Boolean!) { toggleTask(id: $id, completed: $completed) { id completed } }`,
          variables: { id: 'abc-123', completed: true },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});

